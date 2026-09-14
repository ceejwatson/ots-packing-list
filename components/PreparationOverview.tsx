"use client";
import Link from 'next/link';
import { useState } from 'react';
import { usePlan } from './PlanProvider';
import { applicable, categoryFor, readiness } from '@/lib/progress';

const deadlines = [
  { days: 14, title: 'Complete medical requirements', detail: 'WINGS · 1630 CT cutoff. Also submit any religious accommodation requests.' },
  { days: 10, title: 'Finish pre-course assignments', detail: 'Complete assignments in WINGS and review the testable material.' },
  { days: 1, title: 'Arrive in the local area', detail: 'Be in the Montgomery, Alabama area by 11:59 pm.' },
  { days: 0, title: 'Report for your first day', detail: '0700–0730 · Check your welcome email for your final instructions.' },
];
export default function PreparationOverview() {
  const { plan, ready, update, error } = usePlan(); const stats = readiness(plan);
  const [message, setMessage] = useState(''); const [reset, setReset] = useState(false);
  return <>
    <div className="mb-7"><p className="eyebrow text-slate-500">YOUR PREPARATION HQ</p><h1 className="mt-2 font-display text-4xl font-semibold uppercase text-slate-900">A clear path to ready.</h1><p className="mt-2 text-sm text-slate-500">Make the list yours. Keep the essentials in sight.</p></div>
    <section className="hero-panel"><p className="eyebrow text-blue-200">REQUIRED GEAR & DOCUMENTS</p><div className="relative z-10 mt-4 flex items-end justify-between"><div><p className="font-display text-6xl font-semibold">{ready ? stats.percent : '—'}<span className="text-3xl text-blue-200">%</span></p><p className="mt-2 text-sm text-slate-300">{stats.remaining} essentials left to pack</p></div><Link href="/" className="rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-900">Keep packing →</Link></div><p className="relative mt-5 text-xs text-slate-300">Optional and excluded items don&apos;t affect your readiness score.</p></section>
    <section className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">{['Required','Documents','Recommended'].map(cat => { const group = plan.items.filter(i => applicable(i, plan.profile) && categoryFor(i, plan.profile) === cat); return <div key={cat} className="surface p-3 sm:p-5"><p className="text-xs text-slate-500">{cat === 'Recommended' ? 'Optional extras' : cat}</p><p className="mt-2 font-display text-2xl font-semibold text-slate-900">{group.filter(i => i.is_packed).length}<span className="text-base text-slate-400"> / {group.length}</span></p></div>; })}</section>
    <section className="surface mt-6 p-5 sm:p-6"><div className="flex flex-wrap justify-between gap-2"><h2 className="text-lg font-semibold text-slate-900">Before you arrive</h2><span className="text-xs text-slate-500">Before class start</span></div><ol className="mt-5 space-y-0">{deadlines.map((d, index) => <li key={d.days} className="relative flex gap-4 pb-6 last:pb-0"><div className="flex flex-col items-center"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">{index+1}</span>{index < deadlines.length-1 && <span className="mt-2 h-full w-px bg-slate-200" />}</div><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-800">{d.days ? `${d.days} days before` : 'Class start'}</p><h3 className="mt-1 text-sm font-semibold text-slate-900">{d.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{d.detail}</p></div></li>)}</ol></section>
    <section className="surface mt-6 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-lg font-semibold text-slate-900">Your progress</h2><p className="mt-2 text-sm text-slate-500">{!ready ? 'Loading…' : error ? 'Changes are only saved for this session.' : 'Automatically saved in this browser.'}</p></div>
        <button disabled={!ready} onClick={() => setReset(true)} className="min-h-11 px-3 text-xs text-red-700">Reset progress</button>
      </div>
      {reset && <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm"><p>Clear all owned and packed marks? Your exclusions will stay.</p><div className="mt-3 flex gap-3"><button className="filter-chip" onClick={() => { update(p => ({ ...p, items: p.items.map(i => ({ ...i, is_packed: false, is_owned: false })) })); setReset(false); setMessage('Progress reset.'); }}>Yes, reset</button><button className="filter-chip" onClick={() => setReset(false)}>Cancel reset</button></div></div>}
      <p role="status" className="mt-3 text-sm text-slate-600">{message}</p>
    </section>
    <a href="/OTS_Orientation_Guide_CAO_27-Mar-2026.pdf" target="_blank" rel="noopener noreferrer" className="surface mt-6 flex items-center justify-between gap-4 p-5"><div><p className="text-sm font-semibold text-slate-900">Official Orientation Guide</p><p className="mt-1 text-xs text-slate-500">27 March 2026 edition · PDF</p></div><span aria-hidden="true">↗</span></a>
  </>;
}
