# Cross Platform Weather for Android phone and Android TV

The mobile companion to the web app in this repository. Built with **Expo** and the
**[react-native-tvos](https://github.com/react-native-tvos/react-native-tvos)** fork of React
Native, which lets one codebase target both Android phones and Android TV.

Weather logic is not duplicated: the app imports `fetch`, formatting and condition-code helpers
straight from [`../shared`](../shared).

## Features

- City search with debounced type-ahead
- Current conditions: temperature, feels-like, high/low, humidity, wind, pressure, cloud cover,
  UV index, precipitation, sunrise and sunset
- Scrollable next-24-hours strip
- 7-day forecast with temperature range bars
- Saved cities with live temperatures
- °C / °F and 12h / 24h switches
- **Offline cache** — the last forecast for each city is stored on-device and shown immediately
  on the next launch, and kept on screen if a refresh fails
- **TV remote navigation** — focus states are drawn as a highlighted border plus a slight
  scale-up, so the selected control is obvious from a distance
- **TV layout** — text, spacing and touch targets scale up automatically on TV

## Requirements

| Tool | Version used here |
| --- | --- |
| Node.js | 18 or newer |
| JDK | 17 or 21 (Temurin 21 used here) |
| Android SDK | platform-tools, build-tools and a matching platform |

`ANDROID_HOME` must point at the SDK and `JAVA_HOME` at the JDK. Android Studio satisfies both
if you build from inside it.

## Install

```bash
npm install
```

`.npmrc` sets `legacy-peer-deps=true`. This is required: `react-native-tvos` publishes as a
prerelease (for example `0.88.0-0`), and npm's semver ranges reject that suffix even though the
package satisfies them, so a strict peer-resolution install fails.

## Run on a device or emulator

```bash
npm start            # Metro, then press "a" for a connected Android device
npm run android      # build, install and launch in one step
```

## Building the two APK variants

The target is chosen at **prebuild** time, not by a Gradle flag. `EXPO_TV=1` makes the
`@react-native-tvos/config-tv` plugin rewrite the manifest for TV.

**Phone / tablet:**

```bash
npx expo prebuild --platform android --clean
cd android && gradlew.bat assembleRelease
```

**Android TV:**

```bash
npx cross-env EXPO_TV=1 npx expo prebuild --platform android --clean
cd android && gradlew.bat assembleRelease
```

Output lands in `android/app/build/outputs/apk/release/`.

`run-gradle.ps1` wraps the Gradle step: it points `JAVA_HOME` at the JDK 21 install, sets
`ANDROID_HOME`, and writes the build log to `android-build.log`.

Because both variants share the `android/` directory, switching targets means re-running
prebuild. To keep two parallel builds, generate the TV variant into a separate checkout.

## Project layout

```
index.js                          Expo entry, registers src/App.jsx
app.json                          Expo config, android package, config-tv plugin
metro.config.js                   Adds ../shared to Metro's watchFolders
assets/tv-banner.png              640x360 Android TV launcher banner
src/
  App.jsx                         State, data loading, offline cache, screen layout
  theme.js                        Colours plus the phone/TV size scale
  storage.js                      AsyncStorage: preferences and per-city forecast cache
  components/
    SearchField.jsx               Debounced city search
    CurrentPanel.jsx              Hero reading and detail grid
    HourlyStrip.jsx               24-hour horizontal scroll
    DailyList.jsx                 7-day rows with range bars
    SavedRow.jsx                  Saved-city chips with remove buttons
    WeatherIcon.jsx               Condition icons drawn with plain views
    Focusable.jsx                 Pressable with TV focus styling
```

## Notes and limitations

- **No `react-native-svg`.** The condition icons are drawn with plain views instead. The library's
  C++ codegen writes object files into a path over 260 characters, which fails the Windows release
  build even with `LongPathsEnabled` set.
- **No "My location".** The web app uses the browser's geolocation API, which has no equivalent
  here; adding it means installing and configuring `expo-location`. Search is the only way to
  change city.
- **Android TV banner.** Android TV launchers need a banner drawable, otherwise they truncate the
  app name in the home row. `assets/tv-banner.png` (640x360) is supplied to the `config-tv` plugin
  via its `androidTVBanner` option, which copies it into every `drawable*` density folder and sets
  `android:banner` in the generated manifest. Regenerating it after a `--clean` prebuild is handled
  by the plugin, so nothing needs to be edited by hand.
- **Not Expo Go.** Expo Go cannot load a project that swaps React Native for the TV fork; use a
  dev client or a full build.
- The release APK is signed with the debug keystore that the template generates. Configure a
  real keystore before publishing.
- `userInterfaceStyle` in `app.json` has no effect until `expo-system-ui` is installed.
