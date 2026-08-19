import { NextRequest, NextResponse } from "next/server";
import { chunkAsins, getItemsAvailability } from "@/lib/paapi";
import { defaultOTSPackingList } from "@/lib/packing-list-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Internal diagnostic endpoint — audits every Amazon affiliate link on the
 * site via the Product Advertising API instead of scraping product pages
 * (which gets bot-blocked). Not linked from the UI.
 *
 * Optional protection: if AUDIT_API_SECRET is set in the environment, this
 * route requires a matching `x-audit-key` header. If unset, it's open.
 */
export async function GET(req: NextRequest) {
  const requiredKey = process.env.AUDIT_API_SECRET;
  if (requiredKey && req.headers.get("x-audit-key") !== requiredKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const nameByAsin = new Map<string, string>();
  for (const item of defaultOTSPackingList) {
    if (item.amazon_asin) nameByAsin.set(item.amazon_asin, item.item_name);
  }
  const asins = [...nameByAsin.keys()];

  const batches = chunkAsins(asins, 10);
  const dead: Array<{ asin: string; name: string; error?: string }> = [];
  const unavailable: Array<{ asin: string; name: string; message?: string }> = [];
  const unverified: Array<{ asin: string; name: string }> = [];
  const ok: string[] = [];
  const requestFailures: Array<{ batch: number; status: number; errors: unknown; sample?: unknown }> = [];

  for (let i = 0; i < batches.length; i++) {
    let result;
    try {
      result = await getItemsAvailability(batches[i]);
    } catch (e) {
      return NextResponse.json(
        {
          error: "PA-API call threw before returning a response",
          detail: e instanceof Error ? e.message : String(e),
        },
        { status: 500 },
      );
    }

    // Creators API can return HTTP 200 with a mix of successful items and
    // per-item errors in the same batch — a non-empty requestErrors list
    // does NOT mean the whole batch is unusable. Log it for visibility,
    // but classify strictly per item below.
    if (!result.ok || result.requestErrors.length > 0) {
      requestFailures.push({
        batch: i,
        status: result.httpStatus,
        errors: result.requestErrors,
        sample: i === 0 ? result.rawSample : undefined,
      });
    }

    for (const item of result.items) {
      const name = nameByAsin.get(item.asin) ?? item.asin;
      if (item.found) {
        // Confirmed via a live response: Creators API's availability.type
        // for a purchasable listing is "IN_STOCK" (not the old PA-API
        // "Now"). Anything else, or no listing at all, is unavailable.
        if (item.hasOffer && item.availabilityType === "IN_STOCK") {
          ok.push(name);
        } else {
          unavailable.push({
            asin: item.asin,
            name,
            message: item.availabilityMessage ?? "no buyable offer",
          });
        }
      } else if (item.errorCode || item.errorMessage) {
        // Amazon named this specific ASIN in an error (ItemNotAccessible,
        // InvalidParameterValue, etc.) — a real, item-specific problem.
        dead.push({ asin: item.asin, name, error: item.errorMessage ?? item.errorCode });
      } else {
        // Not returned and not named in any error — the request-level
        // failure (bad token, throttling) means we don't know its status.
        unverified.push({ asin: item.asin, name });
      }
    }

    // Stay well under PA-API's default throttle between batches.
    if (i < batches.length - 1) await new Promise((r) => setTimeout(r, 1100));
  }

  return NextResponse.json({
    totalAsins: asins.length,
    okCount: ok.length,
    dead,
    unavailable,
    unverifiedCount: unverified.length,
    requestFailures,
    note:
      unverified.length === asins.length
        ? "No item could be checked — this is a credentials or account-eligibility problem (Creators API reportedly requires 10 qualifying sales in the trailing 30 days), not evidence about individual product links."
        : unverified.length > 0
          ? `${unverified.length} item(s) could not be verified due to a request-level failure in their batch; see requestFailures. dead[] only lists items Amazon specifically flagged as inaccessible.`
          : undefined,
  });
}
