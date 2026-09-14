"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { type PackingItem, getAmazonLink } from '@/lib/packing-list-data';
import { applicable, categoryFor, readiness } from '@/lib/progress';
import { usePlan } from './PlanProvider';

function Product({ item }: { item: PackingItem }) {
  const [failed, setFailed] = useState(false);
  const link = !item.aafes_only && getAmazonLink(item.amazon_search, item.amazon_asin);
  return <div className="flex shrink-0 flex-col items-center gap-2">
    {item.image_url && !failed && <Image src={item.image_url} alt="" width={72} height={72} sizes="72px" onError={() => setFailed(true)} className="h-16 w-16 rounded-xl border border-slate-100 bg-white object-contain p-2 sm:h-[72px] sm:w-[72px]" />}
    {link && <a href={link} target="_blank" rel="noopener noreferrer sponsored" className="shop-link" aria-label={`View ${item.item_name} on Amazon`}>Amazon ↗</a>}
    {item.aafes_only && <span className="text-[10px] font-bold tracking-wider text-slate-500">AAFES</span>}
  </div>;
}
export default function PackingChecklist() {
  const { plan, update, ready } = usePlan();
  const [category, setCategory] = useState('Required'); const [query, setQuery] = useState(''); const [filter, setFilter] = useState('all'); const [showExcluded, setShowExcluded] = useState(false);
  const stats = readiness(plan);
  const items = plan.items.filter(i => (showExcluded || applicable(i, plan.profile)) && (query.trim() || categoryFor(i, plan.profile) === category) && `${i.item_name} ${i.notes ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()) && (filter !== 'unpacked' || !i.is_packed) && (filter !== 'shopping' || !i.is_owned));
  const change = (id: string, field: 'is_packed' | 'is_owned' | 'not_applicable') => update(p => ({ ...p, items: p.items.map(i => i.id !== id ? i : { ...i, [field]: !i[field], ...(field === 'is_packed' && !i.is_packed ? { is_owned: true } : {}), ...(field === 'is_owned' && i.is_owned ? { is_packed: false } : {}) }) }));
  return <>
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-semibold uppercase text-slate-900">Your packing checklist</h1>
        <p className="mt-1 text-xs text-slate-500">Guide edition · 27 Mar 2026</p>
      </div>
      <div className="flex gap-4 text-xs font-semibold text-blue-800">
        <Link href="/print" className="py-2">Print checklist</Link>
      </div>
    </div>
    <section aria-label="Packing progress" className="surface mb-5 p-4">
      <div className="mb-3 flex flex-wrap justify-between gap-2 text-sm">
        <span className="text-slate-600">Required gear & documents</span>
        <span className="font-semibold text-slate-900">{ready ? `${stats.packed} / ${stats.total} packed` : 'Loading your progress…'}</span>
      </div>
      <div role="progressbar" aria-label="Required packing readiness" aria-valuenow={stats.percent} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${stats.percent}%` }} />
      </div>
    </section>
    <div className="surface mb-5 p-3 sm:p-4"><label className="block"><span className="sr-only">Search all items</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search all gear, documents, or notes…" className="field w-full" /></label><div className="mt-3 flex flex-wrap items-center gap-2">{[['all','All items'],['unpacked','Show unpacked'],['shopping','Need to buy']].map(([value,label]) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)} className={`filter-chip ${filter === value ? 'selected' : ''}`}>{label}</button>)}<label className="ml-auto flex min-h-11 items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={showExcluded} onChange={e => setShowExcluded(e.target.checked)} /> Show excluded</label></div></div>
    <div className="mb-5 grid grid-cols-3 gap-2" aria-label="Categories">{['Required','Recommended','Documents'].map(cat => { const group = plan.items.filter(i => applicable(i, plan.profile) && categoryFor(i, plan.profile) === cat); return <button key={cat} aria-pressed={category === cat && !query.trim()} onClick={() => { setCategory(cat); setQuery(''); }} className={`category-button ${category === cat && !query.trim() ? 'selected' : ''}`}><span>{cat}</span><span className="block mt-1 text-xs opacity-70">{group.filter(i => i.is_packed).length} / {group.length}</span></button>; })}</div>
    <div className="mb-3 flex justify-between text-xs text-slate-500"><span role="status">{items.length} {query ? 'matching' : 'visible'} items</span><span>Have it → Pack it → Ready</span></div>
    <p className="mb-4 text-xs leading-5 text-slate-500">Cold-weather gear is required October–May. Check seasonal notes when packing.</p>
    <div className="surface overflow-hidden divide-y divide-slate-100">
      {items.length === 0 && <div className="p-10 text-center"><h3 className="font-semibold">Nothing here to pack.</h3><p className="mt-2 text-sm text-slate-500">Try another category or clear your filters.</p><button className="filter-chip mt-4" onClick={() => { setQuery(''); setFilter('all'); }}>Clear filters</button></div>}
      {items.map(item => <article key={item.id} className={`p-4 sm:p-5 ${!applicable(item, plan.profile) ? 'bg-slate-50' : item.is_packed ? 'bg-emerald-50/30' : ''}`}><div className="flex gap-4"><div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2">{item.section && <span className="item-tag">{item.section === 'Womens' ? "Women's" : "Men's"}</span>}{item.seasonal && <span className="item-tag">Oct–May required</span>}{item.not_applicable && <span className="item-tag">Not applicable</span>}</div><h3 className={`text-sm font-semibold leading-6 ${item.is_packed ? 'text-emerald-800' : 'text-slate-900'}`}>{item.item_name}{!item.notes?.includes('Min:') && item.quantity > 1 && <span className="ml-2 text-xs text-slate-500">×{item.quantity}</span>}</h3>{item.notes && <p className="mt-1 text-xs leading-5 text-slate-500">{item.notes}</p>}</div><Product item={item} /></div><div className="mt-4 flex flex-wrap items-center gap-2"><button disabled={!ready} aria-pressed={!!item.is_owned} onClick={() => change(item.id, 'is_owned')} className={`status-button ${item.is_owned ? 'owned' : ''}`}>{item.is_owned ? '✓ Have it' : '+ Have it'}</button><button disabled={!ready} aria-pressed={item.is_packed} onClick={() => change(item.id, 'is_packed')} className={`status-button ${item.is_packed ? 'packed' : ''}`}>{item.is_packed ? '✓ Packed' : 'Pack item'}</button><button disabled={!ready} aria-pressed={!!item.not_applicable} onClick={() => change(item.id, 'not_applicable')} className="ml-auto min-h-11 px-2 text-xs text-slate-500 hover:text-slate-900">{item.not_applicable ? 'Include again' : 'Not applicable'}</button></div></article>)}
    </div>
    <aside className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-5 text-sm leading-6 text-slate-600"><h2 className="font-semibold text-slate-900">A little preparation goes a long way.</h2><p className="mt-1">Break in your boots, check your documents, and review your arrival instructions. Your welcome email and the official guide always take priority.</p><Link href="/reporting" className="mt-2 inline-block font-semibold text-blue-800">Review reporting instructions →</Link></aside>
  </>;
}
