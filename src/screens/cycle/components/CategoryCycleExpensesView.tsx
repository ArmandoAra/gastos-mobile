

import { LinearGradient } from 'expo-linear-gradient';
import { t } from 'i18next';
import React, { useMemo, useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { globalStyles } from '../../../theme/global.styles';
import { isSmallScreen } from '../../analytics/components/styles';
import { CategoryTransactionRow } from './CategoryTransactionRow';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useAuthStore } from '../../../stores/authStore';
import { darkTheme, lightTheme } from '../../../theme/colors';
import { CategoryLimitForm } from './CategoryLimitForm';
import { useCycleStore } from '../../../stores/useCycleStore';
import { useCreditCycleScreen } from '../hooks/useCreditCycleScreen';

interface TransactionsData {
    value: number;
    color: string;
    text: string;
    focused: boolean;
    onPress: () => void;
}

interface HandleCategorySelect { (text: string, value: number, color: string): void }

interface Props {
    data: TransactionsData[];
  statsByCycle: {
        totalExpenses: number;
        categoryTotalsWithIds: Record<string, {
        total: number;
        categoryId: string | null;
    }>
    };
    handleCategorySelect:  HandleCategorySelect;
    selectedCategory: string | null;
}

const MAX_VISIBLE = 5;

export const CategoryCycleExpensesView = ({ data, statsByCycle, handleCategorySelect, selectedCategory }: Props) => {
  const theme        = useSettingsStore((s) => s.theme);
  const colors       = useMemo(() => (theme === 'dark' ? darkTheme : lightTheme), [theme]);
  const currencySymbol = useAuthStore((s) => s.currencySymbol);
  const categoryLimits = useCycleStore((s) => s.categoryLimits);
  const {activeCycle} = useCreditCycleScreen();

  const [showAll, setShowAll]           = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false); // conecta tu modal/sheet de límite aquí

  const visibleData = showAll ? data : data.slice(0, MAX_VISIBLE);
  const hasMore     = data.length > MAX_VISIBLE;

  return (
    <Animated.View
      entering={FadeInDown.delay(350).springify()}
      exiting={FadeOutDown.delay(350)}
      style={[styles.section, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary + '40' }]}
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
        {/* ── HEADER CON BOTONES ── */}
        <View style={styles.sectionHeader}>   
          <Text style={[globalStyles.headerTitleBase, { color: colors.text }]}>
            {t('cycle_screen.by_category')}
          </Text>

          <View style={styles.btnRow}>
             {/* Botón: ver más / ver menos — solo si hay más de MAX_VISIBLE */}
            {hasMore && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowAll((prev) => !prev);
                }}
                style={[styles.btn, { backgroundColor: colors.surfaceSecondary }]}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons
                  name={showAll ? 'chevron-up' : 'format-list-bulleted'}
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={[styles.btnText, { color: colors.text }]}>
                  {showAll
                    ? t('cycle_screen.view_less', 'Menos')
                    : t('cycle_screen.view_all', 'Todas')}
                </Text>
                {!showAll && (
                  <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                    <Text style={[styles.badgeText, { color: colors.surface }]}>
                      {data.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Botón: agregar límite de categoría */}
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setLimitModalOpen(true); // ← conecta tu modal aquí
              }}
              style={[styles.btn, { backgroundColor: colors.text, borderColor: colors.accent + '55' }]}
              activeOpacity={0.75}
            >
              <MaterialCommunityIcons name="tune-variant" size={14} color={colors.surface} />
              <Text style={[styles.btnText, { color: colors.surface }]}>
                {t('cycle_screen.set_limit', 'Límite')}
              </Text>
            </TouchableOpacity>

           
          </View>
        </View>

        {/* ── LISTA ── */}
        <Animated.View layout={LinearTransition.springify().damping(18).stiffness(120)}>
          {visibleData.map((item, idx) => (
            <Animated.View
              key={`${item.text}-${idx}`}
              entering={FadeInDown.delay(idx * 40).springify()}
              exiting={FadeOutUp.duration(180)}
              layout={LinearTransition.springify().damping(18).stiffness(120)}
            >
              <CategoryTransactionRow
                limit={categoryLimits.find(l => l.categoryId === statsByCycle.categoryTotalsWithIds[item.text]?.categoryId && l.cycleId === activeCycle?.id)?.limitAmount || 0}
                item={item}
                idx={idx}
                totalExpenses={statsByCycle.totalExpenses}
                isSelected={selectedCategory === item.text}
                onPress={handleCategorySelect}
                currencySymbol={currencySymbol}
                colors={colors}
                isSmallScreen={isSmallScreen}
              />
            </Animated.View>
          ))}
        </Animated.View>

        <CategoryLimitForm 
          visible={limitModalOpen}
          setFormVisible={setLimitModalOpen}
          colors={colors}
         />

      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  section: { borderRadius: 22, borderWidth: 0.5 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
  },
  btnText: {
    fontSize: 12,
    fontFamily: 'FiraSans-SemiBold',
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 2,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'FiraSans-Bold',
  },
});
