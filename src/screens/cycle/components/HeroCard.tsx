import React, { useMemo, useState } from 'react'; // <-- Añadido useState
import { View, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native'; // <-- Añadidos Modal y TouchableWithoutFeedback
import { Text } from 'react-native-paper'; // Quitamos Tooltip
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
} from '../CreditCycleScreen';
import { 
  useCycleStore, 
  selectTotalSaved, 
  selectCycleHistory 
} from '../../../stores/useCycleStore'; 
import { darkTheme, lightTheme } from '../../../theme/colors';
import { useSettingsStore } from '../../../stores/settingsStore';
import { t } from 'i18next';
import { globalStyles } from '../../../theme/global.styles';
import { useAuthStore } from '../../../stores/authStore';
import { InfoModalTotal } from './InfoModalTotal';
import { ThemeColors } from '../../../types/navigation';
import { BlueStar, RedStar, SavingsIcon, StarIcon, TriStarsIcon, WorkIcon, WorkIconPainted, YellowStar } from '../../../constants/icons';

export function HeroCard() {
  const currencySymbol = useAuthStore((s) => s.currencySymbol);
  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => theme === 'dark' ? darkTheme : lightTheme, [theme]);
  const iconsOptions = useSettingsStore((state) => state.iconsOptions);

  // ESTADO PARA EL MODAL DE AYUDA
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const totalSaved = useCycleStore(selectTotalSaved);
  const bufferBalance = useCycleStore((s) => s.bufferBalance);
  const rollover = useCycleStore((s) => s.buckets.rollover.totalAccumulated);
  const history = useCycleStore(useShallow(selectCycleHistory));

  const avgSurplus =
    history.length > 0
      ? history.reduce((a, c) => a + (c.surplusAmount ?? 0), 0) / history.length
      : 0;

  return (
    <>
      <Animated.View entering={FadeInDown.delay(50).springify()}>
        <LinearGradient
          colors={[colors.primary, theme === 'dark' ? colors.accentSecondary : colors.accent]}
          style={hero.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Orbes decorativos */}
          <View style={[hero.orb, { backgroundColor: colors.surfaceSecondary + '40' }]} />

          {/* ─── 1. CABECERA: CICLO Y RITMO ─── */}
          <View style={hero.header}>
            <View>
              <Text style={[globalStyles.headerTitleSm, { color: colors.text }]}>{t('cycle_screen.active_cycle')}</Text>
              <Text style={[globalStyles.bodyTextBase, { color: colors.text }]}>
                {format(cycleStart, 'dd MMM', { locale: es })} →{' '}
                {format(cycleEnd, 'dd MMM', { locale: es })}
              </Text>
            </View>
            <View style={hero.badgeWrapper}>
              <View style={[hero.badge, { backgroundColor: isOverpacing ? colors.expense : colors.income }]}>
                <Ionicons
                  name={isOverpacing ? 'trending-up' : 'checkmark-circle'}
                  size={12}
                  color={colors.surface}
                />
                <Text style={[hero.badgeText, { color: colors.surface }]}>{isOverpacing ? t('cycle_screen.accelerated') : t('cycle_screen.optimum')}</Text>
              </View>
            </View>
          </View>

          {/* ─── 2. CUERPO: DISPONIBLE Y BARRA ─── */}
          <Text style={[globalStyles.headerTitleSm, { color: colors.text }]}>{t('cycle_screen.today_available')}</Text>
          <Text style={[globalStyles.amountXl, { color: colors.text }]}>{currencySymbol}{SAFE_TO_SPEND.toLocaleString()}</Text>

          <PacingBar />

          {/* ─── 3. MÉTRICAS DEL CICLO ─── */}
          <View style={[hero.cycleStats, { backgroundColor: colors.surfaceSecondary + '40' }]}>
            <View style={hero.stat}>
              <Text style={[globalStyles.bodyTextSm, { color: colors.text, fontWeight: 'bold' }]}>{t('cycle_screen.spent')}</Text>
              <Text style={[globalStyles.bodyTextBase, { color: colors.text }]}>{currencySymbol}{SPENT.toLocaleString()}</Text>
            </View>
            <View style={[hero.divider, { backgroundColor: colors.border }]} />
            <View style={hero.stat}>
              <Text style={[globalStyles.bodyTextSm, { color: colors.text, fontWeight: 'bold' }]}>{t('cycle_screen.fixed_upcoming')}</Text>
              <Text style={[globalStyles.bodyTextBase, { color: colors.text }]}>{currencySymbol}{FIXED_UPCOMING.toLocaleString()}</Text>
            </View>
            <View style={[hero.divider, { backgroundColor: colors.border }]} />
            <View style={hero.stat}>
              <Text style={[globalStyles.bodyTextSm, { color: colors.text, fontWeight: 'bold' }]}>{t('cycle_screen.budget')}</Text>
              <Text style={[globalStyles.bodyTextBase, { color: colors.text }]}>{currencySymbol}{BUDGET.toLocaleString()}</Text>
            </View>
          </View>

          {/* ─── 4. SECCIÓN DE AHORROS ─── */}
          <View style={hero.savingsSection}>
            <View style={hero.savingsHeader}>
              <View>
                {/* NUEVO: Contenedor con el Título y el Icono de Ayuda juntos */}
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  onPress={() => setIsHelpVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={globalStyles.bodyTextLg}>{t('cycle_screen.total_saved')}</Text>
                  {iconsOptions === 'painted'
                    ? <TriStarsIcon size={22} />
                    : <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: colors.text }}>
                      <Ionicons name="help" size={12} color={colors.text} />

                      <StarIcon size={12} color={colors.text} style={{ position: "absolute", bottom: 12, left: 3 }} />
                      <StarIcon size={12} color={colors.expense} style={{ position: "absolute", top: 9, right: 10 }} />
                      <StarIcon size={12} color={colors.warning} style={{ position: "absolute", top: 9, left: 10 }} />
                    </View>
                  }
                </TouchableOpacity>
                <Text style={[globalStyles.bodyTextXl, { color: colors.text, fontWeight: 'bold' }]}>
                  {currencySymbol}{totalSaved.toLocaleString()}
                </Text>
              </View>
              <View style={[hero.sparkle, { backgroundColor: iconsOptions === 'painted' ? 'transparent' : colors.accent }]}>
                {iconsOptions === 'painted' ? <WorkIconPainted size={46} /> : <SavingsIcon size={32} color={colors.text} />}
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

      {/* ─── MODAL FLOTANTE DE AYUDA ─── */}
      {isHelpVisible && <InfoModalTotal isHelpVisible={isHelpVisible} setIsHelpVisible={setIsHelpVisible} colors={colors} />}
    </>
  );
}

const StatBlock = ({ value, label, colors, icon }: { value: string; label: string, colors: ThemeColors, icon: React.ReactNode }) => (
  <View style={hero.stat}>
    <Text style={[globalStyles.amountBase, { color: colors.text }]}>{value}</Text>
    <View style={hero.labelContainer}>
      {icon}
      <Text style={[globalStyles.bodyTextSm, { color: colors.text }]}>{label}</Text>
    </View>
  </View>
);

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
  touchableStat: {
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    paddingRight: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    letterSpacing: 0.5
  },
  statValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700'
  },
  savingsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dividerSavings: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 10
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
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
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 2, fontWeight: '600', marginBottom: -8 },
  amount: { color: '#fff', fontSize: 52, fontWeight: '800', letterSpacing: -2, lineHeight: 56, marginBottom: 4 },
  cycleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 25,
    padding: 14,
    marginTop: 4,
  },
  divider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.1)' },
  savingsSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  savingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sparkle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});