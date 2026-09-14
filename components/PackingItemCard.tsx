"use client";

import Image from 'next/image';
import { useState } from 'react';
import { getAmazonLink, type PackingItem } from '@/lib/packing-list-data';

type StatusField = 'is_owned' | 'is_packed' | 'not_applicable';

export default function PackingItemCard({ item, excluded, ready, onChange }: {
  item: PackingItem;
  excluded: boolean;
  ready: boolean;
  onChange: (id: string, field: StatusField) => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const affiliateUrl = item.aafes_only ? '' : getAmazonLink(item.amazon_search, item.amazon_asin);

  return (
    <article className={`relative isolate p-3 transition-colors sm:p-5 ${excluded ? 'bg-slate-50' : item.is_packed ? 'bg-emerald-50/30' : ''} ${affiliateUrl ? 'hover:bg-blue-50/40' : ''}`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          {(item.section || item.seasonal || item.not_applicable) && (
            <div className="mb-1 flex flex-wrap gap-2">
              {item.section && <span className="item-tag">{item.section === 'Womens' ? "Women's" : "Men's"}</span>}
              {item.seasonal && <span className="item-tag">Oct–May required</span>}
              {item.not_applicable && <span className="item-tag">Not applicable</span>}
            </div>
          )}
          <h3 className={`text-sm font-semibold leading-6 ${item.is_packed ? 'text-emerald-800' : 'text-slate-900'}`}>
            {affiliateUrl ? (
              <a href={affiliateUrl} target="_blank" rel="noopener noreferrer sponsored"
                aria-label={`View ${item.item_name} on Amazon`}
                className="after:absolute after:inset-0 after:cursor-pointer focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-blue-700">
                {item.item_name}
              </a>
            ) : item.item_name}
            {!item.notes?.includes('Min:') && item.quantity > 1 && <span className="ml-2 text-xs text-slate-500">×{item.quantity}</span>}
          </h3>
          {item.notes && <p className="mt-1 text-xs leading-5 text-slate-500">{item.notes}</p>}
          {affiliateUrl && <span className="mt-1 block text-[11px] font-semibold text-blue-800" aria-hidden="true">Amazon ↗</span>}
          {item.aafes_only && <span className="mt-1 block text-[10px] font-bold tracking-wider text-slate-500">AAFES</span>}
        </div>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white p-1">
          {item.image_url && !imageFailed ? (
            <Image src={item.image_url} alt="" width={68} height={68} sizes="68px"
              onError={() => setImageFailed(true)} className="h-[68px] w-[68px] object-contain" />
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-slate-300">
              <path d="m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9" />
            </svg>
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button disabled={!ready} aria-pressed={!!item.is_owned} onClick={() => onChange(item.id, 'is_owned')}
          className={`status-button relative z-10 ${item.is_owned ? 'owned' : ''}`}>
          <span aria-hidden="true">{item.is_owned ? '✓ ' : '+ '}</span>Have it
        </button>
        <button disabled={!ready} aria-pressed={item.is_packed} onClick={() => onChange(item.id, 'is_packed')}
          className={`status-button relative z-10 ${item.is_packed ? 'packed' : ''}`}>{item.is_packed ? '✓ Packed' : 'Pack item'}</button>
        <button disabled={!ready} aria-pressed={!!item.not_applicable} onClick={() => onChange(item.id, 'not_applicable')}
          className="relative z-10 ml-auto min-h-11 px-2 text-xs text-slate-500 hover:text-slate-900">{item.not_applicable ? 'Include again' : 'Not applicable'}</button>
      </div>
    </article>
  );
}

