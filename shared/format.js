export function formatTemp(celsius, unit) {
  if (celsius == null) return '--';
  const value = unit === 'f' ? celsius * 9 / 5 + 32 : celsius;
  return `${Math.round(value)}°`;
}

export function tempValue(celsius, unit) {
  return unit === 'f' ? celsius * 9 / 5 + 32 : celsius;
}

export function formatWind(speedKmh, unit) {
  if (speedKmh == null) return '--';
  return unit === 'f'
    ? `${(speedKmh * 0.621371).toFixed(1)} mph`
    : `${speedKmh.toFixed(1)} km/h`;
}

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

export function compass(degrees) {
  if (degrees == null) return '';
  return COMPASS[Math.round(degrees / 22.5) % 16];
}

export function formatHour(iso, hour24 = false) {
  const d = new Date(iso);
  const h = d.getHours();
  if (hour24) return `${String(h).padStart(2, '0')}:00`;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12} ${suffix}`;
}

export function formatDay(iso) {
  const key = iso.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  if (key === today) return 'Today';
  return new Date(`${key}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatClock(iso, hour24 = false) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', hour24
    ? { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
    : { hour: 'numeric', minute: '2-digit' });
}
