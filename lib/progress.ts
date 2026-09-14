import { defaultOTSPackingList, type PackingItem } from './packing-list-data';

export const STORAGE_KEY = 'ots-preparation-v5';
export type Profile = { classDate: string; section: 'All' | 'Womens' | 'Mens' };
export type Plan = { version: 5; profile: Profile; items: PackingItem[] };
export const buildDefaultItems = (): PackingItem[] => defaultOTSPackingList.map(i => ({ ...i, is_packed: false, is_owned: false, not_applicable: false }));
export const emptyPlan = (): Plan => ({ version: 5, profile: { classDate: '', section: 'All' }, items: buildDefaultItems() });

export function validDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (value === '') return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function parsePlan(value: unknown): Plan {
  if (!value || typeof value !== 'object') throw new Error('Invalid saved progress.');
  const data = value as Partial<Plan>;
  if (data.version !== 5 || !Array.isArray(data.items) || data.items.length > 1000 || !data.profile || !validDate(data.profile.classDate) || !['All', 'Womens', 'Mens'].includes(data.profile.section)) throw new Error('Saved progress has an unsupported format.');
  const seen = new Set<string>();
  for (const item of data.items) {
    if (!item || typeof item.id !== 'string' || seen.has(item.id) || typeof item.is_packed !== 'boolean' || typeof item.is_owned !== 'boolean' || typeof item.not_applicable !== 'boolean') throw new Error('Saved progress contains invalid values.');
    seen.add(item.id);
  }
  const saved = new Map(data.items.map(i => [i.id, i]));
  return { version: 5, profile: { classDate: '', section: 'All' }, items: buildDefaultItems().map(i => {
    const s = saved.get(i.id);
    return s ? { ...i, is_packed: s.is_packed, is_owned: s.is_owned || s.is_packed, not_applicable: s.not_applicable } : i;
  }) };
}

export function readPlan(): { plan: Plan; error: string } {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) return { plan: parsePlan(JSON.parse(current)), error: '' };
    const legacy = localStorage.getItem('ots-packing-list-v4') ?? localStorage.getItem('ots-packing-list-v3');
    const plan = emptyPlan();
    if (legacy) {
      const entries: unknown = JSON.parse(legacy);
      if (!Array.isArray(entries)) throw new Error();
      const packed = new Map(entries.filter(i => i && typeof i.item_name === 'string').map(i => [i.item_name, i.is_packed === true]));
      plan.items = plan.items.map(i => ({ ...i, is_packed: packed.get(i.item_name) ?? false, is_owned: packed.get(i.item_name) ?? false }));
    }
    return { plan, error: '' };
  } catch { return { plan: emptyPlan(), error: 'Saved progress could not be read. Your previous data has not been overwritten.' }; }
}

export function writePlan(plan: Plan): string {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(plan)); return ''; }
  catch { return 'Changes are only in this session: your browser could not save them. Progress may be lost when you leave this page.'; }
}
export const loadItems = () => readPlan().plan.items;
export function saveItems(items: PackingItem[]) { return writePlan({ ...readPlan().plan, items }); }
export function applicable(item: PackingItem, profile: Profile) {
  return !item.not_applicable && (!item.section || profile.section === 'All' || item.section === profile.section);
}
export function categoryFor(item: PackingItem, profile: Profile) {
  const month = Number(profile.classDate.slice(5, 7));
  return item.seasonal && month && (month >= 10 || month <= 5) ? 'Required' : item.category;
}
export function readiness(plan: Plan) {
  const required = plan.items.filter(i => applicable(i, plan.profile) && categoryFor(i, plan.profile) !== 'Recommended');
  const packed = required.filter(i => i.is_packed).length;
  return { total: required.length, packed, remaining: required.length - packed, percent: required.length ? Math.round(100 * packed / required.length) : 0 };
}
export function deadline(classDate: string, days: number) {
  if (!classDate) return null;
  const date = new Date(classDate + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() - days);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date);
}
