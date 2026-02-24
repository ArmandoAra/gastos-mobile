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
import { categories } from '../CreditCircleScreen';




/** Categorías con barras de progreso */
export function CategoryRow({ item, delay }: { item: (typeof categories)[0]; delay: number }) {
  const ratio = item.spent / item.limit;
  const over = ratio > 1;

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={cat_s.row}>
      <View style={[cat_s.iconBox, { backgroundColor: item.color + '22' }]}>
        <MaterialCommunityIcons name={item.icon as any} size={18} color={item.color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={cat_s.labelRow}>
          <Text style={cat_s.name}>{item.label}</Text>
          <Text style={[cat_s.amount, { color: over ? '#FC8181' : 'rgba(255,255,255,0.7)' }]}>
            ${item.spent} / ${item.limit}
          </Text>
        </View>
        <View style={cat_s.track}>
          <View
            style={[
              cat_s.fill,
              {
                width: `${Math.min(ratio * 100, 100)}%`,
                backgroundColor: over ? '#FC8181' : item.color,
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const cat_s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  name: { color: '#fff', fontSize: 13, fontWeight: '600' },
  amount: { fontSize: 12 },
  track: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 99,
  },
  fill: { height: 6, borderRadius: 99 },
});