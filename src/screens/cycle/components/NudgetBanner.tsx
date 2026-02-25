import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';

import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

/** Nudge inteligente */
// Aun no utilizado, pero la idea es mostrar un banner de advertencia cuando el usuario se acerca a su límite semanal en una categoría. El banner se puede descartar y no volverá a aparecer durante ese ciclo.
export function NudgeBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const nudge = {
    icon: '☕',
    title: 'Cuidado con el café',
    body: 'En 2 días superaste el límite semanal de esta categoría.',
    color: '#F6AD55',
    bg: 'rgba(246,173,85,0.12)',
    border: 'rgba(246,173,85,0.3)',
  };

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={[nudge_s.card, { backgroundColor: nudge.bg, borderColor: nudge.border }]}
      >
        <Text style={nudge_s.icon}>{nudge.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[nudge_s.title, { color: nudge.color }]}>{nudge.title}</Text>
          <Text style={nudge_s.body}>{nudge.body}</Text>
        </View>
        <TouchableOpacity onPress={() => setDismissed(true)} style={nudge_s.close}>
          <Ionicons name="close" size={16} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const nudge_s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  icon: { fontSize: 24 },
  title: { fontWeight: '700', fontSize: 13, letterSpacing: 0.2 },
  body: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 },
  close: { padding: 4 },
});