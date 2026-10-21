const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const CURRENT_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'precipitation',
  'weather_code',
  'cloud_cover',
  'pressure_msl',
  'wind_speed_10m',
  'wind_direction_10m',
  'uv_index',
];

const HOURLY_FIELDS = [
  'temperature_2m',
  'weather_code',
  'precipitation_probability',
  'is_day',
];

const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'sunrise',
  'sunset',
  'precipitation_probability_max',
  'uv_index_max',
];

export async function searchPlaces(query, signal) {
  const params = new URLSearchParams({ name: query, count: '8', language: 'en', format: 'json' });
  const res = await fetch(`${GEO_URL}?${params}`, { signal });
  if (!res.ok) throw new Error('Could not search for that place. Please try again.');
  const data = await res.json();
  return (data.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    admin: r.admin1 ?? '',
    country: r.country ?? '',
    countryCode: r.country_code ?? '',
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
  }));
}

export async function fetchWeather(place, signal) {
  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current: CURRENT_FIELDS.join(','),
    hourly: HOURLY_FIELDS.join(','),
    daily: DAILY_FIELDS.join(','),
    timezone: 'auto',
    forecast_days: '7',
  });
  const res = await fetch(`${FORECAST_URL}?${params}`, { signal });
  if (!res.ok) throw new Error('Weather service is unavailable. Please try again shortly.');
  return res.json();
}

export async function fetchSnapshot(place, signal) {
  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current: 'temperature_2m,weather_code',
    timezone: 'auto',
  });
  const res = await fetch(`${FORECAST_URL}?${params}`, { signal });
  if (!res.ok) throw new Error('snapshot failed');
  return res.json();
}
