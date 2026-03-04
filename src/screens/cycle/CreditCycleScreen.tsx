import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { subDays, addDays, differenceInDays } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

import { BucketType } from '../../stores/useCycleStore';
import { CategoryRow } from './components/CategoryRow';
import { RolloverModal } from './components/RolloverModal';
import { AllocationModal } from './components/AllocationModal';
import { useSettingsStore } from '../../stores/settingsStore';
import { t } from 'i18next';
import { darkTheme, lightTheme } from '../../theme/colors';
import { globalStyles } from '../../theme/global.styles';
import { AccountModalSelector } from '../../components/forms/Inputs/AccountModalSelector';
import { CycleBarChart } from './components/CycleBarChart';
import { FixedExpenseRow } from './components/SpendingFixRow';
import { CloseCycleCard } from './components/CloseCycleCard';
import { HeroCard } from './components/HeroCard';
import { BucketCard } from './components/BucketCard';
import { CollapsibleSection } from './components/CollapsibleSecction';
import { CycleHistoryRow } from './components/CircleHistory';

// ─── ÚNICO PUNTO DE ENTRADA AL HOOK ──────────────────────────────────────────
// useCreditCycleScreen se llama UNA SOLA VEZ aquí.
// Los datos se pasan hacia abajo como props a HeroCard y PacingBar.
// Así todos los componentes ven exactamente el mismo estado en el mismo render.
import { useCreditCycleScreen } from './hooks/useCreditCycleScreen';

// ─── MOCK DATA (pendiente de conectar a datos reales) ─────────────────────────
export const today = new Date();
export const cycleStart = subDays(today, 10);
export const cycleEnd = addDays(today, 20);
export const cycleDays = differenceInDays(cycleEnd, cycleStart);

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

// ─── SCREEN ───────────────────────────────────────────────────────────────────
export default function CreditCycleScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => (theme === 'dark' ? darkTheme : lightTheme), [theme]);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => { scrollY.value = e.contentOffset.y; },
  });

  // ── ÚNICA LLAMADA AL HOOK ─────────────────────────────────────────────────
  const {
    allAccounts,
    accountSelected,
    setAccountSelected,
    selectedAccountObj,
    isAccountSelectorOpen,
    setIsAccountSelectorOpen,
    isActiveCycle,
    daysElapsed,
    buckets,
    history,
    pendingSurplusCycle,
    showAlloc,
    setShowAlloc,
    showRollover,
    setShowRollover,
  } = useCreditCycleScreen();

  const bucketOrder: BucketType[] = ['savings', 'emergency', 'investment'];

  return (
    <View style={main.root}>
      <LinearGradient
        colors={[colors.surfaceSecondary, theme === 'dark' ? colors.primary : colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={globalStyles.screenContainer}
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
          {/* ── HEADER ── */}
          <Animated.View style={[screen.topBar, { backgroundColor: colors.surfaceSecondary + '80' }]}>
            <View style={screen.titleBlock}>
              {/* selectedAccountObj siempre coincide con accountSelected */}
              <Text style={[globalStyles.headerTitleBase, { color: colors.text }]}>
                {selectedAccountObj?.name}
              </Text>
              <Text style={[globalStyles.bodyTextXs, { color: colors.textSecondary }]}>
                {!isActiveCycle
                  ? t('cycle_screen.no_active_cycle')
                  : `${t('cycle_screen.active_cycle')} ${daysElapsed} ${daysElapsed === 1
                    ? t('cycle_screen.days_singular')
                    : t('cycle_screen.days')
                  }`}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                globalStyles.smallButton,
                { backgroundColor: colors.text, position: 'absolute', right: 10, top: 10 },
              ]}
              onPress={() => setIsAccountSelectorOpen((prev) => !prev)}
            >
              <Ionicons name="menu" size={24} color={colors.surface} />
            </TouchableOpacity>
          </Animated.View>

          {/* ── ALERTA DE SURPLUS PENDIENTE ── */}
          {pendingSurplusCycle && !showAlloc && (
            <Animated.View entering={FadeInDown.springify()}>
              <TouchableOpacity
                style={[
                  main.pendingAlert,
                  {
                    backgroundColor: colors.warning + '20',
                    borderColor: colors.warning + '40',
                    marginBottom: 12,
                  },
                ]}
                onPress={() => setShowAlloc(true)}
                activeOpacity={0.85}
              >
                <Text style={main.pendingEmoji}>🎉</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[globalStyles.bodyTextXl, { color: colors.text, fontWeight: 'bold' }]}>
                    {t('cycle_screen.unallocated_surplus', { pendingSurplusCycle })}
                  </Text>
                  <Text style={[globalStyles.bodyTextBase, { color: colors.text, fontWeight: '600' }]}>
                    {t('cycle_screen.touch_to_allocate')}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={colors.income} />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* ── CONTENIDO ── */}
          <Animated.ScrollView
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            contentContainerStyle={screen.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* HERO — recibe todos los datos calculados como props */}
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <HeroCard />
            </Animated.View>

            {/* CHART */}
            <CycleBarChart />

            <View style={{ height: 16 }} />

            {/* GASTOS FIJOS */}
            <Animated.View
              entering={FadeInDown.delay(350).springify()}
              style={[screen.section, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary + '40' }]}
            >
              <LinearGradient
                colors={[
                  theme === 'dark' ? colors.accentSecondary + '40' : colors.accent + '40',
                  colors.primary,
                ]}
                style={{ flex: 1, borderRadius: 22, padding: 22 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <View style={screen.sectionHeader}>
                  <Text style={[globalStyles.headerTitleBase, { color: colors.text }]}>
                    {t('cycle_screen.fixed_expenses')}
                  </Text>
                  <TouchableOpacity>
                    <Text
                      style={[
                        globalStyles.bodyTextXs,
                        {
                          color: colors.primary,
                          backgroundColor: colors.textSecondary,
                          paddingHorizontal: 4,
                          paddingVertical: 2,
                          borderRadius: 25,
                        },
                      ]}
                    >
                      {t('cycle_screen.view_all')}
                    </Text>
                  </TouchableOpacity>
                </View>
                {gastosFijos.map((c, i) => (
                  <FixedExpenseRow key={c.label} item={c} delay={400 + i * 60} onToggle={() => { }} />
                ))}
              </LinearGradient>
            </Animated.View>

            {/* CATEGORÍAS */}
            <Animated.View
              entering={FadeInDown.delay(350).springify()}
              style={[screen.section, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary + '40' }]}
            >
              <LinearGradient
                colors={[
                  colors.primary,
                  theme === 'dark' ? colors.accentSecondary + '40' : colors.accent + '40',
                ]}
                style={{ flex: 1, borderRadius: 22, padding: 22 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={screen.sectionHeader}>
                  <Text style={[globalStyles.headerTitleBase, { color: colors.text }]}>
                    {t('cycle_screen.by_category')}
                  </Text>
                  <TouchableOpacity>
                    <Text
                      style={[
                        globalStyles.bodyTextXs,
                        {
                          color: colors.primary,
                          backgroundColor: colors.textSecondary,
                          paddingHorizontal: 4,
                          paddingVertical: 2,
                          borderRadius: 25,
                        },
                      ]}
                    >
                      {t('cycle_screen.view_all')}
                    </Text>
                  </TouchableOpacity>
                </View>
                {categories.map((c, i) => (
                  <CategoryRow key={c.label} item={c} delay={400 + i * 60} />
                ))}
              </LinearGradient>
            </Animated.View>

            <View style={{ height: 16 }} />

            {/* COFRES */}
            <CollapsibleSection
              title="Cofres de ahorro"
              initialExpanded={true}
              customStyles={{ borderColor: colors.accent, backgroundColor: colors.surfaceSecondary }}
            >
              {bucketOrder.map((id, i) => (
                <BucketCard key={id} bucket={buckets[id]} index={i} />
              ))}
            </CollapsibleSection>

            {/* FLUJO ESPECIAL */}
            <CollapsibleSection
              title="Flujo especial"
              initialExpanded={true}
              customStyles={{ borderColor: colors.warning, backgroundColor: colors.surfaceSecondary }}
            >
              {(['rollover', 'buffer'] as BucketType[]).map((id, i) => (
                <BucketCard key={id} bucket={buckets[id]} index={i + 3} />
              ))}
            </CollapsibleSection>

            {/* HISTORIAL */}
            <CollapsibleSection
              title="Historial de ciclos"
              initialExpanded={false}
              customStyles={{ borderColor: colors.text, backgroundColor: colors.surfaceSecondary }}
            >
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

            {showRollover && <RolloverModal onDismiss={() => setShowRollover(false)} />}

            {!pendingSurplusCycle && !showAlloc && <CloseCycleCard />}

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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  titleBlock: { flex: 1, alignItems: 'center' },
  scroll: { gap: 16, paddingBottom: 40 },
  section: { borderRadius: 22, borderWidth: 0.5 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
});

export const main = StyleSheet.create({
  root: { flex: 1 },
  pendingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  pendingEmoji: { fontSize: 28 },
  historySection: { gap: 8 },
  historyCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
});