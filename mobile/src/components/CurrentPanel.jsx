import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Focusable from './Focusable.jsx';
import WeatherIcon from './WeatherIcon.jsx';
import { describeCode } from '../../../shared/weatherCodes.js';
import { compass, formatClock, formatTemp, formatWind } from '../../../shared/format.js';
import { colors, font, isTV, radius, space } from '../theme.js';

export default function CurrentPanel({ place, data, unit, hour24, isSaved, onToggleSave }) {
  const { current, daily } = data;
  const condition = describeCode(current.weather_code);

  const details = [
    ['Humidity', `${current.relative_humidity_2m}%`],
    ['Wind', `${formatWind(current.wind_speed_10m, unit)} ${compass(current.wind_direction_10m)}`],
    ['Pressure', `${Math.round(current.pressure_msl)} hPa`],
    ['Cloud cover', `${current.cloud_cover}%`],
    ['UV index', formatUv(current.uv_index)],
    ['Precipitation', `${current.precipitation} mm`],
    ['Sunrise', formatClock(daily.sunrise[0], hour24)],
    ['Sunset', formatClock(daily.sunset[0], hour24)],
  ];

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.place}>{place.name}</Text>
          <Text style={styles.sub} numberOfLines={1}>
            {[place.admin, place.country].filter(Boolean).join(', ')}
          </Text>
        </View>
        <Focusable
          onPress={onToggleSave}
          accessibilityRole="button"
          accessibilityState={{ selected: isSaved }}
          style={({ focused }) => [
            styles.save,
            isSaved && { borderColor: colors.warm },
            focused && isTV && { backgroundColor: colors.panelAlt },
          ]}
        >
          <Text style={[styles.saveText, isSaved && { color: colors.warm }]}>
            {isSaved ? 'Saved' : 'Save city'}
          </Text>
        </Focusable>
      </View>

      <View style={styles.hero}>
        <WeatherIcon icon={condition.icon} color={colors.warm} />
        <View style={styles.heroText}>
          <Text style={styles.bigTemp}>{formatTemp(current.temperature_2m, unit)}</Text>
          <Text style={styles.condition}>{condition.label}</Text>
          <Text style={styles.feels}>
            {`Feels like ${formatTemp(current.apparent_temperature, unit)}  ·  H ${formatTemp(daily.temperature_2m_max[0], unit)}  ·  L ${formatTemp(daily.temperature_2m_min[0], unit)}`}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {details.map(([label, value]) => (
          <View key={label} style={styles.cell}>
            <Text style={styles.cellLabel}>{label}</Text>
            <Text style={styles.cellValue}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function formatUv(uv) {
  if (uv == null) return '--';
  const value = Number(uv.toFixed(1));
  const band = value <= 2 ? 'Low' : value <= 5 ? 'Moderate' : value <= 7 ? 'High' : 'Very high';
  return `${value} · ${band}`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
  },
  head: { flexDirection: 'row', alignItems: 'flex-start' },
  headText: { flex: 1, marginEnd: space.sm },
  place: { color: colors.text, fontSize: font.xl, fontWeight: '700' },
  sub: { color: colors.muted, fontSize: font.sm, marginTop: 2 },
  save: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
  },
  saveText: { color: colors.muted, fontSize: font.sm },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.lg,
    marginBottom: space.lg,
  },
  heroText: { marginStart: space.md },
  bigTemp: { color: colors.text, fontSize: font.hero, fontWeight: '200', lineHeight: font.hero + 10 },
  condition: { color: colors.text, fontSize: font.lg, fontWeight: '600' },
  feels: { color: colors.muted, fontSize: font.sm, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 1 },
  cell: {
    width: isTV ? '25%' : '50%',
    backgroundColor: colors.panelAlt,
    padding: space.md,
  },
  cellLabel: { color: colors.muted, fontSize: font.xs, letterSpacing: 0.6 },
  cellValue: { color: colors.text, fontSize: font.md, fontWeight: '600', marginTop: 2 },
});
