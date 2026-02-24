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
import { spendProgress, timeProgress } from '../CreditCircleScreen';






/** Dual progress bar: tiempo vs gasto */
export function PacingBar() {
  const theme = useTheme();
  const overSpend = spendProgress > timeProgress;

  return (
    <View style={pacing.wrapper}>
      {/* Tiempo transcurrido */}
      <View style={pacing.row}>
        <Text style={pacing.label}>Tiempo</Text>
        <View style={pacing.track}>
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={[pacing.fill, { width: `${timeProgress * 100}%`, backgroundColor: '#A0AEC0' }]}
          />
          <View style={[pacing.marker, { left: `${timeProgress * 100}%` }]}>
            <Text style={pacing.markerText}>{Math.round(timeProgress * 100)}%</Text>
          </View>
        </View>
      </View>

      {/* Gasto */}
      <View style={pacing.row}>
        <Text style={pacing.label}>Gasto</Text>
        <View style={pacing.track}>
          <Animated.View
            entering={FadeInDown.delay(350)}
            style={[
              pacing.fill,
              {
                width: `${spendProgress * 100}%`,
                backgroundColor: overSpend ? '#FC8181' : '#68D391',
              },
            ]}
          />
          <View style={[pacing.marker, { left: `${spendProgress * 100}%` }]}>
            <Text style={pacing.markerText}>{Math.round(spendProgress * 100)}%</Text>
          </View>
        </View>
      </View>

      <Text style={[pacing.hint, { color: overSpend ? '#FC8181' : '#68D391' }]}>
        {overSpend
          ? '⚠️ Tu gasto supera el tiempo transcurrido'
          : '✅ Vas a buen ritmo este ciclo'}
      </Text>
    </View>
  );
}

const pacing = StyleSheet.create({
  wrapper: { gap: 10, paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 11, width: 46, letterSpacing: 0.5 },
  track: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 99,
    overflow: 'visible',
    position: 'relative',
  },
  fill: { height: 10, borderRadius: 99, minWidth: 8 },
  marker: {
    position: 'absolute',
    top: -20,
    transform: [{ translateX: -10 }],
  },
  markerText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  hint: { fontSize: 12, marginTop: 4 },
});