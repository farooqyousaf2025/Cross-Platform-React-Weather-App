import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import Focusable from './Focusable.jsx';
import { searchPlaces } from '../../../shared/weatherApi.js';
import { colors, font, isTV, radius, space } from '../theme.js';

export default function SearchField({ onSelect }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const query = term.trim();
    if (query.length < 2) {
      setResults([]);
      setError('');
      return undefined;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const found = await searchPlaces(query, controller.signal);
        setResults(found);
        setError(found.length === 0 ? 'No matching place found.' : '');
      } catch (err) {
        if (err.name !== 'AbortError') setError('Search failed. Check your connection.');
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  function choose(place) {
    setTerm('');
    setResults([]);
    inputRef.current?.blur();
    onSelect(place);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.field}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={term}
          onChangeText={setTerm}
          placeholder="Search for a city"
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          accessibilityLabel="Search for a city"
        />
        {loading && <ActivityIndicator color={colors.accent} style={styles.spinner} />}
      </View>

      {error !== '' && <Text style={styles.error}>{error}</Text>}

      {results.length > 0 && (
        <View style={styles.results}>
          {results.map((place, i) => (
            <Focusable
              key={place.id}
              onPress={() => choose(place)}
              hasTVPreferredFocus={isTV && i === 0}
              style={({ focused }) => [
                styles.result,
                focused && isTV && { backgroundColor: colors.panelAlt },
              ]}
            >
              <Text style={styles.resultName} numberOfLines={1}>
                {place.name}
              </Text>
              <Text style={styles.resultMeta} numberOfLines={1}>
                {[place.admin, place.country].filter(Boolean).join(', ')}
              </Text>
            </Focusable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    paddingStart: space.md,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: font.md,
    paddingVertical: isTV ? space.md : space.sm,
  },
  spinner: { marginEnd: space.md },
  error: { color: colors.bad, fontSize: font.sm, marginTop: space.xs },
  results: {
    marginTop: space.sm,
    backgroundColor: colors.panelAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  result: {
    padding: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  resultName: { color: colors.text, fontSize: font.md, fontWeight: '600' },
  resultMeta: { color: colors.muted, fontSize: font.sm, marginTop: 2 },
});
