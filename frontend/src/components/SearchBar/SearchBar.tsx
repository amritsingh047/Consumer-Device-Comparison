import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchDevices } from '../../api/client';
import type { SearchResult } from '../../types/device';
import './SearchBar.css';

export const SearchBar: React.FC<{ autoFocus?: boolean }> = ({ autoFocus }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const data = await searchDevices(q);
      setResults(data);
      setOpen(true);
    } catch {
      // If the backend is offline or throws an error, show empty results but open the dropdown
      setResults([]);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(query), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, doSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (r: SearchResult) => {
    setQuery(''); setOpen(false);
    navigate(`/device/${r.id}`);
  };

  const handleEnter = () => {
    if (results.length > 0) {
      select(results[0]);
    } else if (query.trim()) {
      setOpen(false);
      navigate(`/?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="searchbar-wrapper" ref={wrapperRef}>
      <div className={`searchbar-input-row ${open && results.length ? 'open' : ''}`}>
        <span className="searchbar-icon">
          {loading ? <span className="searchbar-spinner" /> : '🔍'}
        </span>
        <input
          className="searchbar-input"
          type="text"
          placeholder="Search devices or paste Amazon / Best Buy URL…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus={autoFocus}
          aria-label="Search devices"
          aria-autocomplete="list"
          aria-expanded={open}
          onFocus={() => results.length && setOpen(true)}
          onKeyDown={e => e.key === 'Enter' && handleEnter()}
        />
        {query && (
          <button className="searchbar-clear" onClick={() => { setQuery(''); setResults([]); setOpen(false); }} aria-label="Clear search">✕</button>
        )}
      </div>
      {open && results.length > 0 && (
        <ul className="searchbar-dropdown" role="listbox" aria-label="Search suggestions">
          {results.map(r => (
            <li key={r.id} className="searchbar-item" role="option" onClick={() => select(r)}>
              <img src={r.thumbnailUrl} alt={r.name} className="searchbar-thumb" onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/1e293b/94a3b8?text=?'; }} />
              <div className="searchbar-result-info">
                <span className="searchbar-name">{r.name}</span>
                <span className="searchbar-brand">{r.brand}</span>
                {r.lowestInr && <span className="searchbar-price">₹{r.lowestInr.toLocaleString('en-IN')}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
      {open && !loading && query && results.length === 0 && (
        <div className="searchbar-empty">No devices found for "{query}"</div>
      )}
    </div>
  );
};
