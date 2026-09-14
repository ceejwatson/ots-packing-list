"use client";
import Image from 'next/image';
import { useState } from 'react';
import { getAmazonLink, type PackingItem } from '@/lib/packing-list-data';

export default function PackingItemCard({ item, excluded, ready, onChange }: {
  item: PackingItem; excluded: boolean; ready: boolean;
  onChange: (id: string, field: 'is_packed' | 'not_applicable') => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const url = item.aafes_only ? '' : getAmazonLink(item.amazon_search, item.amazon_asin);
  const image = <span className="relative flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-lg bg-white">
    {item.image_url && !imageFailed ? <Image src={item.image_url} alt={item.item_name} fill sizes="88px" loading="lazy" onError={() => setImageFailed(true)} className="object-contain p-0.5" /> : null}
  </span>;
  return <article id={item.id} className={`flex items-start gap-2 border-l-4 p-3 sm:gap-3 sm:p-4 ${excluded ? 'border-l-slate-200 bg-slate-50' : item.is_packed ? 'border-l-emerald-600 bg-emerald-50' : 'border-l-slate-200'}`}>
    <button role="checkbox" aria-checked={item.is_packed} aria-label={`Mark ${item.item_name} complete`} disabled={!ready || excluded} onClick={() => onChange(item.id, 'is_packed')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
      <span aria-hidden="true" className={`flex h-6 w-6 items-center justify-center rounded-md border-2 text-sm ${item.is_packed ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300 bg-white'}`}>{item.is_packed ? '✓' : ''}</span>
    </button>
    <div className="min-w-0 flex-1 pt-2">
      <h3 className={`text-sm font-semibold leading-5 ${item.is_packed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{item.item_name}{!item.notes?.includes('Min:') && item.quantity > 1 && <span className="ml-1 text-xs text-slate-500">×{item.quantity}</span>}</h3>
      {item.notes && <p className="mt-1 text-xs leading-5 text-slate-500">{item.notes}</p>}
      {item.section && <span className="item-tag mt-1 inline-block">{item.section === 'Womens' ? "Women's" : "Men's"}</span>}
      {item.seasonal && <span className="item-tag mt-1 inline-block">Oct–May required</span>}
      {excluded && <button disabled={!ready} onClick={() => onChange(item.id, 'not_applicable')} className="mt-2 min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700">Include item</button>}
    </div>
    <div className="flex w-[88px] shrink-0 flex-col items-center">
      {url ? <a href={url} target="_blank" rel="noopener noreferrer sponsored" aria-label={`View ${item.item_name} image on Amazon`}>{image}</a> : image}
      {url ? <a href={url} target="_blank" rel="noopener noreferrer sponsored" aria-label={`View ${item.item_name} on Amazon`} className="flex min-h-11 items-center text-xs font-semibold text-blue-800">Amazon ↗</a> : item.aafes_only ? <span className="flex min-h-11 items-center text-xs text-slate-500">AAFES</span> : null}
    </div>
  </article>;
}

