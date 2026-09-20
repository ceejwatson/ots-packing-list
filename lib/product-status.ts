import type { PaapiItemResult } from './paapi';
export function classifyProduct(item: PaapiItemResult): 'ok' | 'unavailable' | 'dead' | 'unverified' {
  if (item.found) {
    if (item.hasOffer && ['IN_STOCK', 'IN_STOCK_SCARCE'].includes(item.availabilityType || '')) return 'ok';
    if (item.hasOffer && ['OUT_OF_STOCK', 'AVAILABLE_DATE'].includes(item.availabilityType || '')) return 'unavailable';
    return 'unverified';
  }
  if (['ItemNotAccessible', 'InvalidParameterValue'].includes(item.errorCode || '')) return 'dead';
  return 'unverified';
}
