import React from 'react';
import { Pressable } from 'react-native';
import { colors, isTV } from '../theme.js';

/**
 * On TV there is no cursor, so the focused control must announce itself:
 * a brighter border plus a slight scale-up reads clearly from a couch distance.
 */
export default function Focusable({ style, children, ...rest }) {
  return (
    <Pressable
      {...rest}
      style={({ focused, pressed }) => {
        const base = typeof style === 'function' ? style({ focused, pressed }) : style;
        if (!isTV) {
          return [base, pressed ? { opacity: 0.7 } : null];
        }
        return [
          base,
          focused && {
            borderColor: colors.accent,
            transform: [{ scale: pressed ? 1.02 : 1.06 }],
            zIndex: 2,
          },
          !focused && pressed && { opacity: 0.75 },
        ];
      }}
    >
      {children}
    </Pressable>
  );
}
