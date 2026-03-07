import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { FadeInDown, FadeIn, SlideInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { t } from 'i18next';
import { useShallow } from 'zustand/react/shallow'; // <-- IMPORTANTE PARA EVITAR LOOPS

import { useSettingsStore } from '../../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../../theme/colors';
import { globalStyles } from '../../../theme/global.styles';
import { useAuthStore } from '../../../stores/authStore';
import { FixedExpenseRow } from './SpendingFixRow';
import { useCycleStore } from '../../../stores/useCycleStore';
import { FixedTransaction } from '../../../interfaces/cycle.interface';
import { TransactionType } from '../../../interfaces/data.interface';
import { FixedTransactionForm } from './FixedTransactionForm';
import FixedTransactionsList from './FixedTransactionsList';



const EMPTY_FORM: Omit<FixedTransaction, 'id' | 'isActive' | 'created_at' | 'updated_at' | 'isPaid' | 'date' | 'slug_category_name' > = {
  description: '',
  category_icon_name: 'home',
  type: TransactionType.EXPENSE,
  account_id: '',
  user_id: '',
  dayOfMonth: 1,
  amount: 0,
};

// Constante vacía para evitar loops de re-renderizado en Zustand
const EMPTY_FIXED_TX: FixedTransaction[] = [];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
interface Props {
  accountId: string;
  userId: string;
  cycleId?: string; // Si existe ciclo activo, se puede marcar cuál ya se pagó
}

export function FixedTransactionsManager({ accountId, userId, cycleId }: Props) {
  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => (theme === 'dark' ? darkTheme : lightTheme), [theme]);
  const currencySymbol = useAuthStore((s) => s.currencySymbol);


  const fixedTransactions = useCycleStore(
    useShallow((s) => s.getFixedTransactionsByAccount(accountId) || []) // Reemplaza EMPTY_FIXED_TX si es necesario
  );

  const togglePaid           = useCycleStore((s) => s.toggleFixedTransactionPaid);
  const deleteFixedTx        = useCycleStore((s) => s.deleteFixedTransaction);

  // Filtramos las que pertenecen a este usuario (globales, no por cuenta)
  const myFixed: FixedTransaction[] = useMemo(
    () => fixedTransactions.filter((tx) => tx.user_id === userId),
    [fixedTransactions, userId]
  );

  const activeFixed   = myFixed.filter((tx) => tx.isActive);
  const inactiveFixed = myFixed.filter((tx) => !tx.isActive);

  // ── Modal & Toggle states ──
  const [listVisible, setListVisible]   = useState(false);
  const [formVisible, setFormVisible]   = useState(false);
  const [form, setForm]                 = useState(EMPTY_FORM);

  // 1. NUEVO ESTADO: Controla si vemos todos o solo los primeros 3
  const [showAllFixed, setShowAllFixed] = useState(false);

  // ── Handlers ──
  const openList = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setListVisible(true);
  };

  const openForm = () => {
    setForm(EMPTY_FORM);
    setFormVisible(true);
  };

  const handleTogglePaid = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    togglePaid(id);
  }, [togglePaid, accountId]); // Revisa tu acción togglePaid, normalmente requiere accountId y transactionId

  // ── Totales ──
  const totalFixed = useMemo(
    () => activeFixed.reduce((s, tx) => s + tx.amount, 0),
    [activeFixed]
  );
  const totalPaid = useMemo(
    () => activeFixed.filter((tx) => tx.isPaid).reduce((s, tx) => s + tx.amount, 0),
    [activeFixed]
  );

  // 2. NUEVA VARIABLE DERIVADA: La lista que se mostrará en pantalla
  const visibleFixedTransactions = useMemo(() => {
    return showAllFixed ? activeFixed : activeFixed.slice(0, 3);
  }, [showAllFixed, activeFixed]);

  return (
    <>
      {/* ── HEADER Y BOTONES DE ACCESO ── */}
      <View style={styles.buttonRow}>
        <View style={styles.sectionHeader}>
          <Text style={[globalStyles.headerTitleBase, { color: colors.text }]}>
            {t('cycle_screen.fixed_expenses')}
          </Text>
        </View>

        {/* Botón Toggle (Ver todos / Ver menos) - Solo aparece si hay más de 3 */}
        {activeFixed.length > 3 && (
          <TouchableOpacity
            // Alternamos el estado local en lugar de abrir el modal
            onPress={() => {
              Haptics.selectionAsync();
              setShowAllFixed(!showAllFixed);
            }}
            style={[styles.accessBtn, { backgroundColor: colors.surfaceSecondary }]}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons
              name={showAllFixed ? "chevron-up" : "format-list-bulleted"}
              size={18}
              color={colors.accent}
            />
            <Text style={[styles.accessBtnText, { color: colors.text }]}>
              {showAllFixed ? t('fixed_tx.show_less', 'menos') : t('fixed_tx.show_all', ' todos')}
            </Text>

            {!showAllFixed && (
              <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.badgeText, { color: colors.text }]}>{activeFixed.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Botón Agregar */}
        <TouchableOpacity
          onPress={() => { setListVisible(false); openForm(); }}
          style={[styles.accessBtn, { backgroundColor: colors.text, borderColor: colors.border }]}
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons name="plus" size={18} color={colors.surface} />
          <Text style={[globalStyles.bodyTextBase, { color: colors.surface }]}>
            {t('fixed_tx.add', 'Agregar')}
          </Text>
        </TouchableOpacity>
      </View>

      <FixedTransactionsList
        listVisible={listVisible}
        setListVisible={setListVisible}
        colors={colors}
        totalPaid={totalPaid}
        totalFixed={totalFixed}
        activeFixed={visibleFixedTransactions} // Aquí siempre le pasas todos si es un modal separado
        handleTogglePaid={handleTogglePaid}
        deleteFixedTx={deleteFixedTx}
      />

      <FixedTransactionForm
        visible={formVisible}
        setFormVisible={setFormVisible}
        form={form}
        setForm={setForm}
        colors={colors}
      />     
    </>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
export const styles = StyleSheet.create({
  // ── Buttons ──
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  accessBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  accessBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  // ── Modal common ──
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  kavWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
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
    minHeight: '75%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  formSheet: {
    // para el form usamos la misma base
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 99,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 4,
  },

  // ── Progress ──
  progressTrack: {
    height: 4,
    borderRadius: 99,
    marginHorizontal: 20,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
  },

  // ── List ──
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
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
    paddingVertical: 40,
  },
  inactiveSection: {
    marginTop: 20,
  },
  inactiveLbl: {
    fontSize: 11,
    fontFamily: 'FiraSans-Bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

});