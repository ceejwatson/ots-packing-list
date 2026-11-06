"use client";
import Link from 'next/link';
import { usePlan } from './PlanProvider';
import { applicable, categoryFor, readiness } from '@/lib/progress';

const deadlines = [
  { days: 14, title: 'Complete medical requirements', detail: 'WINGS · 1630 CT cutoff. Also submit any religious accommodation requests.' },
  { days: 10, title: 'Finish pre-course assignments', detail: 'Complete assignments in WINGS and review the testable material.' },
  { days: 1, title: 'Arrive in the local area', detail: 'Be in the Montgomery, Alabama area by 11:59 pm.' },
  { days: 0, title: 'Report for your first day', detail: '0700–0730 · Check your welcome email for your final instructions.' },
];
export default function PreparationOverview() {
  const { plan, ready, error } = usePlan(); const stats = readiness(plan);
  const groups = ['Required', 'Documents', 'Recommended'].map(name => { const g = plan.items.filter(i => applicable(i, plan.profile) && categoryFor(i, plan.profile) === name); const done = g.filter(i => i.is_packed).length; return { name, done, total: g.length, pct: g.length ? Math.round(100 * done / g.length) : 0 }; });
  return <>
    <section className="surface mb-6 p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="text-lg font-semibold text-slate-900">Your progress</h2><p className="mt-1 text-xs text-slate-500">{!ready ? 'Loading…' : error ? 'Changes are only saved for this session.' : 'Automatically saved in this browser.'}</p></div>
        <p className="font-display text-4xl font-semibold text-slate-900">{ready ? `${stats.percent}%` : '—'}<span className="ml-1 text-sm font-normal text-slate-500">ready</span></p>
      </div>
      <div className="mt-4 space-y-3">{groups.map(g => <div key={g.name}><div className="mb-1 flex justify-between text-xs"><span className="font-semibold text-slate-700">{g.name}</span><span className="text-slate-500">{ready ? `${g.done} / ${g.total}` : ''}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all ${g.pct === 100 ? 'bg-[#34C759]' : 'bg-[#007AFF]'}`} style={{ width: `${ready ? g.pct : 0}%` }} /></div></div>)}</div>
      <Link href="/" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#007AFF] px-5 text-[15px] font-semibold text-white">{stats.remaining > 0 || !ready ? `Continue checklist${ready ? ` · ${stats.remaining} left` : ''}` : 'Review checklist'}</Link>
    </section>
    <section className="surface p-5 sm:p-6"><div className="flex flex-wrap justify-between gap-2"><h2 className="text-lg font-semibold text-slate-900">Before you arrive</h2><span className="text-xs text-slate-500">Before class start</span></div><ol className="mt-5 space-y-0">{deadlines.map((d, index) => <li key={d.days} className="relative flex gap-4 pb-6 last:pb-0"><div className="flex flex-col items-center"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#007AFF] text-xs font-semibold text-white">{index+1}</span>{index < deadlines.length-1 && <span className="mt-2 h-full w-px bg-slate-200" />}</div><div><p className="text-xs font-semibold uppercase tracking-wide text-[#007AFF]">{d.days ? `${d.days} ${d.days === 1 ? 'day' : 'days'} before` : 'Class start'}</p><h3 className="mt-1 text-sm font-semibold text-slate-900">{d.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{d.detail}</p></div></li>)}</ol></section>
    <a href="/OTS_Orientation_Guide_CAO_27-Mar-2026.pdf" target="_blank" rel="noopener noreferrer" className="surface mt-6 flex items-center justify-between gap-4 p-5"><div><p className="text-sm font-semibold text-slate-900">Official Orientation Guide</p><p className="mt-1 text-xs text-slate-500">27 March 2026 edition · PDF</p></div><span aria-hidden="true">↗</span></a>
  </>;
}

