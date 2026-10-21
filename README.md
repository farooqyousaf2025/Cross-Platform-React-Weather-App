# Cross Platform React Weather App

A weather app built with React and Vite, powered by [Open-Meteo](https://open-meteo.com/).
No API key, account, or billing setup required.

## Features

- **City search** — type-ahead lookup for any place worldwide, with a results dropdown
- **Current conditions** — temperature, feels-like, daily high/low, humidity, wind speed and direction, pressure, cloud cover, UV index, precipitation, sunrise and sunset
- **Hourly forecast** — horizontally scrollable strip of the next 24 hours with temperature and precipitation probability
- **7-day forecast** — one row per day, with a range bar scaled to the week's overall high/low spread
- **Saved cities** — star a city to pin it in the sidebar with its live temperature; click a pin to switch, `×` to remove
- **Unit switch** — °C / °F, applied to temperatures and wind speed (km/h ↔ mph)
- **Clock switch** — 12-hour or 24-hour labels on the hourly strip
- **My location** — loads conditions for the browser's geolocation coordinates
- **Resilient states** — loading skeletons, error panel with retry, dimmed "stale" view while refetching, and `prefers-reduced-motion` support

## Tech stack

| | |
| --- | --- |
| UI | React 18 |
| Build / dev server | Vite 5 |
| Language | JavaScript (JSX, ES modules) |
| Styling | Single hand-written stylesheet, CSS custom properties |
| Icons | Inline SVG components (no icon library) |
| State | React hooks only — no Redux, Zustand, or data-fetching library |
| Persistence | `localStorage` |

Requires Node 18 or newer.

## Platforms

This repository holds two apps: a web app in `src/` and an Android phone + Android TV app in
`mobile/`.

### Web app

| Platform | Status |
| --- | --- |
| Chrome, Edge, Firefox, Safari (current versions) | Supported |
| iOS Safari and Android Chrome | Supported via the responsive single-column layout under 900px |
| Windows, macOS, Linux | Supported — Vite is cross-platform |
| Node.js 18+ | Required for development and building |
| Netlify, Vercel, GitHub Pages, Cloudflare Pages | Deployable — `npm run build` emits a plain static `dist/` |

Browser APIs used are limited to `fetch` with `AbortController`, `localStorage`, and
`navigator.geolocation`. Everything else is plain CSS and SVG.

Two practical constraints:

- Geolocation is only available over HTTPS or on `localhost`, and the user must grant permission.
- There is no service worker or web manifest, so the web app is not an installable PWA and has
  no offline mode — every weather view needs network access.

### Android phone and Android TV app

Built with Expo and the `react-native-tvos` fork, so a single codebase targets both phone and
TV. See `mobile/README.md` for setup and build commands. On a device it installs as
**Cross Platform Weather** (package `com.qoder.weather`).

| Target | Status |
| --- | --- |
| Android phones and tablets | Supported (mobile prebuild) |
| Android TV and Google TV | Supported (TV prebuild with `EXPO_TV=1`) |
| iOS / Apple TV | Not configured in this project |
| Offline | Last forecast per city is cached on-device and shown when the network call fails |

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173
```

Other scripts:

```bash
npm run build        # production bundle into dist/
npm run preview      # serve the built bundle locally
```

## Project structure

```
shared/                           Weather logic used by BOTH apps (no framework code)
  weatherApi.js                   Open-Meteo geocoding, forecast and snapshot requests
  weatherCodes.js                 WMO weather code -> label + icon name
  format.js                       Unit conversion, compass points, date/time formatting

src/                              Web app (React + Vite)
  main.jsx                        React entry point
  App.jsx                         Place/unit/saved state, data loading, page layout
  styles.css                      Design tokens, layout, responsive rules
  components/
    SearchBar.jsx                 Debounced geocoding input + result list
    CurrentWeather.jsx            Hero temperature and detail grid
    HourlyForecast.jsx            24-hour scroll strip
    DailyForecast.jsx             7-day rows with range bars
    SavedCities.jsx               Sidebar pins with live temperatures
    WeatherIcon.jsx               SVG icon set keyed by weather condition
  lib/
    hooks.js                      usePersistentState (localStorage-backed useState)

mobile/                           Android phone + Android TV app (Expo) — see mobile/README.md
```

The `shared/` folder is imported directly by both apps: Vite resolves it as ordinary source,
and Metro watches it via `mobile/metro.config.js`.

## Data sources

| Endpoint | Used for |
| --- | --- |
| `geocoding-api.open-meteo.com/v1/search` | City search by name |
| `api.open-meteo.com/v1/forecast` | Current, hourly and daily conditions |

The forecast call requests `timezone=auto`, so hourly and daily timestamps arrive in the
searched location's own timezone. The 7-day list is capped by `forecast_days=7`.

Weather conditions arrive as WMO numeric codes and are mapped to a label and icon in
`shared/weatherCodes.js`.

## Saved preferences

Stored in `localStorage` under a `react-weather-app:` prefix:

| Key | Contents |
| --- | --- |
| `react-weather-app:place` | The selected place (name, region, country, coordinates) |
| `react-weather-app:unit` | `"c"` or `"f"` |
| `react-weather-app:hour24` | Boolean clock format |
| `react-weather-app:saved` | Array of saved cities, each with a last-seen temperature snapshot |

The prefix keeps these keys from colliding with other apps served from the same
`localhost` origin.

## Keyboard use

While the search results are open:

| Key | Action |
| --- | --- |
| `↑` / `↓` | Move through results |
| `Enter` | Open the highlighted city |
| `Esc` | Close the dropdown |

Search waits for two characters and debounces 350 ms, cancelling any in-flight request.

## Notes and limitations

- Open-Meteo's geocoder matches place names only, so "My location" labels the pin by its
  coordinates instead of reverse-geocoding to a street address.
- Saved-city tiles show the temperature captured when the city was saved or last refreshed;
  they are not a live poll of every pin.
- The app has no backend, so nothing is shared between browsers or devices.
