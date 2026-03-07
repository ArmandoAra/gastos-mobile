import React from 'react';
import {
  Modal,
  Pressable,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Text,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { t } from 'i18next';
import Animated, { SlideInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { FixedTransaction } from '../../../interfaces/cycle.interface';
import { globalStyles } from '../../../theme/global.styles';
import { FixedExpenseRow } from './SpendingFixRow';

interface FixedTransactionsListProps {
  listVisible: boolean;
  setListVisible: (visible: boolean) => void;
  colors: any;
  totalPaid: number;
  totalFixed: number;
  currencySymbol: string;
  activeFixed: FixedTransaction[];
  handleTogglePaid: (txId: string) => void;
  deleteFixedTx: (txId: string) => void;
  openForm: () => void;
}

const FixedTransactionsList = ({
  listVisible,
  setListVisible,
  colors,
  totalPaid,
  totalFixed,
  currencySymbol,
  activeFixed,
  handleTogglePaid,
  deleteFixedTx,
  openForm,
}: FixedTransactionsListProps) => {

    console.log(activeFixed)
  return (
    <Modal
      visible={listVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setListVisible(false)}
    >
      <Pressable style={styles.backdrop} onPress={() => setListVisible(false)} />

      <Animated.View
        entering={SlideInDown.springify()}
        style={[
          styles.sheet,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <View>
            <Text style={[globalStyles.headerTitleSm, { color: colors.text }]}>
              {t('fixed_tx.title', 'Gastos Fijos')}
            </Text>
            <Text style={[globalStyles.bodyTextBase, { color: colors.textSecondary }]}>
              {currencySymbol}{totalPaid.toFixed(2)} / {currencySymbol}{totalFixed.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setListVisible(false);
              openForm();
            }}
            style={[styles.iconBtn, { backgroundColor: colors.accent + '22' }]}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="plus" size={22} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        {totalFixed > 0 && (
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.income,
                  width: `${Math.min((totalPaid / totalFixed) * 100, 100)}%` as any,
                },
              ]}
            />
          </View>
        )}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {activeFixed.length === 0 ? (
            <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
              <MaterialCommunityIcons
                name="inbox-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text
                style={[
                  globalStyles.bodyTextBase,
                  { color: colors.textSecondary, marginTop: 12 },
                ]}
              >
                {t('fixed_tx.empty', 'No tienes gastos fijos aún')}
              </Text>
            </Animated.View>
          ) : (
            activeFixed.map((tx: FixedTransaction, i: number) => (
              <View key={tx.id} style={styles.rowWrap}>
                {/* Contenedor flexible para asegurar que el row ocupe el espacio disponible */}
                <View style={styles.rowContent}>
                  <FixedExpenseRow
                    item={{
                        categoryId: tx.categoryId || 'uncategorized',
                      icon: tx.category_icon_name,
                      label: tx.description,
                      spent: tx.amount,
                      paid: tx.isPaid,
                    }}
                    delay={i * 40}
                    onToggle={() => handleTogglePaid(tx.id)}
                  />
                </View>

                {/* Acción de eliminar */}
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    deleteFixedTx(tx.id);
                  }}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={20}
                    color={colors.expense}
                  />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    maxHeight: '85%',
    minHeight: '60%', 
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 99,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  iconBtn: {
    width: 40, // Aumentado para mejor target táctil
    height: 40,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 6, // Engrosado ligeramente para mejor visualización
    borderRadius: 99,
    marginHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10, // Espaciado entre tarjetas
  },
  rowContent: {
    flex: 1, // Asegura que la tarjeta principal empuje el botón de eliminar al borde
  },
  deleteBtn: {
    padding: 10,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60, // Mayor respiración visual
  },
});

export default FixedTransactionsList;