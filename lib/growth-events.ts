import { defaultOTSPackingList } from './packing-list-data';

export const publicPages = ['/', '/reporting', '/faqs', '/print', '/dashboard', '/about'];
export const eventNames = ['page_view', 'product_view', 'affiliate_click', 'checklist_change', 'search'] as const;
export type GrowthEvent = { event: typeof eventNames[number]; page: string; item?: string; source?: 'search' | 'referral' | 'direct'; device?: 'mobile' | 'desktop' };
const productIds = new Set(defaultOTSPackingList.filter(i => !i.aafes_only && (i.amazon_asin || i.amazon_search)).map(i => i.id));
const itemIds = new Set(defaultOTSPackingList.map(i => i.id));

// Reject unknown dimensions; never accept search text, full URLs or personal details.
export function validateEvent(value: unknown): GrowthEvent | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  if (Object.keys(v).some(k => !['event', 'page', 'item', 'source', 'device'].includes(k))) return null;
  if (!eventNames.includes(v.event as GrowthEvent['event']) || !publicPages.includes(v.page as string)) return null;
  if (v.source !== undefined && !['search', 'referral', 'direct'].includes(v.source as string)) return null;
  if (v.device !== undefined && !['mobile', 'desktop'].includes(v.device as string)) return null;
  if (['product_view', 'affiliate_click'].includes(v.event as string) && !productIds.has(v.item as string)) return null;
  if (v.event === 'checklist_change' && !itemIds.has(v.item as string)) return null;
  if (['page_view', 'search'].includes(v.event as string) && v.item !== undefined) return null;
  return v as GrowthEvent;
}

export function counterFields(event: GrowthEvent): string[] {
  const fields = [`event:${event.event}`, `page:${event.page}:${event.event}`];
  if (event.item) fields.push(`item:${event.item}:${event.event}`);
  if (event.event === 'page_view') {
    if (event.source) fields.push(`source:${event.source}`);
    if (event.device) fields.push(`device:${event.device}`);
  }
  return fields;
}
