/**
 * Minimal Amazon Product Advertising API 5.0 client (GetItems only).
 *
 * Server-side only — never import this from a "use client" component.
 * Reads credentials from AMAZON_PAAPI_ACCESS_KEY / AMAZON_PAAPI_SECRET_KEY,
 * which must be set as Vercel environment variables and are never bundled
 * into client code. Uses AWS Signature Version 4, implemented directly with
 * Node's built-in crypto module (no external SDK / no new dependency).
 *
 * Docs: https://webservices.amazon.com/paapi5/documentation/get-items.html
 */
import { createHash, createHmac } from "node:crypto";

const HOST = "webservices.amazon.com";
const REGION = "us-east-1";
const SERVICE = "ProductAdvertisingAPI";
const URI_PATH = "/paapi5/getitems";
const TARGET = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems";
const PARTNER_TAG = "otspackinglis-20";

export interface PaapiItemResult {
  asin: string;
  found: boolean;
  title?: string;
  hasOffer: boolean;
  availabilityType?: string;
  availabilityMessage?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface PaapiBatchResult {
  ok: boolean;
  httpStatus: number;
  items: PaapiItemResult[];
  requestErrors: Array<{ code?: string; message?: string }>;
  rawSample?: unknown;
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

function sha256Hex(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex");
}

function getSigningKey(secretKey: string, dateStamp: string): Buffer {
  const kDate = hmac(`AWS4${secretKey}`, dateStamp);
  const kRegion = hmac(kDate, REGION);
  const kService = hmac(kRegion, SERVICE);
  return hmac(kService, "aws4_request");
}

/**
 * Fetch availability for up to 10 ASINs in one signed request.
 * Throws only on transport failure or missing credentials; API-level
 * errors (bad ASIN, ineligible account, etc.) are returned in the result
 * so callers can report them instead of crashing.
 */
export async function getItemsAvailability(
  asins: string[],
): Promise<PaapiBatchResult> {
  if (asins.length === 0 || asins.length > 10) {
    throw new Error("getItemsAvailability accepts 1 to 10 ASINs per call");
  }

  const accessKey = process.env.AMAZON_PAAPI_ACCESS_KEY;
  const secretKey = process.env.AMAZON_PAAPI_SECRET_KEY;
  if (!accessKey || !secretKey) {
    throw new Error(
      "AMAZON_PAAPI_ACCESS_KEY / AMAZON_PAAPI_SECRET_KEY are not set",
    );
  }

  const requestBody = {
    ItemIds: asins,
    PartnerTag: PARTNER_TAG,
    PartnerType: "Associates",
    Marketplace: "www.amazon.com",
    Resources: [
      "ItemInfo.Title",
      "Offers.Listings.Availability.Message",
      "Offers.Listings.Availability.Type",
    ],
  };
  const payload = JSON.stringify(requestBody);

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8);

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=utf-8\n` +
    `host:${HOST}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${TARGET}\n`;
  const signedHeaders =
    "content-encoding;content-type;host;x-amz-date;x-amz-target";
  const payloadHash = sha256Hex(payload);

  const canonicalRequest = [
    "POST",
    URI_PATH,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = getSigningKey(secretKey, dateStamp);
  const signature = hmac(signingKey, stringToSign).toString("hex");

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`https://${HOST}${URI_PATH}`, {
    method: "POST",
    headers: {
      "content-encoding": "amz-1.0",
      "content-type": "application/json; charset=utf-8",
      host: HOST,
      "x-amz-date": amzDate,
      "x-amz-target": TARGET,
      authorization,
    },
    body: payload,
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    // Non-JSON response (rare) — surface raw text via rawSample below.
  }

  const requestErrors: Array<{ code?: string; message?: string }> = (
    data?.Errors ?? []
  ).map((e: any) => ({ code: e?.Code, message: e?.Message }));

  const returnedItems: any[] = data?.ItemsResult?.Items ?? [];
  const byAsin = new Map(returnedItems.map((it) => [it.ASIN, it]));

  // PA-API can also report per-item errors without an ItemsResult entry.
  const itemErrors: Map<string, { code?: string; message?: string }> =
    new Map();
  for (const e of data?.Errors ?? []) {
    // Some error shapes echo the offending ASIN; best-effort match.
    const asinMatch = asins.find((a) => (e?.Message ?? "").includes(a));
    if (asinMatch) itemErrors.set(asinMatch, { code: e?.Code, message: e?.Message });
  }

  const items: PaapiItemResult[] = asins.map((asin) => {
    const item = byAsin.get(asin);
    if (!item) {
      const err = itemErrors.get(asin);
      return {
        asin,
        found: false,
        hasOffer: false,
        errorCode: err?.code,
        errorMessage: err?.message,
      };
    }
    const listing = item?.Offers?.Listings?.[0];
    return {
      asin,
      found: true,
      title: item?.ItemInfo?.Title?.DisplayValue,
      hasOffer: !!listing,
      availabilityType: listing?.Availability?.Type,
      availabilityMessage: listing?.Availability?.Message,
    };
  });

  return {
    ok: res.ok,
    httpStatus: res.status,
    items,
    requestErrors,
    rawSample: data ?? text.slice(0, 2000),
  };
}

export function chunkAsins(asins: string[], size = 10): string[][] {
  const out: string[][] = [];
  for (let i = 0; i < asins.length; i += size) {
    out.push(asins.slice(i, i + size));
  }
  return out;
}
