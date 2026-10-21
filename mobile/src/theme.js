import { Platform } from 'react-native';

export const isTV = Platform.isTV === true;

export const colors = {
  bg: '#0d1522',
  panel: '#16213a',
  panelAlt: '#1c2b47',
  line: 'rgba(255,255,255,0.10)',
  text: '#eaf0f9',
  muted: '#93a3bd',
  accent: '#55b6ff',
  warm: '#ffb45c',
  cool: '#6fd3e8',
  bad: '#ff7b7b',
  onAccent: '#08192b',
};

const SCALE = isTV ? 1.6 : 1;

export function s(size) {
  return Math.round(size * SCALE);
}

export const font = {
  xs: s(11),
  sm: s(13),
  md: s(15),
  lg: s(18),
  xl: s(26),
  hero: s(58),
};

export const space = {
  xs: s(4),
  sm: s(8),
  md: s(14),
  lg: s(20),
  xl: s(28),
};

export const radius = {
  sm: s(8),
  md: s(12),
  lg: s(16),
  pill: s(999),
};
