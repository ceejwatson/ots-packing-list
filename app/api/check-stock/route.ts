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
      if (!item.found) {
        dead.push({ asin: item.asin, name, error: item.errorMessage ?? item.errorCode });
      } else if (!item.hasOffer || item.availabilityType !== "Now") {
        unavailable.push({
          asin: item.asin,
          name,
          message: item.availabilityMessage ?? "no buyable offer",
        });
      } else {
        ok.push(name);
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
    requestFailures,
    note:
      requestFailures.length === batches.length
        ? "Every batch failed — likely a credentials or account-eligibility problem (PA-API requires 3 qualifying sales in the trailing 180 days), not individual broken links."
        : undefined,
  });
}
