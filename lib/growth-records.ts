import { redis } from './growth-store';
export type Experiment = { id: string; title: string; hypothesis: string; variant: string; metric: string; criterion: string; status: 'draft' | 'active' | 'paused' | 'completed'; createdAt: string; startedAt: string | null; updatedAt: string; result: string };
export function experimentInput(data: Record<string, unknown>) {
  const fields = ['title', 'hypothesis', 'variant', 'metric', 'criterion'] as const;
  for (const field of fields) if (typeof data[field] !== 'string' || !(data[field] as string).trim() || (data[field] as string).length > (field === 'title' ? 120 : 1500)) throw new Error('invalid-experiment');
  return Object.fromEntries(fields.map(field => [field, (data[field] as string).trim()])) as Pick<Experiment, typeof fields[number]>;
}
export async function readExperiments(): Promise<Experiment[]> {
  const result = await redis(['HVALS', 'ots:growth:experiments']);
  if (!Array.isArray(result)) throw new Error('storage-unavailable');
  return result.map(value => JSON.parse(value) as Experiment).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function createExperiment(input: Record<string, unknown>) {
  const now = new Date().toISOString();
  const record: Experiment = { ...experimentInput(input), id: crypto.randomUUID(), status: 'draft', createdAt: now, updatedAt: now, startedAt: null, result: '' };
  const result = await redis(['EVAL', "if redis.call('HLEN',KEYS[1]) >= 100 then return 0 end redis.call('HSET',KEYS[1],ARGV[1],ARGV[2]) return 1", 1, 'ots:growth:experiments', record.id, JSON.stringify(record)]);
  if (result !== 1) throw new Error('experiment-limit');
}
export async function updateExperiment(id: string, status: string, result: string) {
  if (!/^[a-f0-9-]{36}$/.test(id) || !['active', 'paused', 'completed'].includes(status) || result.length > 3000 || (status === 'completed' && !result.trim())) throw new Error('invalid-experiment');
  const old = await redis(['HGET', 'ots:growth:experiments', id]);
  if (typeof old !== 'string') throw new Error('missing-experiment');
  const record: Experiment = JSON.parse(old);
  if (record.status === 'completed') throw new Error('experiment-completed');
  const now = new Date().toISOString();
  const next = { ...record, status, result, updatedAt: now, startedAt: status === 'active' ? record.startedAt || now : record.startedAt };
  const changed = await redis(['EVAL', "if redis.call('HGET',KEYS[1],ARGV[1]) ~= ARGV[2] then return 0 end redis.call('HSET',KEYS[1],ARGV[1],ARGV[3]) return 1", 1, 'ots:growth:experiments', id, old, JSON.stringify(next)]);
  if (changed !== 1) throw new Error('experiment-conflict');
}
export async function readRecord<T>(key: string): Promise<T | null> {
  const result = await redis(['GET', `ots:growth:${key}`]);
  return typeof result === 'string' ? JSON.parse(result) as T : null;
}
export type StockRecord = { checkedAt: string; totalAsins: number; okCount: number; dead: { asin: string; name: string }[]; unavailable: { asin: string; name: string }[]; unverified: { asin: string; name: string }[] };
export async function saveStockRecord(record: StockRecord) {
  // Do not retain provider response bodies or product advertising content.
  const compact = { ...record, dead: record.dead.map(({ asin, name }) => ({ asin, name })), unavailable: record.unavailable.map(({ asin, name }) => ({ asin, name })), unverified: record.unverified.map(({ asin, name }) => ({ asin, name })) };
  await redis(['EVAL', "redis.call('SET',KEYS[1],ARGV[1],'EX',7776000) redis.call('LPUSH',KEYS[2],ARGV[1]) redis.call('LTRIM',KEYS[2],0,29) redis.call('EXPIRE',KEYS[2],7776000) return 1", 2, 'ots:growth:stock', 'ots:growth:stock-history', JSON.stringify(compact)]);
}
