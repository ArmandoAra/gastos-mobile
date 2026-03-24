import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Modal, Platform
} from "react-native";
import Animated, { FadeInDown, FadeInUp, ZoomIn, FadeOutDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { t } from "i18next";
import { useShallow } from 'zustand/react/shallow'; // <-- 1. IMPORTANTE IMPORTAR ESTO

import { useCycleStore } from "../../../stores/useCycleStore";
import { useAuthStore } from "../../../stores/authStore";
import { useSettingsStore } from "../../../stores/settingsStore";
import { darkTheme, lightTheme } from "../../../theme/colors";
import { globalStyles } from "../../../theme/global.styles";
import { Bucket } from "../../../interfaces/cycle.interface"; 

interface AllocationModalProps {
  cycleId: string;
  available: number;
  onDone: () => void;
}

export function AllocationModal({ cycleId, available, onDone }: AllocationModalProps) {
  const currencySymbol = useAuthStore((s) => s.currencySymbol);
  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => theme === 'dark' ? darkTheme : lightTheme, [theme]);

  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);
  const [customAmount, setCustomAmount] = useState(String(available));
  const [step, setStep] = useState<'pick' | 'confirm' | 'done'>('pick');
  
  // Acciones
  const allocateToBucket = useCycleStore((s) => s.allocateToBucket);
  const applyRollover = useCycleStore((s) => s.applyRolloverToNextCycle); 
  const currentAccount = useCycleStore(s => s.selectedCycleAccount);

  // 2. Usamos useShallow para evitar que el filter() del store cause re-renders fantasma
  const buckets = useCycleStore(useShallow(s => s.getBucketsByAccount(currentAccount)));

  const isRolloverSelected = selectedBucket?.id === 'rollover';

  // 3. EL ARREGLO DEL BUCLE INFINITO
  useEffect(() => {
    // Si available es 0, PERO no estamos en la pantalla de éxito ('done'), entonces cerramos
    if (available <= 0 && step !== 'done') {
      onDone();
    }
    // Ignoramos onDone en las dependencias intencionalmente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available, step]); 

  function handleSelect(bucket: Bucket | { id: string, name: string, emoji: string, color: string }) {
    Haptics.selectionAsync();
    setSelectedBucket(bucket as Bucket);
    setCustomAmount(String(available));
    setStep('confirm');
  }

  function handleConfirm() {
    if (!selectedBucket) return;

    const parsedAmount = parseFloat(customAmount);
    const amountToAllocate = isNaN(parsedAmount) ? 0 : Math.max(0, Math.min(parsedAmount, available));

    if (amountToAllocate <= 0) {
      onDone();
      return;
    }

    if (isRolloverSelected) {
      applyRollover(cycleId, amountToAllocate); 
    } else {
      allocateToBucket(cycleId, selectedBucket.id, amountToAllocate);
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep('done');
    setTimeout(onDone, 1600);
  }

  return (
    <Modal animationType="fade" statusBarTranslucent transparent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={alloc.overlay}>
          {/* Botón Cerrar (Global para el overlay) */}
          {step === 'pick' && (
            <TouchableOpacity
              style={[alloc.closeBtn, { backgroundColor: colors.surface }]}
              onPress={onDone}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          )}

          {/* PASO 1: SELECCIONAR */}
          {step === 'pick' && (
            <Animated.View
              entering={FadeInDown.springify().damping(18)}
              exiting={FadeOutDown.duration(200)}
              style={[alloc.card, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
            >
              <Text style={[globalStyles.headerTitleXL, { color: colors.text, textAlign: 'center' }]}>
                🎉 ¡{t("cycle_screen.surplus")}: {currencySymbol}{available}
              </Text>
              <Text style={[globalStyles.bodyTextSm, { color: colors.textSecondary, textAlign: 'center', marginBottom: 16 }]}>
                {t("cycle_screen.where_to_store")}
              </Text>

              {/* Opción Especial: Rollover (Pasar al siguiente mes) */}
              <TouchableOpacity
                style={[alloc.option, { borderColor: colors.accent, backgroundColor: colors.accent + '15' }]}
                onPress={() => handleSelect({ id: 'rollover', name: 'Siguiente Ciclo', emoji: '⏩', color: colors.accent })}
                activeOpacity={0.8}
              >
                <View style={[alloc.optionIcon, { backgroundColor: colors.accent + '30' }]}>
                  <Text style={{ fontSize: 22 }}>⏩</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[globalStyles.bodyTextSm, { color: colors.text, fontWeight: 'bold' }]}>
                    Usar el próximo ciclo
                  </Text>
                  <Text style={[globalStyles.bodyTextXs, { color: colors.textSecondary }]}>
                    {t("cycle_screen.rollover_description")}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.text} />
              </TouchableOpacity>

              {/* Lista dinámica de cofres del usuario */}
              {buckets.map((b, i) => (
                <Animated.View key={b.id} entering={FadeInDown.delay((i + 1) * 60).springify()}>
                  <TouchableOpacity
                    style={[alloc.option, { borderColor: colors.primary, backgroundColor: (colors.primary) + '15' }]}
                    onPress={() => handleSelect(b)}
                    activeOpacity={0.8}
                  >
                    <View style={[alloc.optionIcon, { backgroundColor: (colors.primary) + '30' }]}>
                      <Text style={{ fontSize: 22 }}>{b.iconName?.length <= 2 ? b.iconName : '💰'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[globalStyles.bodyTextSm, { color: colors.text, fontWeight: 'bold' }]}>{b.name}</Text>
                      <Text style={[globalStyles.bodyTextXs, { color: colors.textSecondary }]}>
                        {t("cycle_screen.accumulated")}: {currencySymbol}{b.totalAccumulated.toLocaleString()}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.text} />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {/* PASO 2: CONFIRMAR MONTO */}
          {step === 'confirm' && selectedBucket && (
            <Animated.View
              entering={FadeInUp.springify()}
              style={[alloc.card, { borderColor: colors.primary, backgroundColor: colors.surface }]}
            >
              <Text style={[globalStyles.headerTitleXL, { color: colors.text, textAlign: 'center' }]}>
                {t("cycle_screen.confirm_allocation")}
              </Text>

              <View style={{ alignItems: 'center', marginVertical: 12 }}>
                <Text style={{ fontSize: 40, marginBottom: 8 }}>{selectedBucket.iconName?.length <= 2 ? selectedBucket.iconName : '💰'}</Text>
                <Text style={[globalStyles.bodyTextLg, { color: colors.text }]}>{selectedBucket.name}</Text>
              </View>

              <View style={[alloc.inputRow, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[globalStyles.bodyTextLg, { color: colors.text }]}>{currencySymbol}</Text>
                <TextInput
                  style={[globalStyles.amountLg, { color: colors.text, flex: 1, paddingVertical: 12, paddingLeft: 8 }]}
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  selectionColor={colors.accent}
                  autoFocus
                />
              </View>
              <Text style={[alloc.maxHint, { color: colors.textSecondary }]}>{t("cycle_screen.max_available")}: {currencySymbol}{available}</Text>

              <View style={alloc.btnRow}>
                <TouchableOpacity style={[globalStyles.btnSecondary, { backgroundColor: colors.surfaceSecondary, flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14 }]} onPress={() => setStep('pick')}>
                  <Text style={[globalStyles.bodyTextLg, { color: colors.text, fontWeight: 'bold' }]}>{t("common.back")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[globalStyles.btnSecondary, { backgroundColor: colors.income, flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14 }]} onPress={handleConfirm}>
                  <Text style={[globalStyles.bodyTextLg, { color: colors.surface, fontWeight: 'bold' }]}>{t("common.confirm")}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* PASO 3: DONE */}
          {step === 'done' && selectedBucket && (
            <Animated.View entering={ZoomIn.springify()} style={[alloc.doneCard, { backgroundColor: colors.surface, borderColor: colors.income }]}>
              <Text style={alloc.doneEmoji}>✅</Text>
              <Text style={[globalStyles.headerTitleXL, { color: colors.text }]}>{t("cycle_screen.saved")}</Text>
              <Text style={[globalStyles.bodyTextLg, { color: colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
                {currencySymbol}{customAmount} {t("cycle_screen.allocated_to")} {selectedBucket.name}
              </Text>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const alloc = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  card: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  maxHint: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12
  },
  doneCard: {
    alignSelf: 'center',
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
  },
  doneEmoji: {
    fontSize: 64,
    marginBottom: 12
  },
});