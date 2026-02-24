import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {  View ,Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Modal, Platform} from "react-native";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { Bucket, BucketType, useCycleStore } from "../../../stores/useCycleStore";
import * as Haptics from "expo-haptics";

interface AllocationModalProps {
  cycleId: string;
  available: number;
  onDone: () => void;
}

export function AllocationModal({ cycleId, available, onDone }: AllocationModalProps) {
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
      <Text style={alloc.doneTitle}>¡Guardado!</Text>
      <Text style={alloc.doneSub}>
        ${customAmount} asignados a {buckets[selected!]?.emoji} {buckets[selected!]?.label}
      </Text>
    </Animated.View>
  );

  const renderConfirm = () => (
    <Animated.View entering={FadeInUp.springify()} style={alloc.card}>
      <Text style={alloc.header}>Confirmar asignación</Text>
      <Text style={alloc.bucketName}>
        {buckets[selected!]?.emoji} {buckets[selected!]?.label}
      </Text>

      <View style={alloc.inputRow}>
        <Text style={alloc.currency}>$</Text>
        <TextInput
          style={alloc.input}
          value={customAmount}
          onChangeText={setCustomAmount}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="rgba(255,255,255,0.3)"
          selectionColor="#68D391"
          autoFocus // Abre el teclado automáticamente
        />
      </View>
      <Text style={alloc.maxHint}>Máx. disponible: ${available}</Text>

      <View style={alloc.btnRow}>
        <TouchableOpacity style={alloc.btnSecondary} onPress={() => setStep('pick')}>
          <Text style={alloc.btnSecondaryText}>← Volver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={alloc.btnPrimary} onPress={handleConfirm}>
          <Text style={alloc.btnPrimaryText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderPick = () => (
    <Animated.View entering={FadeInUp.springify()} style={alloc.card}>
      <TouchableOpacity style={alloc.closeBtn} onPress={onDone}>
        <Ionicons name="close" size={20} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>
      <Text style={alloc.header}>🎉 ¡Sobraron ${available}!</Text>
      <Text style={alloc.subheader}>¿Dónde guardamos este dinero?</Text>
      
      {bucketOrder.map((id, i) => {
        const b = buckets[id];
        if (!b) return null; // Prevenir errores si el bucket no existe en el store inicial
        
        return (
          <Animated.View key={id} entering={FadeInDown.delay(i * 60).springify()}>
            <TouchableOpacity
              style={[alloc.option, { borderColor: b.color + '44' }]}
              onPress={() => handleSelect(id)}
              activeOpacity={0.8}
            >
              <View style={[alloc.optionIcon, { backgroundColor: b.color + '22' }]}>
                <Text style={{ fontSize: 22 }}>{b.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={alloc.optionLabel}>{b.label}</Text>
                <Text style={[alloc.optionSub, { color: b.color + 'bb' }]}>
                  {id === 'rollover'
                    ? 'Suma al presupuesto del próximo ciclo'
                    : id === 'buffer'
                    ? 'Cubre déficits futuros automáticamente'
                    : `Acumulado: $${b.totalAccumulated.toLocaleString()}`}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </Animated.View>
  );

  return (
    <Modal transparent animationType="fade">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#131320',
    borderRadius: 28,
    padding: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 4,
    marginBottom: 4,
  },
  header: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  subheader: { color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 8 },
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
  optionLabel: { color: '#fff', fontWeight: '700', fontSize: 14 },
  optionSub: { fontSize: 11, marginTop: 2 },
  // Confirm step
  bucketName: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  currency: { color: '#fff', fontSize: 28, fontWeight: '700', marginRight: 4 },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
    paddingVertical: 16,
    letterSpacing: -1,
  },
  maxHint: { color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnSecondary: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
  },
  btnSecondaryText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  btnPrimary: {
    flex: 2,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#68D391',
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#0d2a1a', fontWeight: '800', fontSize: 15 },
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
  doneTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  doneSub: { color: 'rgba(255,255,255,0.55)', fontSize: 14, textAlign: 'center' },
});