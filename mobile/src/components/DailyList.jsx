import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import WeatherIcon from './WeatherIcon.jsx';
import { describeCode } from '../../../shared/weatherCodes.js';
import { formatDay, formatTemp, tempValue } from '../../../shared/format.js';
import { colors, font, isTV, radius, space } from '../theme.js';

export default function DailyList({ data, unit }) {
  const { daily } = data;
  const lows = daily.temperature_2m_min.map((v) => tempValue(v, unit));
  const highs = daily.temperature_2m_max.map((v) => tempValue(v, unit));
  const floor = Math.min(...lows);
  const ceil = Math.max(...highs);
  const span = ceil - floor || 1;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>7-day forecast</Text>
      {daily.time.map((iso, i) => {
        const left = ((lows[i] - floor) / span) * 100;
        const width = Math.max(((highs[i] - lows[i]) / span) * 100, 4);
        return (
          <View key={iso} style={styles.row}>
            <Text style={styles.day}>{formatDay(iso)}</Text>
            <WeatherIcon icon={describeCode(daily.weather_code[i]).icon} color={colors.cool} />
            <Text style={styles.label} numberOfLines={1}>
              {describeCode(daily.weather_code[i]).label}
            </Text>
            <Text style={styles.pop}>{daily.precipitation_probability_max[i] ?? 0}%</Text>
            <Text style={styles.low}>{formatTemp(daily.temperature_2m_min[i], unit)}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { left: `${left}%`, width: `${width}%` },
                ]}
              />
            </View>
            <Text style={styles.high}>{formatTemp(daily.temperature_2m_max[i], unit)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
  },
  title: {
    color: colors.muted,
    fontSize: font.xs,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: space.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  day: { color: colors.text, fontSize: font.md, fontWeight: '600', width: isTV ? 90 : 56 },
  label: { color: colors.muted, fontSize: font.sm, flex: 1 },
  pop: { color: colors.accent, fontSize: font.xs, width: isTV ? 60 : 38, textAlign: 'right' },
  low: { color: colors.muted, fontSize: font.md, width: isTV ? 64 : 40, textAlign: 'right' },
  high: { color: colors.text, fontSize: font.md, fontWeight: '600', width: isTV ? 64 : 40, textAlign: 'right' },
  barTrack: {
    flex: isTV ? 2 : 1,
    height: isTV ? 8 : 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  barFill: {
    position: 'absolute',
    top: 0,
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.warm,
  },
});
