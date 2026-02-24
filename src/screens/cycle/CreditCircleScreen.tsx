import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { addDays, differenceInDays, format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  useCycleStore,
  selectActiveCycle,
  selectTotalSaved,
  selectCycleHistory,
  BucketType,
  Bucket,
} from '../../stores/useCycleStore';

// ─── MOCK DATA ──────────────────────────────────────────────────────────────
export const today = new Date();
export const cycleStart = subDays(today, 10);
export const cycleEnd = addDays(today, 20);
export const cycleDays = differenceInDays(cycleEnd, cycleStart);
export const daysElapsed = differenceInDays(today, cycleStart);

export const BUDGET = 1000;
export const SPENT = 400;
export const FIXED_UPCOMING = 120; // gastos fijos futuros
export const SAFE_TO_SPEND = BUDGET - SPENT - FIXED_UPCOMING;

export const timeProgress = daysElapsed / cycleDays; // 0–1
export const spendProgress = SPENT / BUDGET; // 0–1
export const isOverpacing = spendProgress > timeProgress;

export const realSpendingData = [
  { value: 0, label: 'D1' },
  { value: 50, label: 'D3' },
  { value: 150, label: 'D6' },
  { value: 400, label: 'Hoy' },
];
export const idealSpendingData = [
  { value: 0 },
  { value: 100 },
  { value: 200 },
  { value: 333 },
];

export const categories = [
  { icon: 'coffee', label: 'Café', spent: 120, limit: 80, color: '#FF6B6B' },
  { icon: 'food', label: 'Comida', spent: 180, limit: 300, color: '#4ECDC4' },
  { icon: 'car', label: 'Transporte', spent: 60, limit: 150, color: '#45B7D1' },
  { icon: 'shopping', label: 'Compras', spent: 40, limit: 200, color: '#96CEB4' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_W = (SCREEN_WIDTH - 48 - 12) / 2;

// ─── DEMO: Simulate a closed cycle with surplus for demo purposes ─────────────
function DemoSeedButton() {
  const startCycle = useCycleStore((s) => s.startNewCycle);
  const addExpense = useCycleStore((s) => s.addExpense);
  const closeCycle = useCycleStore((s) => s.closeCycle);
  const activeCycleId = useCycleStore((s) => s.activeCycleId);

  function seed() {
    if (activeCycleId) return; 
    const cycle = startCycle({
      baseBudget: 1000,
      startDate: new Date(Date.now() - 30 * 86400000),
      endDate: new Date(Date.now() - 1 * 86400000),
      fixedExpenses: 120,
    });
    addExpense(cycle.id, 650);
    closeCycle(cycle.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  return (
    <TouchableOpacity style={demo_s.btn} onPress={seed}>
      <Ionicons name="flask" size={14} color="#B794F4" />
      <Text style={demo_s.text}>Simular ciclo cerrado</Text>
    </TouchableOpacity>
  );
}

const demo_s = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(183,148,244,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(183,148,244,0.25)',
  },
  text: { color: '#B794F4', fontSize: 12, fontWeight: '600' },
});

import { useShallow } from 'zustand/react/shallow';
import { HeroCard } from './components/HeroCard';
import { LineChart } from 'react-native-gifted-charts';
import { CategoryRow } from './components/CategoryRow';
import { NudgeBanner } from './components/NudgetBanner';
import { RolloverModal } from './components/RolloverModal';
import { BucketCard } from './components/BucketCard';
import { CycleHistoryRow } from './components/CircleHistory';
import { AllocationModal } from './components/AllocationModal';


export default function CreditCycleScreen() {
    const [showRollover, setShowRollover] = useState(false);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({ onScroll: (e) => { scrollY.value = e.contentOffset.y; } });

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 80], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [0, 80], [0, -20], Extrapolation.CLAMP) }],
  }));
  const buckets = useCycleStore((s) => s.buckets);
  const cycles = useCycleStore((s) => s.cycles);
  const history = useCycleStore(useShallow(selectCycleHistory));

  // Busca el último ciclo cerrado sin destino asignado (pendiente de allocate)
  const pendingSurplusCycle = cycles.find(
    (c) => c.status === 'closed' && !c.surplusDestination && (c.surplusAmount ?? 0) > 0
  );

  const [showAlloc, setShowAlloc] = useState(!!pendingSurplusCycle);

  const bucketOrder: BucketType[] = ['savings', 'emergency', 'investment'];

  return (
    <View style={main.root}>
      <LinearGradient colors={['#080812', '#0d0d1a']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
           
          <DemoSeedButton />

        {/* HEADER */}
         <Animated.View style={[screen.topBar, headerStyle]}>
          <TouchableOpacity style={screen.iconBtn}>
             <Ionicons name="menu" size={22} color="#fff" />
           </TouchableOpacity>

           <View style={screen.titleBlock}>
             <Text style={screen.topTitle}>Mi Tarjeta</Text>
           <Text style={screen.topSub}>Ciclo activo · {daysElapsed} días</Text>
           </View>

           <TouchableOpacity style={screen.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
             <View style={screen.notifDot} />
           </TouchableOpacity>
      </Animated.View>

      {/* CONTENT */}
         <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={screen.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* NUDGE */}
          <NudgeBanner />

          {/* HERO */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <HeroCard />
          </Animated.View>

          {/* CHART */}
          <Animated.View entering={FadeInDown.delay(250).springify()} style={screen.section}>
            <View style={screen.sectionHeader}>
              <Text style={screen.sectionTitle}>Ritmo de gasto</Text>
              <Text style={screen.sectionSub}>Real vs. Ideal</Text>
            </View>

            <View style={screen.chartWrap}>
              <LineChart
                data={realSpendingData}
                data2={idealSpendingData}
                height={160}
                spacing={72}
                initialSpacing={20}
                color1="#FC8181"
                color2="#68D391"
                dataPointsColor1="#FC8181"
                dataPointsColor2="#68D391"
                startFillColor1="rgba(252,129,129,0.2)"
                startFillColor2="rgba(104,211,145,0.15)"
                endFillColor1="rgba(252,129,129,0)"
                endFillColor2="rgba(104,211,145,0)"
                areaChart
                thickness={2.5}
                hideRules
                hideAxesAndRules={false}
                rulesColor="rgba(255,255,255,0.06)"
                yAxisTextStyle={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                xAxisColor="rgba(255,255,255,0.08)"
                yAxisColor="transparent"
                backgroundColor="transparent"
              />

              {/* Leyenda */}
              <View style={screen.legend}>
                {[{ c: '#FC8181', l: 'Tu Gasto' }, { c: '#68D391', l: 'Gasto Ideal' }].map((i) => (
                  <View key={i.l} style={screen.legendItem}>
                    <View style={[screen.legendDot, { backgroundColor: i.c }]} />
                    <Text style={screen.legendText}>{i.l}</Text>
                  </View>
                ))}
              </View>
            </View>
            </Animated.View>
     

          {/* CATEGORIES */}
          <Animated.View entering={FadeInDown.delay(350).springify()} style={screen.section}>
            <View style={screen.sectionHeader}>
              <Text style={screen.sectionTitle}>Por categoría</Text>
              <TouchableOpacity>
                <Text style={screen.seeAll}>Ver todo →</Text>
              </TouchableOpacity>
            </View>
            {categories.map((c, i) => (
              <CategoryRow key={c.label} item={c} delay={400 + i * 60} />
            ))}
          </Animated.View>

      {/* ROLLOVER MODAL */}
      {showRollover && <RolloverModal onDismiss={() => setShowRollover(false)} />}

          {/* BUCKETS GRID */}
          <View style={main.sectionHeader}>
            <Text style={main.sectionTitle}>Cofres de ahorro</Text>
          </View>
          {bucketOrder.map((id, i) => (
            <BucketCard key={id} bucket={buckets[id]} index={i} />
          ))}

          {/* SPECIAL BUCKETS */}
          <View style={main.sectionHeader}>
            <Text style={main.sectionTitle}>Flujo especial</Text>
            <Text style={main.sectionSub}>Rollover · Buffer</Text>
          </View>
          {(['rollover', 'buffer'] as BucketType[]).map((id, i) => (
            <BucketCard key={id} bucket={buckets[id]} index={i + 3} />
          ))}

          {/* CYCLE HISTORY */}
          {history.length > 0 && (
            <View style={main.historySection}>
              <View style={main.sectionHeader}>
                <Text style={main.sectionTitle}>Historial de ciclos</Text>
                <Text style={main.sectionSub}>{history.length} ciclos</Text>
              </View>
              <View style={main.historyCard}>
                {history.slice(0, 6).map((c, i) => (
                  <CycleHistoryRow key={c.id} cycle={c} index={i} />
                ))}
              </View>
            </View>
          )}

           {/* ROLLOVER PROMO */}
          <Animated.View entering={FadeInDown.delay(480).springify()}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowRollover(true);
              }}
              style={rollover_s.card}
            >
              <LinearGradient
                colors={['#1e3a5f', '#0f3460']}
                style={rollover_s.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View>
                  <Text style={rollover_s.label}>🎯 PLANIFICA TU SOBRANTE</Text>
                  <Text style={rollover_s.title}>
                    Si cierras hoy,{'\n'}te sobrarían ${SAFE_TO_SPEND}
                  </Text>
                  <Text style={rollover_s.sub}>Toca para decidir qué hacer con ellos</Text>
                </View>
                <View style={rollover_s.arrow}>
                  <Ionicons name="arrow-forward" size={22} color="#63B3ED" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

           {/* PENDING SURPLUS ALERT  */}
          {/* Cartel que sale para cerrar el ciclo */}
          {pendingSurplusCycle && !showAlloc && (
            <Animated.View entering={FadeInDown.springify()}>
              <TouchableOpacity
                style={main.pendingAlert}
                onPress={() => setShowAlloc(true)}
                activeOpacity={0.85}
              >
                <Text style={main.pendingEmoji}>🎉</Text>
                <View style={{ flex: 1 }}>
                  <Text style={main.pendingTitle}>
                    Tienes ${pendingSurplusCycle.surplusAmount} sin asignar
                  </Text>
                  <Text style={main.pendingSub}>Toca para distribuir tu sobrante</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#68D391" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* ALLOCATION MODAL */}
          {/* Modal que permite asignar el sobrante */}
      {showAlloc && pendingSurplusCycle && (
        <AllocationModal
          cycleId={pendingSurplusCycle.id}
          available={pendingSurplusCycle.surplusAmount ?? 0}
          onDone={() => setShowAlloc(false)}
        />
      )}


          <View style={{ height: 40 }} />
        </Animated.ScrollView>
        </SafeAreaView>
      
    </View>
  );
}


const screen = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  titleBlock: { flex: 1, alignItems: 'center' },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  topSub: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 1 },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 99, backgroundColor: '#FC8181', borderWidth: 1.5, borderColor: '#0D0D1A' },
  scroll: { paddingHorizontal: 16, gap: 16, paddingBottom: 40 },
  section: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  sectionSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  seeAll: { color: '#63B3ED', fontSize: 13 },
  chartWrap: { alignItems: 'center' },
  legend: { flexDirection: 'row', gap: 20, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
});

const rollover_s = StyleSheet.create({
  card: { borderRadius: 22, overflow: 'hidden' },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(99,179,237,0.25)',
  },
  label: { color: '#63B3ED', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.5, lineHeight: 26 },
  sub: { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 6 },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99,179,237,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,179,237,0.3)',
  },
});

const main = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  topTitle: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  topSub: { color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 2 },
  scroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 40 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionSub: { color: 'rgba(255,255,255,0.35)', fontSize: 12 },
  pendingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(104,211,145,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(104,211,145,0.3)',
  },
  pendingEmoji: { fontSize: 28 },
  pendingTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
  pendingSub: { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 },
  historySection: { gap: 8 },
  historyCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
});