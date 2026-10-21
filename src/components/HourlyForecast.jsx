import WeatherIcon from './WeatherIcon.jsx';
import { describeCode } from '../../shared/weatherCodes.js';
import { formatHour, formatTemp } from '../../shared/format.js';

function startIndex(times, currentIso) {
  const now = currentIso.slice(0, 13);
  const i = times.findIndex((t) => t.slice(0, 13) >= now);
  return i === -1 ? 0 : i;
}

export default function HourlyForecast({ data, unit, hour24 }) {
  const times = data.hourly.time;
  const from = startIndex(times, data.current.time);
  const slice = times.slice(from, from + 24);

  return (
    <section className="hourly" aria-labelledby="hourly-heading">
      <h2 id="hourly-heading" className="section-title">Next 24 hours</h2>
      <ol className="hour-track">
        {slice.map((iso, i) => {
          const idx = from + i;
          const pop = data.hourly.precipitation_probability[idx];
          return (
            <li key={iso} className="hour">
              <span className="hour-time">{i === 0 ? 'Now' : formatHour(iso, hour24)}</span>
              <WeatherIcon icon={describeCode(data.hourly.weather_code[idx]).icon} size={26} />
              <span className="hour-temp">{formatTemp(data.hourly.temperature_2m[idx], unit)}</span>
              <span className={`hour-pop ${pop >= 30 ? 'likely' : ''}`}>
                {pop == null || pop < 10 ? '—' : `${pop}%`}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
