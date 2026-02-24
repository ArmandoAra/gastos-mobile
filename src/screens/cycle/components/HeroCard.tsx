import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';

// Asegúrate de importar esto correctamente desde tus archivos
import { PacingBar } from './PacingBar';
import { 
  cycleStart, 
  cycleEnd, 
  isOverpacing, 
  SAFE_TO_SPEND, 
  SPENT, 
  FIXED_UPCOMING, 
  BUDGET 
} from '../CreditCircleScreen';
import { 
  useCycleStore, 
  selectTotalSaved, 
  selectCycleHistory 
} from '../../../stores/useCycleStore'; 

export function HeroCard() {
  // Obtenemos los datos globales (antes en TotalsBar)
  const totalSaved = useCycleStore(selectTotalSaved);
  const bufferBalance = useCycleStore((s) => s.bufferBalance);
  const rollover = useCycleStore((s) => s.buckets.rollover.totalAccumulated);
  const history = useCycleStore(useShallow(selectCycleHistory));

  const avgSurplus =
    history.length > 0
      ? history.reduce((a, c) => a + (c.surplusAmount ?? 0), 0) / history.length
      : 0;

  return (
    <Animated.View entering={FadeInDown.delay(50).springify()}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={hero.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Orbes decorativos */}
        <View style={hero.orb} />
        <View style={hero.orb2} />

        {/* ─── 1. CABECERA: CICLO Y RITMO ─── */}
        <View style={hero.header}>
          <View>
            <Text style={hero.cycleLabel}>CICLO ACTIVO</Text>
            <Text style={hero.cycleRange}>
              {format(cycleStart, 'dd MMM', { locale: es })} →{' '}
              {format(cycleEnd, 'dd MMM', { locale: es })}
            </Text>
          </View>
          <View style={hero.badgeWrapper}>
            <View style={[hero.badge, { backgroundColor: isOverpacing ? '#FC8181' : '#68D391' }]}>
              <Ionicons
                name={isOverpacing ? 'trending-up' : 'checkmark-circle'}
                size={12}
                color="#fff"
              />
              <Text style={hero.badgeText}>{isOverpacing ? 'ACELERADO' : 'ÓPTIMO'}</Text>
            </View>
          </View>
        </View>

        {/* ─── 2. CUERPO: DISPONIBLE Y BARRA ─── */}
        <Text style={hero.subtitle}>DISPONIBLE PARA GASTAR HOY</Text>
        <Text style={hero.amount}>${SAFE_TO_SPEND.toLocaleString()}</Text>

        <PacingBar />

        {/* ─── 3. MÉTRICAS DEL CICLO ─── */}
        <View style={hero.cycleStats}>
          <View style={hero.stat}>
            <Text style={hero.statLabel}>Gastado</Text>
            <Text style={hero.statValue}>${SPENT.toLocaleString()}</Text>
          </View>
          <View style={hero.divider} />
          <View style={hero.stat}>
            <Text style={hero.statLabel}>Fijos futuros</Text>
            <Text style={hero.statValue}>${FIXED_UPCOMING.toLocaleString()}</Text>
          </View>
          <View style={hero.divider} />
          <View style={hero.stat}>
            <Text style={hero.statLabel}>Presupuesto</Text>
            <Text style={hero.statValue}>${BUDGET.toLocaleString()}</Text>
          </View>
        </View>

        {/* ─── 4. SECCIÓN DE AHORROS (Antes TotalsBar) ─── */}
        <View style={hero.savingsSection}>
          <View style={hero.savingsHeader}>
            <View>
              <Text style={hero.savingsLabel}>TOTAL GUARDADO</Text>
              <Text style={hero.savingsAmount}>${totalSaved.toLocaleString()}</Text>
            </View>
            <View style={hero.sparkle}>
              <Text style={{ fontSize: 24 }}>💰</Text>
            </View>
          </View>

          <View style={hero.savingsStats}>
            <View style={hero.stat}>
              <Text style={hero.statValue}>${rollover.toLocaleString()}</Text>
              <Text style={hero.statLabel}>Rollover</Text>
            </View>
            <View style={hero.dividerSavings} />
            <View style={hero.stat}>
              <Text style={hero.statValue}>${bufferBalance.toLocaleString()}</Text>
              <Text style={hero.statLabel}>Buffer</Text>
            </View>
            <View style={hero.dividerSavings} />
            <View style={hero.stat}>
              <Text style={hero.statValue}>${Math.round(avgSurplus).toLocaleString()}</Text>
              <Text style={hero.statLabel}>Prom./ciclo</Text>
            </View>
          </View>
        </View>

      </LinearGradient>
    </Animated.View>
  );
}

const hero = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 24,
    gap: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(99,179,237,0.15)',
  },
  orb: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(99,102,241,0.25)',
  },
  orb2: {
    position: 'absolute',
    bottom: -60,
    left: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  // Cabecera
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cycleLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  cycleRange: { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 2 },
  badgeWrapper: { justifyContent: 'flex-start' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  
  // Cuerpo principal
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 2, fontWeight: '600', marginBottom: -8 },
  amount: { color: '#fff', fontSize: 52, fontWeight: '800', letterSpacing: -2, lineHeight: 56, marginBottom: 4 },
  
  // Métricas del ciclo
  cycleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10, letterSpacing: 0.5 },
  statValue: { color: '#fff', fontSize: 15, fontWeight: '700', marginTop: 2 },
  divider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.1)' },

  // Sección de Ahorros
  savingsSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  savingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  savingsLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10, letterSpacing: 2, fontWeight: '700' },
  savingsAmount: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -1, marginTop: 2 },
  sparkle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dividerSavings: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
});