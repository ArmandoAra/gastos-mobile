import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedScrollHandler,
  FadeOutDown,
  LinearTransition,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { subDays, addDays, differenceInDays } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

import { RolloverModal } from './components/RolloverModal';
import { AllocationModal } from './components/AllocationModal';
import { useSettingsStore } from '../../stores/settingsStore';
import { t } from 'i18next';
import { darkTheme, lightTheme } from '../../theme/colors';
import { globalStyles } from '../../theme/global.styles';
import { AccountModalSelector } from '../../components/forms/Inputs/AccountModalSelector';
import { CycleBarChart } from './components/CycleBarChart';
import { CloseCycleCard } from './components/CloseCycleCard';
import { HeroCard } from './components/HeroCard';
import { BucketCard } from './components/BucketCard';
import { CollapsibleSection } from './components/CollapsibleSecction';
import { CycleHistoryRow } from './components/CircleHistory';
import * as Haptics from 'expo-haptics';

// ─── ÚNICO PUNTO DE ENTRADA AL HOOK ──────────────────────────────────────────
// useCreditCycleScreen se llama UNA SOLA VEZ aquí.
// Los datos se pasan hacia abajo como props a HeroCard y PacingBar.
// Así todos los componentes ven exactamente el mismo estado en el mismo render.
import { useCreditCycleScreen } from './hooks/useCreditCycleScreen';
import { useAuthStore } from '../../stores/authStore';
import { useDailyExpenseLogic } from '../../hooks/useDailyExpenseLogic';
import { DetailsModal } from '../../components/charts/DetailsModal';
import { CategoryCycleExpensesView } from './components/CategoryCycleExpensesView';
import { FixedExpensesCycleView } from './components/FixedExpensesCycleView';

// ─── MOCK DATA (pendiente de conectar a datos reales) ─────────────────────────
export const today = new Date();
export const cycleStart = subDays(today, 10);
export const cycleEnd = addDays(today, 20);
export const cycleDays = differenceInDays(cycleEnd, cycleStart);


export const gastosFijos = [
  { icon: 'phone', label: 'Internet', spent: 120, color: '#FF6B6B', paid: true },
  { icon: 'home', label: 'Hogar', spent: 180, color: '#4ECDC4', paid: false },
];

// ─── SCREEN ───────────────────────────────────────────────────────────────────
export default function CreditCycleScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => (theme === 'dark' ? darkTheme : lightTheme), [theme]);
  const currentUserId = useAuthStore((s) => s.user?.id);

  if (!currentUserId) {
    return (
      <View style={[globalStyles.screenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={globalStyles.bodyTextBase}>{t('cycle_screen.no_user')}</Text>
      </View>
    );
  }


  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => { scrollY.value = e.contentOffset.y; },
  });

  // ── ÚNICA LLAMADA AL HOOK ─────────────────────────────────────────────────
  const {
    allAccounts,
    accountSelected,
    selectedAccountObj,
    isAccountSelectorOpen,
    isActiveCycle,
    daysElapsed,
    buckets,
    allBucketTransactions,
    history,
    activeCycle,
    pendingSurplusCycle,
    showAlloc,
    showRollover,
    setShowAlloc,
    setIsAccountSelectorOpen,
    setAccountSelected,
    setShowRollover,
    remainingDays
  } = useCreditCycleScreen();
  const { setCurrentPeriod, transactionsCycleData, statsByCycle, selectedCategory, handleCategorySelectByCycle, modalData, handleCloseModal } = useDailyExpenseLogic();
  const { currencySymbol } = useAuthStore();


  useEffect(() => {
    setCurrentPeriod('custom'); // Forzamos el periodo a 'custom' para que use las fechas del ciclo
  }, [activeCycle]);

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

            {/* MENU SELECTOR DE CUENTAS */}
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
                    {`${t('cycle_screen.unallocated_surplus')} ${currencySymbol}${pendingSurplusCycle.surplusAmount ?? 0}`}
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
            {/* HERO*/}
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <HeroCard />
            </Animated.View>

            {/* CHART */}
            <CycleBarChart />

            <View style={{ height: 16 }} />

            {/* GASTOS FIJOS */}
            <FixedExpensesCycleView />

            {/* CATEGORÍAS */}
            <CategoryCycleExpensesView
              data={transactionsCycleData}
              statsByCycle={statsByCycle}
              handleCategorySelect={handleCategorySelectByCycle}
              selectedCategory={selectedCategory}
            />

            <View style={{ height: 16 }} />

            {/* COFRES */}
            <CollapsibleSection title="Mis Cofres de Ahorro">
              <View style={screen.gridContainer}>

                {/* Mapeas tus cofres existentes */}
                {buckets.map((bucket, index) => (
                  <BucketCard
                    key={bucket.id}
                    bucket={bucket}
                    transactions={allBucketTransactions.filter(tx => tx.bucketId === bucket.id)}
                    index={index}
                    onPress={() => console.log('Abrir detalle del cofre')}
                  />
                ))}

                {/* El botón de agregar siempre va al final */}
                {/* <AddBucketButton
                  index={buckets.length}
                  onPress={() => console.log('Abrir modal de crear cofre')}
                /> */}

              </View>
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

            {/* daysElapsed > 2 */}
            {!pendingSurplusCycle && !showAlloc && daysElapsed > 2 && <CloseCycleCard />}

            {showAlloc && pendingSurplusCycle && (
              <AllocationModal
                cycleId={pendingSurplusCycle.id}
                available={pendingSurplusCycle.surplusAmount ?? 0}
                onDone={() => setShowAlloc(false)}
              />
            )}

            <View style={{ height: 40 }} />
          </Animated.ScrollView>


          {/* DETALLES DE GASTOS */}
          <DetailsModal
            modalVisible={!!selectedCategory}
            handleCloseModal={handleCloseModal}
            modalData={modalData}
            colors={colors}
            currencySymbol={currencySymbol}
          /> 
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

// ─── BOTÓN PARA AGREGAR NUEVO COFRE ──────────────────────────────────────────
export function AddBucketButton({
  onPress,
  index
}: {
  onPress: () => void;
  index: number
}) {
  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => theme === 'dark' ? darkTheme : lightTheme, [theme]);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify().damping(18)}
      layout={LinearTransition.springify()}
      style={screen.cardWrapper}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        style={[
          screen.card,
          screen.addCard,
          { borderColor: colors.border, backgroundColor: 'transparent' }
        ]}
      >
        <View style={[screen.addIconBox, { backgroundColor: colors.surfaceSecondary }]}>
          <Ionicons name="add" size={28} color={colors.textSecondary} />
        </View>
        <Text style={[globalStyles.bodyTextSm, { color: colors.textSecondary, marginTop: 12 }]}>
          {t("cycle_screen.add_bucket", "Nuevo cofre")}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const screen = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Esto empuja las tarjetas a los bordes y deja el gap al medio
    width: '100%',
  },
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
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 25,
    borderWidth: 0.3,
    overflow: 'hidden',
    minHeight: 72,
    marginVertical: 3
  },
  catAccentBar: {
    width: 4,
    borderRadius: 0,
    flexShrink: 0,
  },
  catInner: {
    flex: 1,
    padding: 12,
    gap: 10,
  },
  catRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  catNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  // Mini avatar cuadrado — igual que iconBox de CategoryRow
  catDotBox: {
    width: 28,
    height: 28,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  catName: {
    fontSize: 14,
    fontFamily: 'FiraSans-Bold',
    flex: 1,
    lineHeight: 20,
  },
  catNameSmall: {
    fontSize: 13,
    lineHeight: 18,
  },
  catRight: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  catValue: {
    fontSize: 14,
    fontFamily: 'FiraSans-Bold',
    textAlign: 'right',
    lineHeight: 20,
  },
  catValueSmall: {
    fontSize: 13,
    lineHeight: 18,
  },
  // Chip de porcentaje — pill como en el resto de la app
  percentChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  catPercent: {
    fontSize: 11,
    fontFamily: 'FiraSans-Bold',
    lineHeight: 14,
  },
  // Barra — h6 radius 99, igual que CategoryRow / BudgetCard
  progressBarBg: {
    height: 6,
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 99,
  },
  // Estilos específicos para el botón de agregar
  addCard: {
    borderStyle: 'dashed',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 130, // Asegura que todas las tarjetas tengan la misma altura base
    justifyContent: 'center',
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