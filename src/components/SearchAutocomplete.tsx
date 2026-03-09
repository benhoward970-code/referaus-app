'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { providers } from '@/lib/providers';

const allServices = Array.from(new Set(providers.flatMap(p => p.services))).sort();
const allSuburbs = Array.from(new Set(providers.map(p => p.suburb))).sort();
const suggestions = [...allServices.map(s => ({ type: 'service', text: s })), ...allSuburbs.map(s => ({ type: 'location', text: s })), ...providers.map(p => ({ type: 'provider', text: p.name }))];

export function SearchAutocomplete({ className = '' }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filtered = query.length >= 2 ? suggestions.filter(s => s.text.toLowerCase().includes(query.toLowerCase())).slice(0, 8) : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = (text: string) => { router.push('/providers?q=' + encodeURIComponent(text)); setOpen(false); setQuery(''); };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (selected >= 0 && filtered[selected]) go(filtered[selected].text); else if (query) go(query); }
    else if (e.key === 'Escape') setOpen(false);
  };

  const typeIcon = (t: string) => t === 'service' ? '🏷️' : t === 'location' ? '📍' : '🏢';

  return (
    <div ref={ref} className={'relative ' + className}>
      <input type="text" value={query} onChange={e => { setQuery(e.target.value); setOpen(true); setSelected(-1); }} onFocus={() => setOpen(true)} onKeyDown={onKey}
        placeholder="Search services, suburbs, or providers..."
        className="w-full px-5 py-3.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white shadow-sm"
        aria-label="Search providers" aria-expanded={open && filtered.length > 0} role="combobox" aria-autocomplete="list" />
      {open && filtered.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50" role="listbox">
          {filtered.map((s, i) => (
            <li key={s.type + s.text} role="option" aria-selected={i === selected}
              onClick={() => go(s.text)} onMouseEnter={() => setSelected(i)}
              className={'flex items-center gap-3 px-4 py-3 text-sm cursor-pointer transition-colors ' + (i === selected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50')}>
              <span className="text-xs">{typeIcon(s.type)}</span>
              <span>{s.text}</span>
              <span className="ml-auto text-xs text-gray-400">{s.type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
