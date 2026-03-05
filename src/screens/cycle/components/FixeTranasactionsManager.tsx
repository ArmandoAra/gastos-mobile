import React, { useMemo, useState, useCallback } from 'react';
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

// ─── ICON PICKER OPTIONS ─────────────────────────────────────────────────────
const ICON_OPTIONS: { name: string; color: string }[] = [
  { name: 'home',            color: '#63B3ED' },
  { name: 'car',             color: '#F6AD55' },
  { name: 'wifi',            color: '#68D391' },
  { name: 'cellphone',       color: '#B794F4' },
  { name: 'lightning-bolt',  color: '#FC8181' },
  { name: 'netflix',         color: '#FC5858' },
  { name: 'spotify',         color: '#1DB954' },
  { name: 'gym',             color: '#F6AD55' },
  { name: 'medical-bag',     color: '#68D391' },
  { name: 'school',          color: '#63B3ED' },
  { name: 'food',            color: '#F6AD55' },
  { name: 'credit-card',     color: '#B794F4' },
  { name: 'water',           color: '#63B3ED' },
  { name: 'fire',            color: '#FC8181' },
  { name: 'dog',             color: '#F6AD55' },
];

const CATEGORY_OPTIONS = [
  'housing', 'transport', 'utilities', 'entertainment',
  'health', 'education', 'food', 'insurance', 'other',
];

// ─── FORM STATE ──────────────────────────────────────────────────────────────
interface FormState {
  description: string;
  amount: string;
  icon_name: string;
  color: string;
  day_of_month: string;
  category: string;
}

const EMPTY_FORM: FormState = {
  description: '',
  amount: '',
  icon_name: 'credit-card',
  color: '#B794F4',
  day_of_month: '1',
  category: 'other',
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

  // ── FIX: Usamos useShallow para leer el array del store y evitar loops ──
  const fixedTransactions = useCycleStore(
    useShallow((s) => s.getFixedTransactionsByAccount(accountId) || EMPTY_FIXED_TX)
  );
  
  const addFixedTransaction  = useCycleStore((s) => s.addFixedTransaction);
  const togglePaid           = useCycleStore((s) => s.toggleFixedTransactionPaid);
  const deleteFixedTx        = useCycleStore((s) => s.deleteFixedTransaction);

  // Filtramos las que pertenecen a este usuario (globales, no por cuenta)
  const myFixed: FixedTransaction[] = useMemo(
    () => fixedTransactions.filter((tx) => tx.user_id === userId),
    [fixedTransactions, userId]
  );

  const activeFixed   = myFixed.filter((tx) => tx.isActive);
  const inactiveFixed = myFixed.filter((tx) => !tx.isActive);

  // ── Modal states ──
  const [listVisible, setListVisible]   = useState(false);
  const [formVisible, setFormVisible]   = useState(false);
  const [form, setForm]                 = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError]       = useState<string | null>(null);

  // ── Handlers ──
  const openList = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setListVisible(true);
  };

  const openForm = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormVisible(true);
  };

  const handleTogglePaid = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    togglePaid( id);
  }, [togglePaid, accountId]);

  const handleSave = () => {
    if (!form.description.trim()) {
      setFormError(t('fixed_tx.error_name', 'Escribe un nombre'));
      return;
    }
    const amount = parseFloat(form.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      setFormError(t('fixed_tx.error_amount', 'Ingresa un monto válido'));
      return;
    }
    const day = parseInt(form.day_of_month, 10);
    if (isNaN(day) || day < 1 || day > 31) {
      setFormError(t('fixed_tx.error_day', 'Día inválido (1-31)'));
      return;
    }

    const now = new Date().toISOString();
    
    // ── FIX: Aseguramos que los campos coinciden con la interfaz Transaction ──
    addFixedTransaction({
        type: TransactionType.EXPENSE,
        amount: parseFloat(form.amount.replace(',', '.')),
        account_id: accountId,
        user_id: userId,
        description: form.description,
        category_icon_name: form.icon_name,
        categoryId: form.category,
        isPaid: false,
        isActive: true,
        dayOfMonth: parseInt(form.day_of_month, 10),
        slug_category_name: [form.category],
        date: now,
        created_at: now,
        updated_at: now,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFormVisible(false);
  };

  // ── Totales ──
  const totalFixed = useMemo(
    () => activeFixed.reduce((s, tx) => s + tx.amount, 0),
    [activeFixed]
  );
  const totalPaid = useMemo(
    () => activeFixed.filter((tx) => tx.isPaid).reduce((s, tx) => s + tx.amount, 0),
    [activeFixed]
  );

  return (
    <>
      {/* ── BOTONES DE ACCESO ── */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={openList}
          style={[styles.accessBtn, { backgroundColor: colors.surfaceSecondary }]}
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons name="format-list-bulleted" size={18} color={colors.accent} />
          <Text style={[styles.accessBtnText, { color: colors.text }]}>
            {t('fixed_tx.show_all', 'Gastos fijos')}
          </Text>
          {activeFixed.length > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.accent }]}>
              <Text style={styles.badgeText}>{activeFixed.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { setListVisible(false); openForm(); }}
          style={[styles.accessBtn, styles.addBtn, { backgroundColor: colors.accent + '22', borderColor: colors.accent + '55' }]}
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons name="plus" size={18} color={colors.accent} />
          <Text style={[styles.accessBtnText, { color: colors.accent }]}>
            {t('fixed_tx.add', 'Agregar fijo')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL — LISTA DE GASTOS FIJOS
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={listVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setListVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setListVisible(false)} />

        <Animated.View
          entering={SlideInDown.springify().damping(18)}
          style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}
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
              onPress={() => { setListVisible(false); openForm(); }}
              style={[styles.iconBtn, { backgroundColor: colors.accent + '22' }]}
            >
              <MaterialCommunityIcons name="plus" size={20} color={colors.accent} />
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          {totalFixed > 0 && (
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View style={[
                styles.progressFill,
                {
                  backgroundColor: colors.income,
                  width: `${Math.min((totalPaid / totalFixed) * 100, 100)}%` as any,
                },
              ]} />
            </View>
          )}

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {activeFixed.length === 0 ? (
              <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
                <MaterialCommunityIcons name="inbox-outline" size={40} color={colors.textSecondary} />
                <Text style={[globalStyles.bodyTextBase, { color: colors.textSecondary, marginTop: 8 }]}>
                  {t('fixed_tx.empty', 'No tienes gastos fijos aún')}
                </Text>
              </Animated.View>
            ) : (
              activeFixed.map((tx: FixedTransaction, i: number) => (
                <View key={tx.id} style={styles.rowWrap}>
                  <FixedExpenseRow
                    item={{
                      icon:   tx.category_icon_name,
                      label:  tx.description,
                      spent:  tx.amount,
                      paid:   tx.isPaid,
                    }}
                    delay={i * 40}
                    onToggle={() => handleTogglePaid(tx.id)}
                  />
                  {/* Acción de eliminar */}
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                      deleteFixedTx(tx.id); // FIX: El orden de argumentos es accountId, txId
                    }}
                    style={styles.deleteBtn}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.expense} />
                  </TouchableOpacity>
                </View>
              ))
            )}

            {/* Inactivos colapsados (Por ahora no implementaste toggleActive en el store, así que uso delete en su lugar o ignoro) */}
          </ScrollView>
        </Animated.View>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL — FORMULARIO NUEVA TRANSACCIÓN FIJA
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={formVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFormVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setFormVisible(false)} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kavWrapper}
          pointerEvents="box-none"
        >
          <Animated.View
            entering={SlideInDown.springify().damping(18)}
            style={[styles.sheet, styles.formSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            {/* Form header */}
            <View style={styles.sheetHeader}>
              <Text style={[globalStyles.headerTitleSm, { color: colors.text }]}>
                {t('fixed_tx.new', 'Nuevo gasto fijo')}
              </Text>
              <TouchableOpacity onPress={() => setFormVisible(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* ── ICON PICKER ── */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t('fixed_tx.icon', 'Icono y color')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconPicker}>
                {ICON_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.name}
                    onPress={() => setForm((f) => ({ ...f, icon_name: opt.name, color: opt.color }))}
                    style={[
                      styles.iconOption,
                      {
                        backgroundColor: opt.color + '22',
                        borderWidth: form.icon_name === opt.name ? 2 : 0,
                        borderColor: opt.color,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name={opt.name as any} size={22} color={opt.color} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* ── NOMBRE ── */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t('fixed_tx.name', 'Nombre')}
              </Text>
              <View style={[styles.inputRow, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                <MaterialCommunityIcons
                  name={form.icon_name as any}
                  size={18}
                  color={form.color}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('fixed_tx.name_placeholder', 'Ej: Netflix, Gimnasio...')}
                  placeholderTextColor={colors.textSecondary}
                  value={form.description}
                  onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
                  returnKeyType="next"
                />
              </View>

              {/* ── MONTO ── */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t('fixed_tx.amount', 'Monto')}
              </Text>
              <View style={[styles.inputRow, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                <Text style={[styles.currencyPrefix, { color: colors.textSecondary }]}>
                  {currencySymbol}
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  value={form.amount}
                  onChangeText={(v) => setForm((f) => ({ ...f, amount: v }))}
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                />
              </View>

              {/* ── DÍA DEL MES ── */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t('fixed_tx.day', 'Día de cobro (1-31)')}
              </Text>
              <View style={[styles.inputRow, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                <MaterialCommunityIcons name="calendar" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="1"
                  placeholderTextColor={colors.textSecondary}
                  value={form.day_of_month}
                  onChangeText={(v) => setForm((f) => ({ ...f, day_of_month: v }))}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  maxLength={2}
                />
              </View>

              {/* ── CATEGORÍA ── */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t('fixed_tx.category', 'Categoría')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {CATEGORY_OPTIONS.map((cat) => {
                  const active = form.category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setForm((f) => ({ ...f, category: cat }))}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active ? colors.accent + '22' : colors.surfaceSecondary,
                          borderColor: active ? colors.accent : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.chipText, { color: active ? colors.accent : colors.textSecondary }]}>
                        {t(`categories.${cat}`, cat)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Error */}
              {formError && (
                <Animated.View entering={FadeIn.duration(200)}>
                  <Text style={[styles.errorText, { color: colors.expense }]}>{formError}</Text>
                </Animated.View>
              )}

              {/* ── BOTÓN GUARDAR ── */}
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.saveBtn, { backgroundColor: colors.accent }]}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="check" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>
                  {t('fixed_tx.save', 'Guardar gasto fijo')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Buttons ──
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 8,
  },
  accessBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 99,
  },
  addBtn: {
    borderWidth: 1,
  },
  accessBtnText: {
    fontSize: 13,
    fontFamily: 'FiraSans-Bold',
  },
  badge: {
    width: 18,
    height: 18,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'FiraSans-Bold',
    color: '#fff',
  },

  // ── Modal common ──
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
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
    justifyContent: 'space-between',
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

  // ── Form ──
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: 'FiraSans-Bold',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 6,
  },
  iconPicker: {
    flexGrow: 0,
    marginBottom: 4,
  },
  iconOption: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'FiraSans-Regular',
    padding: 0,
  },
  currencyPrefix: {
    fontSize: 15,
    fontFamily: 'FiraSans-Bold',
    marginRight: 6,
  },
  chipRow: {
    flexGrow: 0,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'FiraSans-Bold',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'FiraSans-Regular',
    marginTop: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 20,
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: 'FiraSans-Bold',
    color: '#fff',
  },
});