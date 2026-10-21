import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'react-weather-app:mobile:';
const CACHE_PREFIX = `${PREFIX}cache:`;

export const KEYS = {
  place: `${PREFIX}place`,
  unit: `${PREFIX}unit`,
  hour24: `${PREFIX}hour24`,
  saved: `${PREFIX}saved`,
};

async function getJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function setJson(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage failures only cost persistence, never the current session.
  }
}

export function loadPrefs() {
  return getJson(KEYS.place, null).then((place) =>
    Promise.all([
      Promise.resolve(place),
      getJson(KEYS.unit, 'c'),
      getJson(KEYS.hour24, false),
      getJson(KEYS.saved, []),
    ]),
  ).then(([place, unit, hour24, saved]) => ({ place, unit, hour24, saved }));
}

export const savePlace = (place) => setJson(KEYS.place, place);
export const saveUnit = (unit) => setJson(KEYS.unit, unit);
export const saveHour24 = (hour24) => setJson(KEYS.hour24, hour24);
export const saveSaved = (saved) => setJson(KEYS.saved, saved);

export function readCache(placeId) {
  return getJson(`${CACHE_PREFIX}${placeId}`, null);
}

export function writeCache(placeId, data) {
  return setJson(`${CACHE_PREFIX}${placeId}`, { at: Date.now(), data });
}

export async function pruneCache(keepIds) {
  try {
    const all = await AsyncStorage.getAllKeys();
    const stale = all.filter(
      (k) => k.startsWith(CACHE_PREFIX) && !keepIds.includes(k.slice(CACHE_PREFIX.length)),
    );
    if (stale.length > 0) await AsyncStorage.multiRemove(stale);
  } catch {
    // Ignoring cache cleanup failures keeps the app usable.
  }
}
