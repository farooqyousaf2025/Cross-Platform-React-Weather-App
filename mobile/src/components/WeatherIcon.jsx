import React from 'react';
import { View } from 'react-native';
import { isTV, s } from '../theme.js';

const STROKE = 1.8;

// Icons are drawn from circles, rounded bars and triangles on a 24x24 grid.
// A path renderer would need react-native-svg, whose C++ codegen breaks Windows builds.
const CLOUD = [
  { t: 'disc', cx: 9.2, cy: 11.6, r: 3.4 },
  { t: 'disc', cx: 14.4, cy: 10.6, r: 4.2 },
  { t: 'rect', x: 5.6, y: 12.6, w: 13, h: 5, r: 2.5 },
];

function bar(x1, y1, x2, y2) {
  return { t: 'bar', x1, y1, x2, y2 };
}

function rays(count, inner, outer, cx = 12, cy = 12, offsetDeg = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = ((360 / count) * i + offsetDeg - 90) * (Math.PI / 180);
    return bar(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner,
      cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
  });
}

const SHAPES = {
  sun: [
    { t: 'ring', cx: 12, cy: 12, r: 4.6 },
    ...rays(8, 7.2, 9.6),
  ],
  'cloud-sun': [
    { t: 'ring', cx: 8.6, cy: 8.2, r: 3 },
    bar(8.6, 2.6, 8.6, 4),
    bar(3.2, 8.2, 4.6, 8.2),
    bar(4.8, 4.2, 5.9, 5.3),
    { t: 'disc', cx: 13, cy: 14.4, r: 3.2 },
    { t: 'disc', cx: 17.4, cy: 13.6, r: 3.8 },
    { t: 'rect', x: 9.6, y: 15.2, w: 11.4, h: 4.6, r: 2.3 },
  ],
  cloud: CLOUD,
  fog: [
    { t: 'disc', cx: 9.2, cy: 9.6, r: 3.2 },
    { t: 'disc', cx: 14.2, cy: 8.8, r: 3.9 },
    { t: 'rect', x: 5.8, y: 10.4, w: 12.6, h: 4.6, r: 2.3 },
    bar(4.6, 17.6, 19.4, 17.6),
    bar(7.4, 21, 16.6, 21),
  ],
  drizzle: [
    ...CLOUD,
    bar(10, 18.6, 9.5, 20.2),
    bar(14.4, 18.6, 13.9, 20.2),
  ],
  rain: [
    ...CLOUD,
    bar(9.6, 18.6, 8.8, 21.6),
    bar(13.6, 18.6, 12.8, 21.6),
    bar(17.2, 18.6, 16.5, 20.8),
  ],
  sleet: [
    ...CLOUD,
    bar(9.6, 18.6, 8.8, 21.6),
    bar(14.6, 18.4, 14.6, 21.4),
    bar(13.1, 19.9, 16.1, 19.9),
  ],
  snow: [
    ...CLOUD,
    { t: 'disc', cx: 9.4, cy: 20, r: 1 },
    { t: 'disc', cx: 13.4, cy: 21.4, r: 1 },
    { t: 'disc', cx: 17.2, cy: 20, r: 1 },
  ],
  storm: [
    { t: 'disc', cx: 9.2, cy: 9.2, r: 3.2 },
    { t: 'disc', cx: 14.2, cy: 8.4, r: 3.9 },
    { t: 'rect', x: 5.8, y: 10, w: 12.6, h: 4.6, r: 2.3 },
    { t: 'tri', x: 12.9, y: 14.4, w: 3.6, h: 4.4, dir: 'left' },
    { t: 'tri', x: 9.6, y: 17.6, w: 3.6, h: 4.4, dir: 'right' },
  ],
};

function pieceStyle(p, k, color) {
  const w = STROKE * k;
  switch (p.t) {
    case 'disc':
      return {
        position: 'absolute',
        left: (p.cx - p.r) * k,
        top: (p.cy - p.r) * k,
        width: 2 * p.r * k,
        height: 2 * p.r * k,
        borderRadius: p.r * k,
        backgroundColor: color,
      };
    case 'ring':
      return {
        position: 'absolute',
        left: (p.cx - p.r) * k - w / 2,
        top: (p.cy - p.r) * k - w / 2,
        width: 2 * p.r * k + w,
        height: 2 * p.r * k + w,
        borderRadius: p.r * k + w,
        borderWidth: w,
        borderStyle: 'solid',
        borderColor: color,
      };
    case 'rect':
      return {
        position: 'absolute',
        left: p.x * k,
        top: p.y * k,
        width: p.w * k,
        height: p.h * k,
        borderRadius: p.r * k,
        backgroundColor: color,
      };
    case 'bar': {
      const dx = p.x2 - p.x1;
      const dy = p.y2 - p.y1;
      const len = Math.sqrt(dx * dx + dy * dy) * k;
      return {
        position: 'absolute',
        left: ((p.x1 + p.x2) / 2) * k - len / 2,
        top: ((p.y1 + p.y2) / 2) * k - w / 2,
        width: len,
        height: w,
        borderRadius: w / 2,
        backgroundColor: color,
        transform: [{ rotate: `${(Math.atan2(dy, dx) * 180) / Math.PI}deg` }],
      };
    }
    case 'tri': {
      const tw = p.w * k;
      const th = p.h * k;
      const base = { position: 'absolute', width: 0, height: 0, borderStyle: 'solid' };
      return p.dir === 'left'
        ? { ...base, left: (p.x + p.w) * k, top: p.y * k, borderTopWidth: th, borderRightWidth: tw, borderTopColor: color, borderRightColor: 'transparent' }
        : { ...base, left: p.x * k, top: (p.y + p.h) * k, borderBottomWidth: th, borderLeftWidth: tw, borderBottomColor: color, borderLeftColor: 'transparent' };
    }
    default:
      return { position: 'absolute' };
  }
}

export default function WeatherIcon({ icon, size, color }) {
  const px = size ?? s(isTV ? 30 : 22);
  const k = px / 24;
  const shapes = SHAPES[icon] ?? SHAPES.cloud;

  return (
    <View style={{ width: px, height: px }} accessibilityElementsHidden>
      {shapes.map((p, i) => (
        <View key={i} style={pieceStyle(p, k, color)} />
      ))}
    </View>
  );
}
