export type Recommendation = { title: string; why: string; evidence: string; mechanism: string; difficulty: string; measurement: string };
export function recommendations(counters: Record<string, number>, available: boolean): Recommendation[] {
  const views = counters['event:product_view'] || 0;
  const clicks = counters['event:affiliate_click'] || 0;
  const result: Recommendation[] = [{
    title: 'Verify recommendation suitability against the current guide',
    why: 'An affiliate destination alone does not establish that a specific product meets the requirement.',
    evidence: 'Catalog products have affiliate links but no per-product suitability verification dates.',
    mechanism: 'Document dimensions, specifications and alternatives before making ranked recommendations.',
    difficulty: 'Editorial review', measurement: 'Share of linked products with a dated source and suitability review; monitor affiliate clicks per visible product impression.',
  }];
  if (!available || views < 200) result.unshift({ title: 'Establish a measurement baseline', why: 'There is not enough measured product exposure to select a conversion experiment.', evidence: available ? `${views} visible product impressions and ${clicks} affiliate clicks in the last 14 UTC dates.` : 'Growth measurement is not connected or unavailable.', mechanism: 'Collect aggregate exposure and click events before changing product presentation.', difficulty: 'Configuration, then observation', measurement: 'Check event delivery and data quality. Review at least two full weeks; 200 impressions is a triage threshold, not proof of statistical power.' });
  else result.unshift({ title: 'Test clearer product selection guidance', why: 'Product exposure and click measurements can now inform a narrowly scoped hypothesis.', evidence: `${views} visible product impressions and ${clicks} affiliate clicks across the last 14 UTC dates. This is descriptive, not causal evidence.`, mechanism: 'For one category, explain suitability and a verified alternative before the Amazon link.', difficulty: 'Small editorial and interface change', measurement: 'Before launch, register allocation, minimum detectable effect, sample size, duration and guardrails. Compare randomized variants; current aggregate data cannot declare a winner.' });
  return result;
}
export const contentOpportunities = [
  { topic: 'OTS 72-hour bag and travel packing', intent: 'What stays accessible if checked luggage is delayed?', reason: 'Distinct travel preparation question; avoid a duplicate general packing list.', parent: '/', incoming: '/reporting, /faqs', outgoing: '/, /reporting, /print', source: 'Current official guide and class welcome instructions', refresh: 'Each guide update', status: 'Proposed; verify source before publication' },
  { topic: 'Backpack versus hydration pack', intent: 'Can one bag satisfy both requirements?', reason: 'Resolve equipment specification confusion before purchase.', parent: '/', incoming: '/, /faqs', outgoing: '/, official guide', source: 'Official guide dimensions plus manufacturer specifications', refresh: 'Each guide or product change', status: 'Proposed; no product ranking without verification' },
  { topic: 'Seasonal clothing and class dates', intent: 'What changes for my reporting month?', reason: 'Explain the existing seasonal checklist rather than create monthly duplicate pages.', parent: '/dashboard', incoming: '/, /reporting', outgoing: '/dashboard, /', source: 'Current official guide and class instructions', refresh: 'Each guide update', status: 'Proposed; extend existing page first' },
];
