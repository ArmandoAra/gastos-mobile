import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { t } from 'i18next';
import * as Haptics from 'expo-haptics';

import { globalStyles } from '../../../theme/global.styles';
import { FixedExpenseRow } from './SpendingFixRow';
import { FixedTransaction } from '../../../interfaces/cycle.interface';
import { ThemeColors } from '../../../types/navigation';

interface Props {
  colors: ThemeColors;
  totalPaid: number;
  totalFixed: number;
  activeFixed: FixedTransaction[];
  handleTogglePaid: (id: string) => void;
  deleteFixedTx: (id: string) => void;
  listVisible?: boolean;
  setListVisible?: (v: boolean) => void;
}

export default function FixedTransactionsList({
  colors,
  totalPaid,
  totalFixed,
  activeFixed,
  handleTogglePaid,
  deleteFixedTx,
}: Props) {

  if (activeFixed.length === 0) {
    return (
      <Animated.View
        entering={FadeInDown.springify()}
        exiting={FadeOutUp.duration(180)}
        layout={LinearTransition.springify().damping(18).stiffness(120)}
        style={styles.emptyState}
      >
        <MaterialCommunityIcons name="inbox-outline" size={32} color={colors.textSecondary} />
        <Text style={[globalStyles.bodyTextBase, { color: colors.textSecondary, marginTop: 6 }]}>
          {t('fixed_tx.empty', 'No tienes gastos fijos aún')}
        </Text>
      </Animated.View>
    );
  }

  return (
    <>
      {/* Progress bar */}
      {totalFixed > 0 && (
        <Animated.View
          layout={LinearTransition.springify().damping(90).stiffness(120)}
          style={[styles.progressTrack, { backgroundColor: colors.border }]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.income,
                width: `${Math.min((totalPaid / totalFixed) * 100, 100)}%` as any,
              },
            ]}
          />
        </Animated.View>
      )}

      <Animated.View
        layout={LinearTransition.springify().delay(100).stiffness(120)}
        style={styles.listContainer}
      >
        {activeFixed.map((tx, i) => (
          <Animated.View
            key={tx.id}
            entering={FadeInUp.delay(i * 40).springify()}
            exiting={FadeOutUp.duration(50)}
            layout={LinearTransition.springify()}
            style={styles.rowWrap}
          >
            <View style={{ flex: 1 }}>
              <FixedExpenseRow
                item={{
                        categoryId: tx.categoryId || 'uncategorized',
                      icon: tx.category_icon_name,
                      label: tx.description,
                      spent: tx.amount,
                      paid: tx.isPaid,
                    }}
                delay={0} // El delay ya lo controla el Animated.View padre
                onToggle={() => handleTogglePaid(tx.id)}
              />
            </View>

            {
              !tx.isPaid && (
                <TouchableOpacity
              onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                deleteFixedTx(tx.id);
              }}
              style={styles.deleteBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.expense} />
            </TouchableOpacity>
              )
            }
          </Animated.View>
        ))}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 4,
    borderRadius: 99,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
  },
  listContainer: {
  // Sin height fijo — se adapta al contenido y LinearTransition lo anima
  },
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
});