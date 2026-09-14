"use client";
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePlan } from './PlanProvider';
import { readiness } from '@/lib/progress';
const links = [
  { href: '/', label: 'Checklist', path: 'M9 5h11M9 12h11M9 19h11M3 5l1 1 2-2M3 12l1 1 2-2M3 19l1 1 2-2' },
  { href: '/dashboard', label: 'Overview', path: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { href: '/reporting', label: 'Reporting', path: 'M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' },
  { href: '/faqs', label: 'FAQs', path: 'M8 9a4 4 0 0 1 8 0c0 3-4 2-4 5M12 17v.1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z' },
];
export default function Navigation() {
  const pathname = usePathname(); const { plan, ready } = usePlan(); const progress = readiness(plan);
  return <>
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex h-[60px] sm:h-20 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3"><Image src="/ots-shield.png" alt="" width={38} height={44} priority /><span><span className="block font-display text-xl font-semibold uppercase tracking-wide text-slate-900">OTS Packing List</span><span className="hidden sm:block text-[10px] font-semibold uppercase tracking-[.18em] text-slate-500">Prepare with confidence</span></span></Link>
        <nav aria-label="Primary" className="hidden sm:flex gap-1">{links.map(l => <Link key={l.href} href={l.href} aria-current={pathname === l.href ? 'page' : undefined} className={`rounded-lg px-3 py-3 text-sm font-semibold ${pathname === l.href ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{l.label}</Link>)}</nav>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600" aria-label="Required items packed">{ready ? `${progress.percent}%` : '—'} <span className="hidden md:inline">ready</span></span>
      </div>
    </header>
    <nav aria-label="Mobile navigation" className="mobile-dock sm:hidden print:hidden">{links.map(l => <Link key={l.href} href={l.href} aria-current={pathname === l.href ? 'page' : undefined} className={`dock-link ${pathname === l.href ? 'is-active' : ''}`}><span className="dock-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={l.path} /></svg></span><span>{l.label}</span></Link>)}</nav>
  </>;
}
