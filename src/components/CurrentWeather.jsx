import WeatherIcon from './WeatherIcon.jsx';
import { describeCode } from '../../shared/weatherCodes.js';
import { formatClock, formatTemp, formatWind, compass } from '../../shared/format.js';

export default function CurrentWeather({ place, data, unit, hour24, isSaved, onToggleSave }) {
  const c = data.current;
  const day = data.daily;
  const condition = describeCode(c.weather_code);

  return (
    <section className="current" aria-label="Current conditions">
      <header className="current-head">
        <div>
          <h1 className="place">{place.name}</h1>
          <p className="place-sub">{[place.admin, place.country].filter(Boolean).join(', ')}</p>
        </div>
        <button
          type="button"
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          onClick={onToggleSave}
          aria-pressed={isSaved}
        >
          {isSaved ? '★ Saved' : '☆ Save city'}
        </button>
      </header>

      <div className="hero">
        <WeatherIcon icon={condition.icon} size={72} className="hero-icon" />
        <div className="hero-read">
          <span className="big-temp">{formatTemp(c.temperature_2m, unit)}</span>
          <div className="hero-meta">
            <p className="condition">{condition.label}</p>
            <p className="feels">
              Feels like {formatTemp(c.apparent_temperature, unit)}
              {' · '}
              H {formatTemp(day.temperature_2m_max[0], unit)}
              {' · '}
              L {formatTemp(day.temperature_2m_min[0], unit)}
            </p>
          </div>
        </div>
      </div>

      <ul className="details">
        <Detail label="Humidity" value={`${c.relative_humidity_2m}%`} />
        <Detail
          label="Wind"
          value={`${formatWind(c.wind_speed_10m, unit)} ${compass(c.wind_direction_10m)}`}
        />
        <Detail label="Pressure" value={`${Math.round(c.pressure_msl)} hPa`} />
        <Detail label="Cloud cover" value={`${c.cloud_cover}%`} />
        <Detail label="UV index" value={formatUv(c.uv_index)} />
        <Detail label="Precipitation" value={`${c.precipitation} mm`} />
        <Detail label="Sunrise" value={formatClock(day.sunrise[0], hour24)} />
        <Detail label="Sunset" value={formatClock(day.sunset[0], hour24)} />
      </ul>
    </section>
  );
}

function Detail({ label, value }) {
  return (
    <li className="detail">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </li>
  );
}

function formatUv(uv) {
  if (uv == null) return '--';
  const value = Number(uv.toFixed(1));
  const band = value <= 2 ? 'Low' : value <= 5 ? 'Moderate' : value <= 7 ? 'High' : 'Very high';
  return `${value} · ${band}`;
}
