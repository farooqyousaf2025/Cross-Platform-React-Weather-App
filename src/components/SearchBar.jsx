import { useEffect, useRef, useState } from 'react';
import { searchPlaces } from '../../shared/weatherApi.js';

export default function SearchBar({ onSelect, busy }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);

  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const timer = setTimeout(async () => {
      try {
        const found = await searchPlaces(q, controller.signal);
        setResults(found);
        setOpen(true);
        setActive(0);
      } catch (err) {
        if (err.name !== 'AbortError') setError('Search failed. Check your connection.');
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  useEffect(() => {
    function onDocClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function choose(place) {
    onSelect(place);
    setTerm('');
    setResults([]);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="search" ref={boxRef}>
      <div className={`search-field ${busy ? 'is-busy' : ''}`}>
        <svg className="search-glyph" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search a city…"
          aria-label="Search for a city"
          aria-expanded={open}
          autoComplete="off"
        />
        {loading && <span className="search-spinner" aria-label="Searching" />}
      </div>

      {error && <p className="search-error" role="alert">{error}</p>}

      {open && results.length > 0 && (
        <ul className="results" role="listbox">
          {results.map((p, i) => (
            <li key={p.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                className={i === active ? 'active' : ''}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(p)}
              >
                <span className="result-name">{p.name}</span>
                <span className="result-meta">{[p.admin, p.country].filter(Boolean).join(', ')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
