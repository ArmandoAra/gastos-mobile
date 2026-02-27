import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import {  View ,Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Modal, Platform} from "react-native";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { Bucket, BucketType, useCycleStore } from "../../../stores/useCycleStore";
import * as Haptics from "expo-haptics";
import { t } from "i18next";
import { useAuthStore } from "../../../stores/authStore";
import { useSettingsStore } from "../../../stores/settingsStore";
import { darkTheme, lightTheme } from "../../../theme/colors";
import { globalStyles } from "../../../theme/global.styles";

interface AllocationModalProps {
  cycleId: string;
  available: number;
  onDone: () => void;
}

export function AllocationModal({ cycleId, available, onDone }: AllocationModalProps) {
  const currencySymbol = useAuthStore((s) => s.currencySymbol);
  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => theme === 'dark' ? darkTheme : lightTheme, [theme]);
  const [selected, setSelected] = useState<BucketType | null>(null);
  const [customAmount, setCustomAmount] = useState(String(available));
  const [step, setStep] = useState<'pick' | 'confirm' | 'done'>('pick');
  
  const allocateSurplus = useCycleStore((s) => s.allocateSurplus);
  const applyRollover = useCycleStore((s) => s.applyRolloverToNextCycle);
  const buckets = useCycleStore((s) => s.buckets);

  useEffect(() => {
    if (available <= 0) {
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available]);

  const bucketOrder: BucketType[] = ['rollover', 'savings', 'emergency', 'investment', 'buffer'];

  function handleSelect(id: BucketType) {
    Haptics.selectionAsync();
    setSelected(id);
    setCustomAmount(String(available)); // Resetea el input al máximo al seleccionar
    setStep('confirm');
  }

  function handleConfirm() {
    if (!selected) return;
    
    // SOLUCIÓN 2: Manejo más seguro del input numérico
    const parsedAmount = parseFloat(customAmount);
    // Si el texto no es un número válido (ej. vacío), usamos 0. Si no, tomamos el valor ingresado, limitado al disponible.
    const amountToAllocate = isNaN(parsedAmount) ? 0 : Math.max(0, Math.min(parsedAmount, available));

    if (amountToAllocate <= 0) {
      // Si decide no asignar nada, simplemente cerramos
      onDone();
      return;
    }

    if (selected === 'rollover') {
      applyRollover(cycleId, amountToAllocate);
    } else {
      allocateSurplus(cycleId, selected, amountToAllocate);
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep('done');
    setTimeout(onDone, 1600);
  }

  // SOLUCIÓN 1: Extrajimos las vistas para mayor claridad y estabilidad de las animaciones.
  const renderDone = () => (
    <Animated.View entering={ZoomIn.springify()} style={alloc.doneCard}>
      <Text style={alloc.doneEmoji}>✅</Text>
      <Text style={alloc.doneTitle}>{t("cycle_screen.saved")}</Text>
      <Text style={alloc.doneSub}>
        {currencySymbol}{customAmount} {t("cycle_screen.allocated_to")} {buckets[selected!]?.emoji} {buckets[selected!]?.label}
      </Text>
    </Animated.View>
  );

  const renderConfirm = () => (
    <Animated.View entering={FadeInUp.springify()} style={[alloc.card, { borderColor: buckets[selected!].color, backgroundColor: colors.surface }]}>
      <Text style={[globalStyles.headerTitleXL, { color: colors.text }]}>{t("cycle_screen.confirm_allocation")}</Text>
      <Text style={[globalStyles.bodyTextLg, { color: colors.text }]}>
        {buckets[selected!]?.emoji} {buckets[selected!]?.label}
      </Text>

      <View style={alloc.inputRow}>
        <Text style={[globalStyles.bodyTextLg, { color: colors.text }]}>{currencySymbol} </Text>
        <TextInput
          style={[globalStyles.amountInput, { color: colors.text, backgroundColor: colors.surfaceSecondary }]}
          value={customAmount}
          onChangeText={setCustomAmount}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="rgba(255,255,255,0.3)"
          selectionColor="#68D391"
          autoFocus // Abre el teclado automáticamente
        />
      </View>
      <Text style={alloc.maxHint}>{t("cycle_screen.max_available")}: {currencySymbol}{available}</Text>

      <View style={alloc.btnRow}>
        <TouchableOpacity style={[globalStyles.btnSecondary, { backgroundColor: colors.expense }]} onPress={() => setStep('pick')}>
          <Text style={[globalStyles.bodyTextLg, { color: colors.text, fontWeight: 'bold' }]}>{t("common.back")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[globalStyles.btnSecondary, { backgroundColor: colors.income }]} onPress={handleConfirm}>
          <Text style={[globalStyles.bodyTextLg, { color: colors.text, fontWeight: 'bold' }]}>{t("common.confirm")}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderPick = () => (
    <Animated.View entering={FadeInUp.springify()} style={[alloc.card, { backgroundColor: colors.surfaceSecondary }]}>
      <TouchableOpacity style={[alloc.closeBtn, { backgroundColor: colors.text, }]} onPress={onDone}>
        <Ionicons name="close" size={20} color={colors.surfaceSecondary} />
      </TouchableOpacity>
      {/* TODO: Poner un icono de fiesta */}
      <Text style={[globalStyles.headerTitleXL, { color: colors.text }]}>🎉 ¡{t("cycle_screen.surplus")}: {currencySymbol}{available}!</Text>
      <Text style={[globalStyles.bodyTextSm, { color: colors.text, fontWeight: 'bold' }]}>{t("cycle_screen.where_to_store")}</Text>
      
      {bucketOrder.map((id, i) => {
        const b = buckets[id];
        if (!b) return null; // Prevenir errores si el bucket no existe en el store inicial
        
        return (
          <Animated.View key={id} entering={FadeInDown.delay(i * 60).springify()}>
            <TouchableOpacity
              style={[alloc.option, { borderColor: b.color, backgroundColor: b.color + '22' }]}
              onPress={() => handleSelect(id)}
              activeOpacity={0.8}
            >
              <View style={[alloc.optionIcon, { backgroundColor: b.color + '22' }]}>
                <Text style={{ fontSize: 22 }}>{b.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[globalStyles.bodyTextSm, { color: colors.text, fontWeight: 'bold' }]}>{b.label}</Text>
                <Text style={[globalStyles.bodyTextSm, { color: colors.text }]}>
                  {id === 'rollover'
                    ? t("cycle_screen.rollover_description")
                    : id === 'buffer'
                      ? t("cycle_screen.buffer_description")
                      : `${t("cycle_screen.accumulated")}: ${currencySymbol}${b.totalAccumulated.toLocaleString()}`}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text} />
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </Animated.View>
  );

  return (
    <Modal animationType="fade" statusBarTranslucent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={alloc.overlay}>
          {step === 'done' && renderDone()}
          {step === 'confirm' && renderConfirm()}
          {step === 'pick' && renderPick()}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const alloc = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  card: {
    borderRadius: 28,
    padding: 24,
    gap: 10,
    borderWidth: 0.5,
  },
  closeBtn: {
    borderRadius: 50,
    alignSelf: 'flex-end',
    padding: 4,
    marginBottom: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Confirm step
  bucketName: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
  },
  maxHint: { color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },

  // Done step
  doneCard: {
    alignSelf: 'center',
    backgroundColor: '#131320',
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(104,211,145,0.3)',
    gap: 8,
  },
  doneEmoji: { fontSize: 56 },
});