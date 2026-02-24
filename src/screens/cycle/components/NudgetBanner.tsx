import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { format, addDays, subDays, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { LineChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';




/** Nudge inteligente */
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