import WeatherIcon from './WeatherIcon.jsx';
import { describeCode } from '../../shared/weatherCodes.js';
import { formatTemp } from '../../shared/format.js';

export default function SavedCities({ cities, activeId, unit, onSelect, onRemove }) {
  if (cities.length === 0) return null;

  return (
    <section className="saved" aria-labelledby="saved-heading">
      <h2 id="saved-heading" className="section-title">Saved cities</h2>
      <ul className="saved-list">
        {cities.map((city) => (
          <li key={city.id}>
            <div className={`saved-item ${city.id === activeId ? 'active' : ''}`}>
              <button type="button" className="saved-open" onClick={() => onSelect(city)}>
                <span className="saved-name">{city.name}</span>
                <span className="saved-sub">{city.countryCode}</span>
              </button>
              {city.weather ? (
                <span className="saved-temp">
                  <WeatherIcon icon={describeCode(city.weather.current.weather_code).icon} size={18} />
                  <strong>{formatTemp(city.weather.current.temperature_2m, unit)}</strong>
                </span>
              ) : (
                <span className="saved-temp muted">--</span>
              )}
              <button
                type="button"
                className="saved-remove"
                onClick={() => onRemove(city.id)}
                aria-label={`Remove ${city.name} from saved cities`}
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
