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
  const image = <span className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-100">
    {item.image_url && !imageFailed ? <Image src={item.image_url} alt={item.item_name} fill sizes="56px" loading="lazy" onError={() => setImageFailed(true)} className="object-contain p-0.5" /> : null}
  </span>;
  return <article id={item.id} className={`flex items-start gap-1 py-1 pl-1 pr-3 sm:pr-4 ${excluded ? 'bg-slate-50' : ''}`}>
    <button role="checkbox" aria-checked={item.is_packed} aria-label={`Mark ${item.item_name} complete`} disabled={!ready || excluded} onClick={() => onChange(item.id, 'is_packed')} className="flex h-12 w-12 shrink-0 items-center justify-center self-start">
      <span aria-hidden="true" className={`flex h-[26px] w-[26px] items-center justify-center rounded-full border-[1.5px] text-sm font-bold transition-colors ${item.is_packed ? 'border-[#007AFF] bg-[#007AFF] text-white' : 'border-slate-300 bg-white'}`}>{item.is_packed ? '✓' : ''}</span>
    </button>
    <div className="min-w-0 flex-1 pb-2 pt-3.5">
      <h3 className={`text-[15px] font-medium leading-5 ${item.is_packed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.item_name}{!item.notes?.includes('Min:') && item.quantity > 1 && <span className="ml-1 text-xs font-normal text-slate-500">×{item.quantity}</span>}</h3>
      {item.notes && <p className="mt-0.5 text-[13px] leading-[18px] text-slate-500">{item.notes}</p>}
      {(item.section || item.seasonal) && <div className="mt-1.5 flex flex-wrap gap-1">
        {item.section && <span className={`item-tag ${item.section === 'Womens' ? 'item-tag-womens' : 'item-tag-mens'}`}>{item.section === 'Womens' ? "Women's" : "Men's"}</span>}
        {item.seasonal && <span className="item-tag">Oct–May required</span>}
      </div>}
      {excluded && <button disabled={!ready} onClick={() => onChange(item.id, 'not_applicable')} className="mt-2 min-h-11 rounded-full bg-[#007AFF] px-4 text-[13px] font-semibold text-white">Include item</button>}
    </div>
    <div className="flex w-14 shrink-0 flex-col items-center self-start">
      {url ? <a href={url} target="_blank" rel="noopener noreferrer sponsored" aria-label={`View ${item.item_name} on Amazon`}>{image}</a> : image}
      {url ? <a href={url} target="_blank" rel="noopener noreferrer sponsored" aria-label={`Buy ${item.item_name} on Amazon`} className="flex min-h-8 items-center text-xs font-medium text-[#007AFF]">Amazon</a> : item.aafes_only ? <span className="flex min-h-8 items-center text-xs text-slate-500">AAFES</span> : null}
    </div>
  </article>;
}
