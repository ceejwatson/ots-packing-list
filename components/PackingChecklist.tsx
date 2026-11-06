"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PackingItemCard from './PackingItemCard';
import { applicable, categoryFor, readiness } from '@/lib/progress';
import { usePlan } from './PlanProvider';

export default function PackingChecklist() {
  const { plan, update, ready } = usePlan();
  const [category, setCategory] = useState('Required'); const [query, setQuery] = useState(''); const [filter, setFilter] = useState('all'); const [showExcluded, setShowExcluded] = useState(false);
  const stats = readiness(plan);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => { setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function'); }, []);
  const share = () => { navigator.share({ title: 'OTS Packing List', text: 'The Air Force OTS packing checklist', url: 'https://otspackinglist.com' }).catch(() => {}); };
  const excludedCount = plan.items.filter(i => !applicable(i, plan.profile)).length;
  const items = plan.items.filter(i => showExcluded
    ? !applicable(i, plan.profile)
    : applicable(i, plan.profile)
      && (query.trim() || categoryFor(i, plan.profile) === category)
      && `${i.item_name} ${i.notes ?? ''}`.toLowerCase().includes(query.trim().toLowerCase())
      && (filter !== 'unpacked' || !i.is_packed));
  const change = (id: string, field: 'is_packed' | 'not_applicable') => update(p => ({ ...p, items: p.items.map(i => i.id !== id ? i : { ...i, [field]: !i[field], ...(field === 'is_packed' ? { is_owned: !i.is_packed } : {}) }) }));
  const tabs = ['Required','Recommended','Documents'];
  const searching = !!query.trim();
  return <>
    <div className="mb-2 flex items-end justify-between gap-2">
      <div>
        <h1 className="text-[32px] font-bold leading-9 tracking-tight text-slate-900">Checklist</h1>
        <p className="mt-0.5 text-[13px] text-slate-500">Orientation Guide · 27 Mar 2026</p>
      </div>
      <div className="flex items-center text-[15px] font-medium text-[#007AFF]">
        {canShare && <button onClick={share} className="min-h-11 px-3">Share</button>}
        <Link href="/print" className="flex min-h-11 items-center px-3">Print</Link>
      </div>
    </div>
    <section aria-label="Packing progress" className="surface mb-4 flex items-center gap-4 p-4 sm:sticky sm:top-[72px] sm:z-30">
      <p className="w-16 shrink-0 text-[34px] font-bold leading-none tracking-tight text-slate-900">{ready ? stats.percent : 0}<span className="text-lg text-slate-400">%</span></p>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-slate-900">{ready ? (stats.total > 0 && stats.remaining === 0 ? 'All required items packed' : `${stats.remaining} required left`) : 'Loading…'}</p>
        <div role="progressbar" aria-label="Required checklist progress" aria-valuenow={stats.percent} aria-valuemin={0} aria-valuemax={100} className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full transition-all duration-500 ${stats.percent === 100 ? 'bg-[#34C759]' : 'bg-[#007AFF]'}`} style={{ width: `${stats.percent}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">{stats.packed} of {stats.total} required gear & documents</p>
      </div>
    </section>
    <label className="search-field mb-3"><span className="sr-only">Search all items</span>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input type="search" value={query} onChange={e => { setQuery(e.target.value); setShowExcluded(false); }} placeholder="Search" />
    </label>
    <div className="segmented mb-3" role="group" aria-label="Categories">{tabs.map(cat => { const group = plan.items.filter(i => applicable(i, plan.profile) && categoryFor(i, plan.profile) === cat); const on = !showExcluded && !searching && category === cat; return <button key={cat} aria-pressed={on} onClick={() => { setCategory(cat); setQuery(''); setShowExcluded(false); }} className={on ? 'selected' : ''}><span className="block leading-4">{cat}</span><span className="block text-[11px] font-normal leading-4 text-slate-500">{group.filter(i => i.is_packed).length} of {group.length}</span></button>; })}</div>
    <div className="surface mb-2 divide-y divide-slate-100 text-[15px] text-slate-900">
      <label className="flex min-h-11 items-center justify-between gap-3 px-4"><span>Unchecked only</span><input type="checkbox" role="switch" className="ios-switch" checked={filter === 'unpacked'} onChange={e => { setFilter(e.target.checked ? 'unpacked' : 'all'); setShowExcluded(false); }} /></label>
      {excludedCount > 0 && <label className="flex min-h-11 items-center justify-between gap-3 px-4"><span>Show excluded ({excludedCount})</span><input type="checkbox" role="switch" className="ios-switch" checked={showExcluded} onChange={e => setShowExcluded(e.target.checked)} /></label>}
    </div>
    <p role="status" className="mb-1.5 px-4 text-[13px] uppercase tracking-wide text-slate-500">{items.length} {showExcluded ? 'excluded ' : searching ? 'matching ' : ''}items</p>

    <div className="surface overflow-hidden divide-y divide-slate-100">
      {items.length === 0 && <div className="p-10 text-center"><h3 className="font-semibold">No items to show</h3><p className="mt-2 text-sm text-slate-500">{showExcluded ? "No excluded items. All your items are included in the checklist." : "Try another category or clear your filters."}</p><button className="mt-4 min-h-11 rounded-full bg-[#007AFF] px-5 text-[15px] font-semibold text-white" onClick={() => { setQuery(''); setFilter('all'); setShowExcluded(false); }}>Clear filters</button></div>}
      {items.map(item => <PackingItemCard key={item.id} item={item} excluded={!applicable(item, plan.profile)} ready={ready} onChange={change} />)}
    </div>
    <aside className="mt-6 px-1 text-[13px] leading-5 text-slate-500"><p>Break in your boots, check your documents, and review your arrival instructions. Your welcome email and the official guide always take priority.</p><div className="mt-1 flex flex-wrap gap-x-5 font-medium text-[#007AFF]"><Link href="/reporting" className="py-2">Reporting instructions</Link><Link href="/what-to-bring" className="py-2">Full list as text</Link></div></aside>
  </>;
}
