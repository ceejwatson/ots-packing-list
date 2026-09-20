'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { type GrowthEvent, publicPages } from '@/lib/growth-events';

export function measure(event: GrowthEvent) {
  if (navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
  void fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(event), keepalive: true }).catch(() => {});
}

export default function GrowthMeasurement({ enabled }: { enabled: boolean }) {
  const page = usePathname();
  useEffect(() => {
    if (!enabled || !publicPages.includes(page)) return;
    let source: GrowthEvent['source'] = 'direct';
    try {
      const host = new URL(document.referrer).hostname;
      if (host !== location.hostname) source = /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|search\.yahoo\.com)$/.test(host) ? 'search' : 'referral';
    } catch { /* no referrer */ }
    measure({ event: 'page_view', page, source, device: matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop' });
    const viewed = new Set<string>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const item = (entry.target as HTMLElement).dataset.productId;
        if (entry.isIntersecting && item && !viewed.has(item)) { viewed.add(item); measure({ event: 'product_view', page, item }); }
      }
    }, { threshold: 0.5 });
    const observe = () => document.querySelectorAll('[data-product-id]').forEach(el => observer.observe(el));
    observe();
    const mutations = new MutationObserver(observe);
    mutations.observe(document.getElementById('main-content') || document.body, { childList: true, subtree: true });
    const clicked = (event: MouseEvent) => {
      if (event.type === 'auxclick' && event.button !== 1) return;
      const link = (event.target as Element)?.closest?.('a[data-affiliate-item]') as HTMLElement | null;
      if (link?.dataset.affiliateItem) measure({ event: 'affiliate_click', page, item: link.dataset.affiliateItem });
      const checkbox = (event.target as Element)?.closest?.('button[role="checkbox"]') as HTMLButtonElement | null;
      const item = checkbox?.closest('article')?.id;
      if (item && !checkbox?.disabled) measure({ event: 'checklist_change', page, item });
    };
    let timer: ReturnType<typeof setTimeout>;
    const searched = (event: Event) => {
      if (!(event.target instanceof HTMLInputElement) || event.target.type !== 'search') return;
      clearTimeout(timer);
      if (event.target.value.trim()) timer = setTimeout(() => measure({ event: 'search', page }), 1000);
    };
    document.addEventListener('click', clicked); document.addEventListener('auxclick', clicked); document.addEventListener('input', searched);
    return () => { observer.disconnect(); mutations.disconnect(); clearTimeout(timer); document.removeEventListener('click', clicked); document.removeEventListener('auxclick', clicked); document.removeEventListener('input', searched); };
  }, [page, enabled]);
  return null;
}
