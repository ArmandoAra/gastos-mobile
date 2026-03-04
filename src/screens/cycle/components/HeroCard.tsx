import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Dimensions,
  Platform,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PacingBar } from './PacingBar';
import { useCycleStore, Cycle } from '../../../stores/useCycleStore';
import { darkTheme, lightTheme } from '../../../theme/colors';
import { useSettingsStore } from '../../../stores/settingsStore';
import { t } from 'i18next';
import { globalStyles } from '../../../theme/global.styles';
import { useAuthStore } from '../../../stores/authStore';
import { InfoModalTotal } from './InfoModalTotal';
import { ThemeColors } from '../../../types/navigation';
import {
  BlueStar,
  RedStar,
  SavingsIcon,
  StarIcon,
  TriStarsIcon,
  WorkIconPainted,
  YellowStar,
} from '../../../constants/icons';
import { CycleDatePicker } from './CycleDatePicker';
import { formatCycleDate } from '../../../utils/formatters';
import { useCreditCycleScreen } from '../hooks/useCreditCycleScreen';

// Para ajustar dinámicamente según el tamaño de la pantalla
const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

interface HeroCardProps {
  activeCycle: Cycle | null;
  timeProgress: number;
  spendProgress: number;
  safeToSpendToday: number;
  totalSpentInCycle: number;
  rollover: number;
  totalSaved: number;
  bufferBalance: number;
  avgSurplus: number;
}

export function HeroCard() {
  const { activeCycle,
    timeProgress,
    spendProgress,
    safeToSpendToday,
    totalSpentInCycle,
    rollover,
    totalSaved,
    bufferBalance,
    avgSurplus, } = useCreditCycleScreen();
  const currencySymbol = useAuthStore((s) => s.currencySymbol);
  const theme = useSettingsStore((s) => s.theme);
  const language = useSettingsStore((s) => s.language);
  const colors = useMemo(() => (theme === 'dark' ? darkTheme : lightTheme), [theme]);
  const iconsOptions = useSettingsStore((state) => state.iconsOptions);

  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const updateCycleBudget = useCycleStore((s) => s.updateCycleBudget);
  const [budgetValue, setBudgetValue] = useState('');

  useEffect(() => {
    setBudgetValue(activeCycle ? activeCycle.baseBudget.toString() : '0');
  }, [activeCycle?.id, activeCycle?.baseBudget]);

  const handleSaveBudget = () => {
    if (activeCycle) {
      const numericValue = parseFloat(budgetValue.replace(/[^0-9.]/g, ''));
      if (!isNaN(numericValue) && numericValue >= 0) {
        updateCycleBudget(activeCycle.id, numericValue);
        setBudgetValue(numericValue.toString());
      } else {
        setBudgetValue(activeCycle.baseBudget.toString());
      }
    }
    Keyboard.dismiss();
  };


  const isOverpacing = spendProgress > timeProgress;

  return (
    <>
      <Animated.View entering={FadeInDown.delay(50).springify()}>
        <LinearGradient
          colors={[colors.background, theme === 'dark' ? colors.accentSecondary : colors.accent]}
          style={hero.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          accessible={true}
          accessibilityRole="summary"
          accessibilityLabel={t('cycle_screen.a11y_hero_card_summary')}
        >
          <View style={[hero.orb, { backgroundColor: colors.surfaceSecondary + '40' }]} />

          {/* ─── 1. CABECERA: CICLO Y RITMO ─── */}
          <View style={hero.header}>
            <View style={hero.headerTextContainer}>
              <Text
                style={[globalStyles.headerTitleSm, { color: colors.text }]}
                accessibilityRole="header"
              >
                {t('cycle_screen.active_cycle')}
              </Text>
              {activeCycle ? (
                <Text
                  style={[globalStyles.bodyTextBase, { color: colors.text }]}
                  accessibilityLabel={`${t('cycle_screen.cycle_dates')}: ${formatCycleDate(activeCycle.startDate, language)} ${t('general.to')} ${formatCycleDate(activeCycle.endDate, language)}`}
                >
                  {formatCycleDate(activeCycle.startDate, language)} →{' '}
                  {formatCycleDate(activeCycle.endDate, language)}
                </Text>
              ) : (
                  <View style={hero.datePickerWrapper}>
                    <CycleDatePicker />
                  </View>
              )}
            </View>

            {activeCycle && (
              <View
                style={[hero.badge, { backgroundColor: isOverpacing ? colors.expense : colors.income }]}
                accessible={true}
                accessibilityLabel={isOverpacing ? t('cycle_screen.a11y_accelerated') : t('cycle_screen.a11y_optimum')}
              >
                <Ionicons
                  name={isOverpacing ? 'trending-up' : 'checkmark-circle'}
                  size={isSmallScreen ? 10 : 12}
                  color={colors.surface}
                />
                <Text
                  style={[hero.badgeText, { color: colors.surface, fontSize: isSmallScreen ? 9 : 10 }]}
                  numberOfLines={1}
                >
                  {isOverpacing ? t('cycle_screen.accelerated') : t('cycle_screen.optimum')}
                </Text>
              </View>
            )}
          </View>

          {/* ─── 2. DISPONIBLE HOY ─── */}
          <View
            accessible={true}
            accessibilityLabel={`${t('cycle_screen.today_available')}: ${currencySymbol}${safeToSpendToday}`}
          >
            <Text style={[globalStyles.headerTitleSm, { color: colors.text }]}>
              {t('cycle_screen.today_available')}
            </Text>
            <Text
              style={[globalStyles.amountXl, { color: safeToSpendToday < 0 ? colors.expense : colors.income }]}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {currencySymbol} {safeToSpendToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>

          <PacingBar timeProgress={timeProgress} spendProgress={spendProgress} />

          {/* ─── 3. MÉTRICAS DEL CICLO ─── */}
          <View style={[hero.cycleStats, { backgroundColor: colors.accent + '40' }]}>
            <View
              style={hero.stat}
              accessible={true}
              accessibilityLabel={`${t('cycle_screen.spent')}: ${currencySymbol}${totalSpentInCycle}`}
            >
              <Text style={[globalStyles.bodyTextSm, { color: colors.expense, fontWeight: 'bold' }]} adjustsFontSizeToFit numberOfLines={1}>
                {t('cycle_screen.spent')}
              </Text>
              <Text style={[globalStyles.bodyTextBase, { color: colors.expense }]} adjustsFontSizeToFit numberOfLines={1}>
                {currencySymbol} {totalSpentInCycle.toLocaleString()}
              </Text>
            </View>

            <View style={[hero.divider, { backgroundColor: colors.border }]} />

            <View
              style={hero.stat}
              accessible={true}
              accessibilityLabel={`${t('cycle_screen.fixed_upcoming')}: ${currencySymbol}${activeCycle?.fixedExpenses ?? 0}`}
            >
              <Text style={[globalStyles.bodyTextSm, { color: colors.expense, fontWeight: 'bold' }]} adjustsFontSizeToFit numberOfLines={1}>
                {t('cycle_screen.fixed_upcoming')}
              </Text>
              <Text style={[globalStyles.bodyTextBase, { color: colors.expense }]} adjustsFontSizeToFit numberOfLines={1}>
                {currencySymbol} {(activeCycle?.fixedExpenses ?? 0).toLocaleString()}
              </Text>
            </View>

            <View style={[hero.divider, { backgroundColor: colors.border }]} />

            {/* Presupuesto editable */}
            <View style={hero.stat}>
              <Text style={[globalStyles.bodyTextSm, { color: colors.income, fontWeight: 'bold' }]} adjustsFontSizeToFit numberOfLines={1}>
                {t('cycle_screen.budget')}
              </Text>
              <View
                style={[
                  hero.budgetInputContainer,
                  { backgroundColor: colors.surfaceSecondary + '40' },
                ]}
              >
                <Text style={[globalStyles.bodyTextBase, { color: colors.income }]}>
                  {currencySymbol}
                </Text>
                <TextInput
                  keyboardType="numeric"
                  value={budgetValue}
                  onChangeText={setBudgetValue}
                  onBlur={handleSaveBudget}
                  onSubmitEditing={handleSaveBudget}
                  editable={!!activeCycle}
                  textColor={colors.income}
                  accessibilityLabel={t('cycle_screen.a11y_edit_budget')}
                  accessibilityHint={t('cycle_screen.a11y_edit_budget_hint')}
                  returnKeyType="done"
                  style={[
                    globalStyles.bodyTextBase,
                    hero.budgetInput,
                    { color: colors.income, opacity: activeCycle ? 1 : 0.5 },
                  ]}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  cursorColor={colors.income}
                  dense
                />
                {!!activeCycle && (
                  <Ionicons
                    name="pencil"
                    size={12}
                    color={colors.income}
                    style={{ opacity: 0.6, marginLeft: 2 }}
                    importantForAccessibility="no"
                  />
                )}
              </View>
            </View>
          </View>

          {/* ─── 4. SECCIÓN DE AHORROS ─── */}
          <View style={hero.savingsSection}>
            <View style={hero.savingsHeader}>
              <View style={hero.savingsTitleContainer}>
                <TouchableOpacity
                  style={hero.helpTouchArea}
                  onPress={() => setIsHelpVisible(true)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={t('cycle_screen.a11y_help_savings')}
                  accessibilityHint={t('cycle_screen.a11y_help_savings_hint')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Mejora UX en móviles
                >
                  <Text style={[globalStyles.bodyTextLg, { marginRight: 6 }]}>{t('cycle_screen.total_saved')}</Text>
                  {iconsOptions === 'painted' ? (
                    <TriStarsIcon size={22} />
                  ) : (
                    <View style={[hero.helpIconOutline, { backgroundColor: colors.surface, borderColor: colors.text }]}>
                        <Ionicons name="help" size={12} color={colors.text} />
                    </View>
                  )}
                </TouchableOpacity>
                <Text
                  style={[globalStyles.bodyTextXl, { color: colors.text, fontWeight: 'bold' }]}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                >
                  {currencySymbol}{totalSaved.toLocaleString()}
                </Text>
              </View>
              <View
                style={[
                  hero.sparkle,
                  { backgroundColor: iconsOptions === 'painted' ? 'transparent' : colors.accent },
                ]}
                importantForAccessibility="no"
              >
                {iconsOptions === 'painted' ? (
                  <WorkIconPainted size={46} />
                ) : (
                  <SavingsIcon size={32} color={colors.text} />
                )}
              </View>
            </View>

            <View style={hero.savingsStats}>
              <StatBlock
                value={`${currencySymbol}${rollover.toLocaleString()}`}
                label={t('cycle_screen.rollover')}
                colors={colors}
                icon={iconsOptions === 'painted' ? <RedStar size={22} /> : <StarIcon size={22} color={colors.expense} />}
              />
              <View style={hero.dividerSavings} />
              <StatBlock
                value={`${currencySymbol}${bufferBalance.toLocaleString()}`}
                label={t('cycle_screen.buffer')}
                colors={colors}
                icon={iconsOptions === 'painted' ? <BlueStar size={22} /> : <StarIcon size={22} color={colors.text} />}
              />
              <View style={hero.dividerSavings} />
              <StatBlock
                value={`${currencySymbol}${Math.round(avgSurplus).toLocaleString()}`}
                label={t('cycle_screen.avg_per_cycle')}
                colors={colors}
                icon={iconsOptions === 'painted' ? <YellowStar size={22} /> : <StarIcon size={22} color={colors.warning} />}
              />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {isHelpVisible && (
        <InfoModalTotal
          isHelpVisible={isHelpVisible}
          setIsHelpVisible={setIsHelpVisible}
          colors={colors}
        />
      )}
    </>
  );
}

const StatBlock = ({
  value,
  label,
  colors,
  icon,
}: {
  value: string;
  label: string;
  colors: ThemeColors;
  icon: React.ReactNode;
}) => (
  <View
    style={hero.statBlock}
    accessible={true}
    accessibilityLabel={`${label}: ${value}`}
  >
    <Text
      style={[globalStyles.amountBase, { color: colors.text }]}
      adjustsFontSizeToFit
      numberOfLines={1}
    >
      {value}
    </Text>
    <View style={hero.labelContainer}>
      {icon}
      <Text
        style={[globalStyles.bodyTextSm, { color: colors.text, marginLeft: 4 }]}
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  </View>
);

const hero = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: isSmallScreen ? 16 : 24, // Padding adaptativo
    gap: isSmallScreen ? 12 : 16,     // Gap adaptativo
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap', // Permite envolver si la pantalla es muy pequeña
  },
  headerTextContainer: {
    flex: 1, // Toma el espacio disponible empujando el badge
    marginRight: 8,
  },
  datePickerWrapper: {
    alignItems: 'flex-start',
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6, // Un poco más alto para touch targets si fuera cliqueable
    borderRadius: 99,
    maxWidth: '45%', // Evita que un texto traducido muy largo rompa el header
  },
  badgeText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cycleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 25,
    padding: isSmallScreen ? 10 : 14,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 28,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 1, // Previene que textos largos se peguen al divider
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: Platform.OS === 'ios' ? 4 : 0, // Ajuste sutil por plataforma
    minWidth: isSmallScreen ? 60 : 70,
    maxWidth: '100%',
  },
  budgetInput: {
    backgroundColor: 'transparent',
    textAlign: 'center',
    minWidth: 40,
    height: 30,
    paddingHorizontal: 0,
  },
  savingsSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savingsTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  helpTouchArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  helpIconOutline: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
  },
  sparkle: {
    width: 48,
    height: 48,
    borderRadius: 24, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Mejor centrado vertical
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  dividerSavings: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)', 
  },
});