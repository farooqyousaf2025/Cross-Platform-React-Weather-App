import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import WeatherIcon from './WeatherIcon.jsx';
import { describeCode } from '../../../shared/weatherCodes.js';
import { formatHour, formatTemp } from '../../../shared/format.js';
import { colors, font, isTV, radius, space } from '../theme.js';

function firstHourIndex(times, currentIso) {
  const now = currentIso.slice(0, 13);
  const i = times.findIndex((t) => t.slice(0, 13) >= now);
  return i === -1 ? 0 : i;
}

export default function HourlyStrip({ data, unit, hour24 }) {
  const { hourly, current } = data;
  const from = firstHourIndex(hourly.time, current.time);
  const window = hourly.time.slice(from, from + 24);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Next 24 hours</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.track}
      >
        {window.map((iso, i) => {
          const idx = from + i;
          const pop = hourly.precipitation_probability[idx];
          return (
            <View key={iso} style={[styles.hour, i === 0 && styles.hourNow]}>
              <Text style={styles.time}>{i === 0 ? 'Now' : formatHour(iso, hour24)}</Text>
              <WeatherIcon
                icon={describeCode(hourly.weather_code[idx]).icon}
                color={colors.cool}
              />
              <Text style={styles.temp}>{formatTemp(hourly.temperature_2m[idx], unit)}</Text>
              <Text style={[styles.pop, pop >= 30 && { color: colors.accent }]}>
                {pop == null || pop < 10 ? '--' : `${pop}%`}
              </Text>
            </View>
          );
        })}
      </ScrollView>
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
  track: { gap: space.sm },
  hour: {
    width: isTV ? 110 : 68,
    alignItems: 'center',
    gap: 5,
    paddingVertical: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.panelAlt,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  hourNow: { borderColor: colors.accent },
  time: { color: colors.muted, fontSize: font.xs },
  temp: { color: colors.text, fontSize: font.md, fontWeight: '600' },
  pop: { color: colors.muted, fontSize: font.xs },
});
