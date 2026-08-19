/**
 * Amazon Creators API client (GetItems equivalent).
 *
 * Amazon retired classic Product Advertising API 5.0 (AWS Signature v4,
 * AKIA-style keys) in favor of the Creators API: OAuth2 client-credentials
 * auth against a REST catalog API. https://affiliate-program.amazon.com/creatorsapi
 *
 * Server-side only — never import this from a "use client" component.
 * Reads AMAZON_PAAPI_ACCESS_KEY / AMAZON_PAAPI_SECRET_KEY from the
 * environment (names predate this rewrite; they now hold the Creators API
 * client_id / client_secret, not AWS keys).
 *
 * CAVEAT: the exact endpoint paths and JSON field names below are
 * reconstructed from third-party documentation of a fairly new API, not
 * exhaustively verified against Amazon's primary docs. Response parsing
 * checks both the documented lowerCamelCase field names and the old PA-API
 * PascalCase ones defensively, in case the source material is imprecise.
 * `rawSample` in the result always carries the real response for diagnosis.
 */

const TOKEN_ENDPOINT = "https://api.amazon.com/auth/o2/token";
const API_HOST = "https://creatorsapi.amazon";
const GET_ITEMS_PATH = "/catalog/v1/getItems";
const PARTNER_TAG = "otspackinglis-20";
const MARKETPLACE = "www.amazon.com";

interface TokenCache {
  token: string;
  expiresAt: number; // epoch ms
}
// Best-effort cache across warm serverless invocations. Not required for
// correctness — a cold start just fetches a fresh token.
let cachedToken: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  const clientId = process.env.AMAZON_PAAPI_ACCESS_KEY;
  const clientSecret = process.env.AMAZON_PAAPI_SECRET_KEY;
  if (!clientId || !clientSecret) {
    throw new Error(
      "AMAZON_PAAPI_ACCESS_KEY / AMAZON_PAAPI_SECRET_KEY are not set",
    );
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - 60_000 > now) {
    return cachedToken.token;
  }

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "creatorsapi::default",
    }),
  });

  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Token endpoint returned non-JSON (status ${res.status}): ${text.slice(0, 500)}`,
    );
  }

  if (!res.ok || !data.access_token) {
    const err: any = new Error(
      `Token request failed (status ${res.status}): ${JSON.stringify(data).slice(0, 500)}`,
    );
    err.httpStatus = res.status;
    err.body = data;
    throw err;
  }

  cachedToken = {
    token: data.access_token,
    expiresAt: now + (data.expires_in ?? 3600) * 1000,
  };
  return cachedToken.token;
}

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

/**
 * Fetch availability for up to 10 ASINs in one call.
 * Throws only on transport/token failure; API-level errors (bad ASIN,
 * ineligible account, etc.) are returned in the result so callers can
 * report them instead of crashing.
 */
export async function getItemsAvailability(
  asins: string[],
): Promise<PaapiBatchResult> {
  if (asins.length === 0 || asins.length > 10) {
    throw new Error("getItemsAvailability accepts 1 to 10 ASINs per call");
  }

  let token: string;
  try {
    token = await getAccessToken();
  } catch (e: any) {
    return {
      ok: false,
      httpStatus: e?.httpStatus ?? 0,
      items: asins.map((asin) => ({ asin, found: false, hasOffer: false })),
      requestErrors: [{ code: "TokenRequestFailed", message: e?.message ?? String(e) }],
      rawSample: e?.body,
    };
  }

  const res = await fetch(`${API_HOST}${GET_ITEMS_PATH}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      "x-marketplace": MARKETPLACE,
    },
    body: JSON.stringify({
      itemIds: asins,
      partnerTag: PARTNER_TAG,
      partnerType: "Associates",
      marketplace: MARKETPLACE,
      resources: [
        "itemInfo.title",
        "offersV2.listings.availability.message",
        "offersV2.listings.availability.type",
      ],
    }),
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    // Non-JSON response — surfaced via rawSample below.
  }

  const requestErrors: Array<{ code?: string; message?: string }> = (
    data?.errors ?? data?.Errors ?? []
  ).map((e: any) => ({ code: e?.code ?? e?.Code, message: e?.message ?? e?.Message }));

  const returnedItems: any[] =
    data?.itemsResult?.items ?? data?.ItemsResult?.Items ?? [];
  const byAsin = new Map(returnedItems.map((it) => [it.asin ?? it.ASIN, it]));

  const items: PaapiItemResult[] = asins.map((asin) => {
    const item = byAsin.get(asin);
    if (!item) {
      return { asin, found: false, hasOffer: false };
    }
    const listing = item?.offersV2?.listings?.[0] ?? item?.Offers?.Listings?.[0];
    const availability = listing?.availability ?? listing?.Availability;
    return {
      asin,
      found: true,
      title: item?.itemInfo?.title?.displayValue ?? item?.ItemInfo?.Title?.DisplayValue,
      hasOffer: !!listing,
      availabilityType: availability?.type ?? availability?.Type,
      availabilityMessage: availability?.message ?? availability?.Message,
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
