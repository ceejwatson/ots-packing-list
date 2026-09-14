"use client";
import { usePlan } from './PlanProvider';

const deadlines = [
  { days: 14, title: 'Complete medical requirements', detail: 'WINGS · 1630 CT cutoff. Also submit any religious accommodation requests.' },
  { days: 10, title: 'Finish pre-course assignments', detail: 'Complete assignments in WINGS and review the testable material.' },
  { days: 1, title: 'Arrive in the local area', detail: 'Be in the Montgomery, Alabama area by 11:59 pm.' },
  { days: 0, title: 'Report for your first day', detail: '0700–0730 · Check your welcome email for your final instructions.' },
];
export default function PreparationOverview() {
  const { ready, error } = usePlan();
  return <>
    <section className="surface p-5 sm:p-6"><div className="flex flex-wrap justify-between gap-2"><h2 className="text-lg font-semibold text-slate-900">Before you arrive</h2><span className="text-xs text-slate-500">Before class start</span></div><ol className="mt-5 space-y-0">{deadlines.map((d, index) => <li key={d.days} className="relative flex gap-4 pb-6 last:pb-0"><div className="flex flex-col items-center"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">{index+1}</span>{index < deadlines.length-1 && <span className="mt-2 h-full w-px bg-slate-200" />}</div><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-800">{d.days ? `${d.days} days before` : 'Class start'}</p><h3 className="mt-1 text-sm font-semibold text-slate-900">{d.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{d.detail}</p></div></li>)}</ol></section>
    <section className="surface mt-6 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-lg font-semibold text-slate-900">Your progress</h2><p className="mt-2 text-sm text-slate-500">{!ready ? 'Loading…' : error ? 'Changes are only saved for this session.' : 'Automatically saved in this browser.'}</p></div>
      </div>
    </section>
    <a href="/OTS_Orientation_Guide_CAO_27-Mar-2026.pdf" target="_blank" rel="noopener noreferrer" className="surface mt-6 flex items-center justify-between gap-4 p-5"><div><p className="text-sm font-semibold text-slate-900">Official Orientation Guide</p><p className="mt-1 text-xs text-slate-500">27 March 2026 edition · PDF</p></div><span aria-hidden="true">↗</span></a>
  </>;
}

