import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SearchBar from './components/SearchBar.jsx';
import SavedCities from './components/SavedCities.jsx';
import CurrentWeather from './components/CurrentWeather.jsx';
import HourlyForecast from './components/HourlyForecast.jsx';
import DailyForecast from './components/DailyForecast.jsx';
import { fetchSnapshot, fetchWeather } from '../shared/weatherApi.js';
import { usePersistentState } from './lib/hooks.js';

const DEFAULT_PLACE = {
  id: 5125771,
  name: 'New York',
  admin: 'New York',
  country: 'United States',
  countryCode: 'US',
  latitude: 40.7143,
  longitude: -74.006,
};

export default function App() {
  const [place, setPlace] = usePersistentState('react-weather-app:place', DEFAULT_PLACE);
  const [unit, setUnit] = usePersistentState('react-weather-app:unit', 'c');
  const [hour24, setHour24] = usePersistentState('react-weather-app:hour24', false);
  const [saved, setSaved] = usePersistentState('react-weather-app:saved', []);

  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reload, setReload] = useState(0);
  const [locating, setLocating] = useState(false);
  const savedRef = useRef(saved);
  savedRef.current = saved;

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    setError('');
    fetchWeather(place, controller.signal)
      .then((result) => {
        setData(result);
        setStatus('ready');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setStatus('error');
        setError(err.message);
      });
    return () => controller.abort();
  }, [place, reload]);

  const refreshSaved = useCallback(() => {
    const others = savedRef.current.filter((c) => c.id !== place.id);
    others.forEach(async (city) => {
      try {
        const snapshot = await fetchSnapshot(city);
        setSaved((list) =>
          list.map((c) => (c.id === city.id ? { ...c, snapshot: snapshot.current } : c)),
        );
      } catch {
        // A stale tile is not worth interrupting the user for.
      }
    });
  }, [place.id, setSaved]);

  useEffect(() => {
    refreshSaved();
  }, [refreshSaved]);

  const isSaved = useMemo(() => saved.some((c) => c.id === place.id), [saved, place.id]);

  function selectPlace(city) {
    setPlace({
      id: city.id,
      name: city.name,
      admin: city.admin ?? '',
      country: city.country ?? '',
      countryCode: city.countryCode ?? '',
      latitude: city.latitude,
      longitude: city.longitude,
    });
  }

  function toggleSave() {
    if (isSaved) {
      setSaved((list) => list.filter((c) => c.id !== place.id));
    } else {
      const snapshot = data ? { ...data.current } : null;
      setSaved((list) => [...list, { ...place, snapshot }]);
    }
  }

  function removeSaved(id) {
    setSaved((list) => list.filter((c) => c.id !== id));
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setNotice('This browser cannot share a location.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const latitude = Number(coords.latitude.toFixed(4));
        const longitude = Number(coords.longitude.toFixed(4));
        setNotice('');
        setPlace({
          id: `pin-${latitude}-${longitude}`,
          name: 'My location',
          admin: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
          country: '',
          countryCode: '',
          latitude,
          longitude,
        });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setNotice('Location permission was denied. Search for a city instead.');
      },
      { timeout: 8000 },
    );
  }

  return (
    <div className="app" data-unit={unit}>
      <header className="topbar">
        <span className="brand">Weather</span>
        <SearchBar onSelect={selectPlace} busy={status === 'loading'} />
        <div className="toggles">
          <button type="button" className="ghost" onClick={useMyLocation} disabled={locating}>
            {locating ? 'Locating…' : 'My location'}
          </button>
          <div className="unit-switch" role="group" aria-label="Temperature units">
            {['c', 'f'].map((u) => (
              <button
                key={u}
                type="button"
                className={unit === u ? 'on' : ''}
                aria-pressed={unit === u}
                onClick={() => setUnit(u)}
              >
                °{u.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`ghost ${hour24 ? 'on' : ''}`}
            aria-pressed={hour24}
            onClick={() => setHour24((v) => !v)}
          >
            24h
          </button>
        </div>
      </header>

      <main className="content">
        {notice && (
          <p className="notice" role="status">
            {notice}
            <button type="button" onClick={() => setNotice('')} aria-label="Dismiss message">×</button>
          </p>
        )}
        {status === 'error' ? (
          <div className="state error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => setReload((n) => n + 1)}>Retry</button>
          </div>
        ) : status === 'loading' && !data ? (
          <div className="state loading" aria-live="polite">
            <div className="skeleton hero-skeleton" />
            <div className="skeleton row-skeleton" />
            <div className="skeleton row-skeleton" />
          </div>
        ) : data ? (
          <div className={status === 'loading' ? 'stale' : ''}>
            <CurrentWeather
              place={place}
              data={data}
              unit={unit}
              hour24={hour24}
              isSaved={isSaved}
              onToggleSave={toggleSave}
            />
            <HourlyForecast data={data} unit={unit} hour24={hour24} />
            <DailyForecast data={data} unit={unit} />
          </div>
        ) : null}
      </main>

      <aside className="sidebar">
        <SavedCities
          cities={saved.map((c) => ({ ...c, weather: c.snapshot ? { current: c.snapshot } : null }))}
          activeId={place.id}
          unit={unit}
          onSelect={selectPlace}
          onRemove={removeSaved}
        />
        <p className="credit">
          Data from{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo
          </a>
          . No API key required.
        </p>
      </aside>
    </div>
  );
}
