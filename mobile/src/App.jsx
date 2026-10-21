import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import CurrentPanel from './components/CurrentPanel.jsx';
import DailyList from './components/DailyList.jsx';
import Focusable from './components/Focusable.jsx';
import HourlyStrip from './components/HourlyStrip.jsx';
import SavedRow from './components/SavedRow.jsx';
import SearchField from './components/SearchField.jsx';
import { fetchSnapshot, fetchWeather } from '../../shared/weatherApi.js';
import {
  loadPrefs,
  pruneCache,
  readCache,
  saveHour24,
  savePlace,
  saveSaved,
  saveUnit,
  writeCache,
} from './storage.js';
import { colors, font, isTV, radius, space } from './theme.js';

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
  const [ready, setReady] = useState(false);
  const [place, setPlace] = useState(DEFAULT_PLACE);
  const [unit, setUnit] = useState('c');
  const [hour24, setHour24] = useState(false);
  const [saved, setSaved] = useState([]);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);
  const savedRef = useRef(saved);
  savedRef.current = saved;

  useEffect(() => {
    loadPrefs().then((prefs) => {
      if (prefs.place) setPlace(prefs.place);
      setUnit(prefs.unit);
      setHour24(prefs.hour24);
      setSaved(prefs.saved);
      setReady(true);
    });
  }, []);

  useEffect(() => { if (ready) savePlace(place); }, [place, ready]);
  useEffect(() => { if (ready) saveUnit(unit); }, [unit, ready]);
  useEffect(() => { if (ready) saveHour24(hour24); }, [hour24, ready]);
  useEffect(() => { if (ready) saveSaved(saved); }, [saved, ready]);

  useEffect(() => {
    if (!ready) return undefined;
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      const cached = await readCache(place.id);
      if (cancelled) return;
      if (cached?.data) {
        setData(cached.data);
        setOffline(true);
        setStatus('ready');
      } else {
        setStatus('loading');
      }

      try {
        const fresh = await fetchWeather(place, controller.signal);
        if (cancelled) return;
        setData(fresh);
        setStatus('ready');
        setOffline(false);
        setError('');
        writeCache(place.id, fresh);
      } catch (err) {
        if (cancelled || err.name === 'AbortError') return;
        if (cached?.data) {
          setStatus('ready');
          setOffline(true);
          setError('Live update failed. Showing the last saved reading.');
        } else {
          setStatus('error');
          setError(err.message);
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [place, ready]);

  const refreshSnapshots = useCallback((currentPlaceId) => {
    savedRef.current
      .filter((city) => city.id !== currentPlaceId)
      .forEach(async (city) => {
        try {
          const snapshot = await fetchSnapshot(city);
          setSaved((list) =>
            list.map((c) => (c.id === city.id ? { ...c, snapshot: snapshot.current } : c)),
          );
        } catch {
          // One unreachable pin should not block the rest of the row.
        }
      });
  }, []);

  useEffect(() => {
    if (ready) refreshSnapshots(place.id);
  }, [ready, place, refreshSnapshots]);

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

  const isSaved = useMemo(() => saved.some((c) => c.id === place.id), [saved, place.id]);

  function toggleSave() {
    if (isSaved) {
      setSaved((list) => list.filter((c) => c.id !== place.id));
      pruneCache([...saved.filter((c) => c.id !== place.id).map((c) => String(c.id)), place.id]);
    } else {
      const snapshot = data ? { ...data.current } : null;
      setSaved((list) => [...list, { ...place, snapshot }]);
    }
  }

  function removeSaved(id) {
    setSaved((list) => list.filter((c) => c.id !== id));
    pruneCache([...saved.filter((c) => c.id !== id).map((c) => String(c.id)), place.id]);
  }

  return (
    <View style={styles.root}>
      <ExpoStatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Text style={styles.brand}>Weather</Text>
          <View style={styles.toggles}>
            <View style={styles.segment}>
              {['c', 'f'].map((u) => (
                <Focusable
                  key={u}
                  onPress={() => setUnit(u)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: unit === u }}
                  style={({ focused }) => [
                    styles.segmentBtn,
                    unit === u && styles.segmentOn,
                    focused && isTV && { borderColor: colors.accent },
                  ]}
                >
                  <Text style={[styles.segmentText, unit === u && styles.segmentTextOn]}>
                    °{u.toUpperCase()}
                  </Text>
                </Focusable>
              ))}
            </View>
            <Focusable
              onPress={() => setHour24((v) => !v)}
              accessibilityRole="button"
              accessibilityState={{ selected: hour24 }}
              style={({ focused }) => [
                styles.clockBtn,
                hour24 && { borderColor: colors.accent },
                focused && isTV && { backgroundColor: colors.panelAlt },
              ]}
            >
              <Text style={styles.segmentText}>{hour24 ? '24h' : '12h'}</Text>
            </Focusable>
          </View>
        </View>

        <View style={styles.searchRow}>
          <SearchField onSelect={selectPlace} />
        </View>

        {error !== '' && status === 'ready' && (
          <Text style={styles.notice}>{error}</Text>
        )}

        {status === 'error' ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Focusable
              onPress={() => setPlace((p) => ({ ...p }))}
              accessibilityRole="button"
              style={styles.retryBtn}
            >
              <Text style={styles.retryText}>Retry</Text>
            </Focusable>
          </View>
        ) : data ? (
          <View style={styles.stack}>
            <CurrentPanel
              place={place}
              data={data}
              unit={unit}
              hour24={hour24}
              isSaved={isSaved}
              onToggleSave={toggleSave}
            />
            <HourlyStrip data={data} unit={unit} hour24={hour24} />
            <DailyList data={data} unit={unit} />
            <SavedRow
              cities={saved}
              activeId={place.id}
              unit={unit}
              onSelect={selectPlace}
              onRemove={removeSaved}
            />
            {offline && <Text style={styles.credit}>Showing saved data — pull a refresh by searching the city again.</Text>}
            <Text style={styles.credit}>Weather data from Open-Meteo. No API key required.</Text>
          </View>
        ) : (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading forecast…</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const topInset = StatusBar.currentHeight ?? 0;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: space.lg, paddingTop: topInset + space.lg, gap: space.md },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  brand: {
    color: colors.muted,
    fontSize: font.sm,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  toggles: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginLeft: 'auto' },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.panel,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 3,
    gap: 3,
  },
  segmentBtn: { paddingHorizontal: space.md, paddingVertical: space.xs, borderRadius: radius.pill },
  segmentOn: { backgroundColor: colors.accent },
  segmentText: { color: colors.muted, fontSize: font.sm },
  segmentTextOn: { color: colors.onAccent, fontWeight: '700' },
  clockBtn: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchRow: { flexDirection: 'row' },
  notice: { color: colors.warm, fontSize: font.sm },
  stack: { gap: space.md },
  errorCard: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.xl,
    alignItems: 'center',
    gap: space.md,
  },
  errorText: { color: colors.bad, fontSize: font.md, textAlign: 'center' },
  retryBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  retryText: { color: colors.onAccent, fontWeight: '700', fontSize: font.md },
  loadingCard: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.xl,
  },
  loadingText: { color: colors.muted, fontSize: font.md },
  credit: { color: colors.muted, fontSize: font.xs, marginTop: space.sm, textAlign: 'center' },
});
