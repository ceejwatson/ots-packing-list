"use client";
import Link from 'next/link';
import { useState } from 'react';
import PackingItemCard from './PackingItemCard';
import { applicable, categoryFor, readiness } from '@/lib/progress';
import { usePlan } from './PlanProvider';

export default function PackingChecklist() {
  const { plan, update, ready } = usePlan();
  const [category, setCategory] = useState('Required'); const [query, setQuery] = useState(''); const [filter, setFilter] = useState('all'); const [showExcluded, setShowExcluded] = useState(false);
  const stats = readiness(plan);
  const excludedCount = plan.items.filter(i => !applicable(i, plan.profile)).length;
  const items = plan.items.filter(i => showExcluded
    ? !applicable(i, plan.profile)
    : applicable(i, plan.profile)
      && (query.trim() || categoryFor(i, plan.profile) === category)
      && `${i.item_name} ${i.notes ?? ''}`.toLowerCase().includes(query.trim().toLowerCase())
      && (filter !== 'unpacked' || !i.is_packed));
  const change = (id: string, field: 'is_packed' | 'not_applicable') => update(p => ({ ...p, items: p.items.map(i => i.id !== id ? i : { ...i, [field]: !i[field], ...(field === 'is_packed' ? { is_owned: !i.is_packed } : {}) }) }));
  return <>
    <div className="mb-3 flex items-center justify-between gap-2">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold uppercase text-slate-900">Packing checklist</h1>
        <p className="mt-1 text-xs text-slate-500">Guide edition · 27 Mar 2026</p>
      </div>
      <div className="flex gap-4 text-xs font-semibold text-blue-800">
        <Link href="/print" className="py-2">Print</Link>
      </div>
    </div>
    <section aria-label="Packing progress" className="surface mb-3 p-3 sm:p-4">
      <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
        <span className="text-slate-600">Required gear & documents</span>
        <span className="font-semibold text-slate-900">{ready ? `${stats.packed} / ${stats.total} complete` : 'Loading your progress…'}</span>
      </div>
      <div role="progressbar" aria-label="Required checklist progress" aria-valuenow={stats.percent} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${stats.percent}%` }} />
      </div>
    </section>
    <div className="surface mb-3 p-2.5 sm:p-4">
      <label className="block"><span className="sr-only">Search all items</span><input type="search" value={query} onChange={e => { setQuery(e.target.value); setShowExcluded(false); }} placeholder="Search items…" className="field w-full" /></label>
      <div className="mt-2 grid grid-cols-2 gap-1">{[['all','All items'],['unpacked','Unchecked']].map(([value,label]) => <button key={value} aria-pressed={filter === value && !showExcluded} onClick={() => { setFilter(value); setShowExcluded(false); }} className={`filter-chip px-2 ${filter === value && !showExcluded ? 'selected' : ''}`}>{label}</button>)}</div>
    </div>
    <div className="mb-1 grid grid-cols-3 gap-1.5" aria-label="Categories">{['Required','Recommended','Documents'].map(cat => { const group = plan.items.filter(i => applicable(i, plan.profile) && categoryFor(i, plan.profile) === cat); return <button key={cat} aria-pressed={!showExcluded && category === cat && !query.trim()} onClick={() => { setCategory(cat); setQuery(''); setShowExcluded(false); }} className={`category-button ${!showExcluded && category === cat && !query.trim() ? 'selected' : ''}`}><span>{cat}</span><span className="block mt-1 text-xs opacity-70">{group.filter(i => i.is_packed).length} / {group.length}</span></button>; })}</div>
    <div className="mb-1 flex items-center justify-between gap-2 text-xs text-slate-500"><span role="status">{items.length} {showExcluded ? 'excluded' : query ? 'matching' : ''} items</span><label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={showExcluded} onChange={e => setShowExcluded(e.target.checked)} className="h-4 w-4" /> Show excluded ({excludedCount})</label></div>

    <div className="surface overflow-hidden divide-y divide-slate-100">
      {items.length === 0 && <div className="p-10 text-center"><h3 className="font-semibold">No items to show.</h3><p className="mt-2 text-sm text-slate-500">{showExcluded ? "No excluded items. All your items are included in the checklist." : "Try another category or clear your filters."}</p><button className="filter-chip mt-4" onClick={() => { setQuery(''); setFilter('all'); setShowExcluded(false); }}>Clear filters</button></div>}
      {items.map(item => <PackingItemCard key={item.id} item={item} excluded={!applicable(item, plan.profile)} ready={ready} onChange={change} />)}
    </div>
    <aside className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-5 text-sm leading-6 text-slate-600"><h2 className="font-semibold text-slate-900">A little preparation goes a long way.</h2><p className="mt-1">Break in your boots, check your documents, and review your arrival instructions. Your welcome email and the official guide always take priority.</p><Link href="/reporting" className="mt-2 inline-block font-semibold text-blue-800">Review reporting instructions →</Link></aside>
  </>;
}
