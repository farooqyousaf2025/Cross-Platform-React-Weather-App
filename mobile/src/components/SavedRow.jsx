import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Focusable from './Focusable.jsx';
import WeatherIcon from './WeatherIcon.jsx';
import { describeCode } from '../../../shared/weatherCodes.js';
import { formatTemp } from '../../../shared/format.js';
import { colors, font, isTV, radius, space } from '../theme.js';

export default function SavedRow({ cities, activeId, unit, onSelect, onRemove }) {
  if (cities.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Saved cities</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {cities.map((city) => (
          <Focusable
            key={city.id}
            onPress={() => onSelect(city)}
            style={({ focused }) => [
              styles.chip,
              city.id === activeId && styles.chipActive,
              focused && isTV && { borderColor: colors.accent },
            ]}
          >
            <View style={styles.chipBody}>
              <Text style={styles.name} numberOfLines={1}>
                {city.name}
              </Text>
              <View style={styles.reading}>
                <WeatherIcon
                  icon={describeCode(city.snapshot?.weather_code ?? 3).icon}
                  color={colors.warm}
                  size={isTV ? 26 : 18}
                />
                <Text style={styles.temp}>
                  {city.snapshot ? formatTemp(city.snapshot.temperature_2m, unit) : '--'}
                </Text>
              </View>
            </View>
            <Focusable
              onPress={() => onRemove(city.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={`Remove ${city.name}`}
              style={({ focused }) => [styles.remove, focused && isTV && styles.removeFocused]}
            >
              <Text style={styles.removeText}>×</Text>
            </Focusable>
          </Focusable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: space.md },
  title: {
    color: colors.muted,
    fontSize: font.xs,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },
  row: { gap: space.sm, paddingBottom: space.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingStart: space.md,
  },
  chipActive: { borderColor: colors.accent },
  chipBody: { marginEnd: space.sm },
  name: { color: colors.text, fontSize: font.md, fontWeight: '600', maxWidth: isTV ? 190 : 130 },
  reading: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  temp: { color: colors.text, fontSize: font.md, fontWeight: '600' },
  remove: { paddingHorizontal: space.md, paddingVertical: space.md, borderStartWidth: 1, borderStartColor: colors.line },
  removeFocused: { backgroundColor: colors.panelAlt },
  removeText: { color: colors.muted, fontSize: font.lg, lineHeight: font.lg + 4 },
});
