import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,

} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import {
  useCycleStore,
  selectTotalSaved,
  selectCycleHistory,
  BucketType,
  selectBuckets,
} from '../../stores/useCycleStore';
import useDataStore from "../../stores/useDataStore"

import { CategoryRow } from './components/CategoryRow';
import { RolloverModal } from './components/RolloverModal';
import { AllocationModal } from './components/AllocationModal';
import { useSettingsStore } from '../../stores/settingsStore';
import { t } from 'i18next';
import { darkTheme, lightTheme } from "../../theme/colors";
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles } from '../../theme/global.styles';
import { AccountModalSelector } from '../../components/forms/Inputs/AccountModalSelector';
import { CycleLineChart } from './components/CycleLineChart';
import { FixedExpenseRow } from './components/SpendingFixRow';

import { CloseCycleCard } from './components/CloseCycleCard';
import { HeroCard } from './components/HeroCard';
import { useShallow } from 'zustand/react/shallow';
import { subDays, addDays, differenceInDays } from 'date-fns';
import { BucketCard } from './components/BucketCard';
import { CollapsibleSection } from './components/CollapsibleSecction';
import { CycleHistoryRow } from './components/CircleHistory';


// ─── MOCK DATA ──────────────────────────────────────────────────────────────
export const today = new Date();
export const cycleStart = subDays(today, 10);
export const cycleEnd = addDays(today, 20);
export const cycleDays = differenceInDays(cycleEnd, cycleStart);
// export const daysElapsed = differenceInDays(today, cycleStart);

export const BUDGET = 1000;
export const SPENT = 400;
export const FIXED_UPCOMING = 120; // gastos fijos futuros
export const SAFE_TO_SPEND = BUDGET - SPENT - FIXED_UPCOMING;

// export const timeProgress = daysElapsed / cycleDays; // 0–1
export const spendProgress = SPENT / BUDGET; // 0–1
export const isOverpacing = spendProgress > 100;

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
  { icon: 'car', label: 'Transporte', spent: 60, limit: 150, color: '#E5B7D1' },
  { icon: 'shopping', label: 'Compras', spent: 40, limit: 200, color: '#96CEB4' },
];

export const gastosFijos = [
  { icon: 'phone', label: 'Internet', spent: 120, color: '#FF6B6B', paid: true },
  { icon: 'home', label: 'Hogar', spent: 180, color: '#4ECDC4', paid: false },
];


export default function CreditCycleScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => theme === 'dark' ? darkTheme : lightTheme, [theme]);
  const [daysElapsed, setDaysElapsed] = useState(0);
  const allAccounts = useDataStore((s) => s.allAccounts);
  const selectedAccount = useDataStore((s) => s.selectedAccount);
  const [isAccountSelectorOpen, setIsAccountSelectorOpen] = useState(false);  
  const [accountSelected, setAccountSelected] = useState<string>(selectedAccount);
  const setSelectedCycleAccount = useCycleStore((s) => s.setSelectedCycleAccount);

  // Memoizar la cuenta seleccionada
      const selectedAccountObj = useMemo(() => {
        setSelectedCycleAccount(accountSelected); // Actualiza el ciclo seleccionado en el store cada vez que cambia la cuenta
          return allAccounts.find(acc => acc.id === accountSelected);
      }, [accountSelected, allAccounts]);
 
    const [showRollover, setShowRollover] = useState(false);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({ onScroll: (e) => { scrollY.value = e.contentOffset.y; } });

  const selectedCycleAccount = useCycleStore((s) => s.selectedCycleAccount);

  const cycles = useCycleStore((s) => s.cycles);

  const buckets = useCycleStore((state) => selectBuckets(selectedCycleAccount || '')(state));
  const history = useCycleStore(
    useShallow((state) => selectCycleHistory(selectedCycleAccount || '')(state))
  );
  const saved = useCycleStore((state) => selectTotalSaved(selectedCycleAccount || '')(state));

  useEffect(() => {
    console.log("ciclos en store:", cycles);
    if (cycles.length > 0 && selectedCycleAccount) {
      // 
      console.log("Buscando último ciclo activo para la cuenta:", selectedCycleAccount);
      const lastActiveCycle = [...cycles].reverse().find(c => c.status === 'active' && c.accountId === selectedCycleAccount);
      if (!lastActiveCycle) {
        console.log("No se encontró un ciclo activo para la cuenta:", selectedCycleAccount);
        setShowRollover(true);
      } else {
        console.log("Último ciclo activo encontrado:", lastActiveCycle);
        setShowRollover(false);
        const daysElapsed = differenceInDays(new Date(lastActiveCycle.endDate), new Date(lastActiveCycle.startDate));
        setDaysElapsed(daysElapsed);
      }
    }
  }, [cycles, selectedCycleAccount]);



  // Busca el último ciclo cerrado sin destino asignado (pendiente de allocate)
  const pendingSurplusCycle = cycles.find(
    (c) => c.status === 'closed' && !c.surplusDestination && (c.surplusAmount ?? 0) > 0
  );

  const [showAlloc, setShowAlloc] = useState(!!pendingSurplusCycle);

  const bucketOrder: BucketType[] = ['savings', 'emergency', 'investment'];

  return (
    <View style={main.root}>
      <LinearGradient
                  colors={[colors.surfaceSecondary, theme === 'dark' ? colors.primary : colors.accent,]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
      
                  // 2. Quitamos el backgroundColor sólido para que se vea el gradiente
                  style={[
                      globalStyles.screenContainer,
                  ]}
              >
        <AccountModalSelector
                isOpen={isAccountSelectorOpen} 
                setIsOpen={setIsAccountSelectorOpen} 
                accounts={allAccounts}
                accountSelected={accountSelected}
                setAccountSelected={setAccountSelected}
                colors={colors}
                label={t('navigation.accounts')}
            />

           
      <SafeAreaView style={{ flex: 1 }}>
          {/* Cartel que sale para cerrar el ciclo */}


        {/* HEADER */}
          <Animated.View style={[screen.topBar, { backgroundColor: colors.surfaceSecondary + '80' }]}>
           <View style={screen.titleBlock}>
             <Text style={[globalStyles.headerTitleBase, { color: colors.text }]}>{selectedAccountObj?.name}</Text>
              <Text style={[
            globalStyles.bodyTextBase,
             { color: colors.textSecondary }
             ]}>{t('cycle_screen.active_cycle')} {daysElapsed} {daysElapsed === 1 ? t('cycle_screen.days_singular') : t('cycle_screen.days')}
             </Text>
            </View> 

           <TouchableOpacity style={[
            globalStyles.smallButton,
             { 
              backgroundColor: colors.text, 
              position: 'absolute', right: 10,top: 10, 
              }]} 
              onPress={() => setIsAccountSelectorOpen((prev) => !prev)
              }>
             <Ionicons name="menu" size={24} color={colors.surface} />
           </TouchableOpacity>

           
      </Animated.View>


          {pendingSurplusCycle && !showAlloc && (
            <Animated.View entering={FadeInDown.springify()}>
              <TouchableOpacity
                style={[main.pendingAlert, { backgroundColor: colors.warning + '20', borderColor: colors.warning + '40', marginBottom: 12 }]}
                onPress={() => setShowAlloc(true)}
                activeOpacity={0.85}
              >
                <Text style={main.pendingEmoji}>🎉</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[globalStyles.bodyTextXl, { color: colors.text, fontWeight: 'bold', }]}>
                    Tienes ${pendingSurplusCycle.surplusAmount} sin asignar
                  </Text>
                  <Text style={[globalStyles.bodyTextBase, { color: colors.text, fontWeight: '600', }]}>Toca para distribuir tu sobrante</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#68D391" />
              </TouchableOpacity>
            </Animated.View>
          )}
      {/* CONTENT */}
         <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={screen.scroll}
          showsVerticalScrollIndicator={false}
          >



          {/* HERO */}
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <HeroCard />
          </Animated.View>

          {/* CHART */}
            <CycleLineChart />

            <View style={{ height: 16 }} />

            {/* FIXED EXPENSES */}
            <Animated.View entering={FadeInDown.delay(350).springify()} style={[screen.section, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary + "40" }]}>
              <LinearGradient
                colors={[theme === 'dark' ? colors.accentSecondary + "40" : colors.accent + "40", colors.primary]}
                style={{ flex: 1, borderRadius: 22, padding: 22 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <View style={screen.sectionHeader}>
                  <Text style={[globalStyles.headerTitleBase, { color: colors.text }]}>{t('cycle_screen.fixed_expenses')}</Text>
                  <TouchableOpacity>
                    <Text style={[
                      globalStyles.bodyTextXs,
                      {
                        color: colors.primary,
                        backgroundColor: colors.textSecondary,
                        paddingHorizontal: 4,
                        paddingVertical: 2,
                        borderRadius: 25
                      }]}>{t('cycle_screen.view_all')}</Text>
                  </TouchableOpacity>
            </View>
                {gastosFijos.map((c, i) => (
                  <FixedExpenseRow key={c.label} item={c} delay={400 + i * 60} onToggle={() => { }} />
                ))}</LinearGradient>
            </Animated.View>

          {/* CATEGORIES */}
            <Animated.View entering={FadeInDown.delay(350).springify()} style={[screen.section, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary + "40" }]}>
              <LinearGradient
                colors={[colors.primary, theme === 'dark' ? colors.accentSecondary + "40" : colors.accent + "40"]}
                style={{ flex: 1, borderRadius: 22, padding: 22 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
            <View style={screen.sectionHeader}>
                  <Text style={[globalStyles.headerTitleBase, { color: colors.text, }]}>{t('cycle_screen.by_category')}</Text>
              <TouchableOpacity>
                    <Text style={[globalStyles.bodyTextXs, { color: colors.primary, backgroundColor: colors.textSecondary, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 25 }]}>{t('cycle_screen.view_all')}</Text>
              </TouchableOpacity>
            </View>
                {categories.map((c, i) => (
              <CategoryRow key={c.label} item={c} delay={400 + i * 60} />
            ))}
              </LinearGradient>
          </Animated.View>

            <View style={{ height: 16 }} />

          {/* BUCKETS GRID */}
            <CollapsibleSection title="Cofres de ahorro" initialExpanded={true} customStyles={{ borderColor: colors.accent, backgroundColor: colors.surfaceSecondary }}>
          {bucketOrder.map((id, i) => (
            <BucketCard key={id} bucket={buckets[id]} index={i} />
          ))}
            </CollapsibleSection>

          {/* SPECIAL BUCKETS */}
            <CollapsibleSection title="Flujo especial" initialExpanded={true} customStyles={{ borderColor: colors.warning, backgroundColor: colors.surfaceSecondary }}>
              {(['rollover', 'buffer'] as BucketType[]).map((id, i) => (
            <BucketCard key={id} bucket={buckets[id]} index={i + 3} />
          ))}
            </CollapsibleSection>

          {/* CYCLE HISTORY */}
            <CollapsibleSection title="Historial de ciclos" initialExpanded={false} customStyles={{ borderColor: colors.text, backgroundColor: colors.surfaceSecondary }}>
          {history.length > 0 && (
                <View style={main.historySection}>
              <View style={main.historyCard}>
                {history.slice(0, 6).map((c, i) => (
                  <CycleHistoryRow key={c.id} cycle={c} index={i} />
                ))}
              </View>
            </View>
          )}
            </CollapsibleSection>

            <View style={{ height: 4 }} />

            {/* ROLLOVER MODAL */}
            {showRollover && <RolloverModal onDismiss={() => setShowRollover(false)} />}

            {
              !pendingSurplusCycle && !showAlloc && (<CloseCycleCard />)
            }

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
      </LinearGradient>
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
  titleBlock: { flex: 1, alignItems: 'center' },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  topSub: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 1 },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 99, backgroundColor: '#FC8181', borderWidth: 2, borderColor: '#0D0D1A' },
  scroll: {  gap: 16, paddingBottom: 40 },
  section: {
    borderRadius: 22,
    borderWidth: 0.5,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  sectionSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  chartWrap: { alignItems: 'center' },
  legend: { flexDirection: 'row', gap: 20, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
});

export const rollover_s = StyleSheet.create({
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
    position: 'relative',
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

export const main = StyleSheet.create({
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