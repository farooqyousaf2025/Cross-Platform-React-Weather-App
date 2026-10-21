import WeatherIcon from './WeatherIcon.jsx';
import { describeCode } from '../../shared/weatherCodes.js';
import { formatDay, formatTemp, tempValue } from '../../shared/format.js';

export default function DailyForecast({ data, unit }) {
  const daily = data.daily;
  const lows = daily.temperature_2m_min.map((v) => tempValue(v, unit));
  const highs = daily.temperature_2m_max.map((v) => tempValue(v, unit));
  const floor = Math.min(...lows);
  const ceil = Math.max(...highs);
  const span = ceil - floor || 1;

  return (
    <section className="daily" aria-labelledby="daily-heading">
      <h2 id="daily-heading" className="section-title">7-day forecast</h2>
      <ul className="day-list">
        {daily.time.map((iso, i) => {
          const left = ((lows[i] - floor) / span) * 100;
          const width = Math.max(((highs[i] - lows[i]) / span) * 100, 4);
          const condition = describeCode(daily.weather_code[i]);
          return (
            <li key={iso} className="day">
              <span className="day-name">{formatDay(iso)}</span>
              <WeatherIcon icon={condition.icon} size={22} />
              <span className="day-label">{condition.label}</span>
              <span className="day-pop">{daily.precipitation_probability_max[i] ?? 0}%</span>
              <span className="day-low">{formatTemp(daily.temperature_2m_min[i], unit)}</span>
              <span className="day-bar" aria-hidden="true">
                <span
                  className="day-bar-fill"
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              </span>
              <span className="day-high">{formatTemp(daily.temperature_2m_max[i], unit)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
