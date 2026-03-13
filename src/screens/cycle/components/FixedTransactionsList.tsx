import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { FadeInDown, FadeInUp, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { t } from 'i18next';

import { globalStyles } from '../../../theme/global.styles';
import { FixedTransaction } from '../../../interfaces/cycle.interface';
import { ThemeColors } from '../../../types/navigation';
import { FixedTransactionItem } from './FixedTransactionItem'; // Importamos el nuevo item

interface Props {
  colors: ThemeColors;
  totalPaid: number;
  totalFixed: number;
  activeFixed: FixedTransaction[];
  handleTogglePaid: (id: string, accountId: string, amount: number) => void;
  deleteFixedTx: (id: string) => void;
  listVisible?: boolean;
  setListVisible?: (v: boolean) => void;
  openFormEdit: (tx: FixedTransaction) => void; // Nueva función para abrir el formulario de edición
}

export default function FixedTransactionsList({
  colors,
  totalPaid,
  totalFixed,
  activeFixed,
  handleTogglePaid,
  deleteFixedTx,
  openFormEdit,
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

      {/* Lista Animada */}
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
          >
            <FixedTransactionItem
              tx={tx}
              colors={colors}
              onToggle={handleTogglePaid}
              onDelete={deleteFixedTx}
              onEdit={openFormEdit}
            />
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
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
});