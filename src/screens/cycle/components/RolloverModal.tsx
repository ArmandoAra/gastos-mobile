import {  View, TouchableOpacity,Text,StyleSheet } from "react-native";
import { FadeInUp } from "react-native-reanimated";
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';



const BUDGET = 1000;
const SPENT = 400;
const FIXED_UPCOMING = 120; // gastos fijos futuros
const SAFE_TO_SPEND = BUDGET - SPENT - FIXED_UPCOMING;


/** Rollover modal */
export function RolloverModal({ onDismiss }: { onDismiss: () => void }) {
  const options = [
    { icon: '🐷', label: 'Ahorrar', sub: 'Agregar a mi fondo', color: '#68D391' },
    { icon: '✈️', label: 'Meta: Japón', sub: 'Rollover a objetivo', color: '#63B3ED' },
    { icon: '🛡️', label: 'Emergencias', sub: 'Fondo de seguridad', color: '#F6AD55' },
  ];

  return (
    <Animated.View entering={FadeInUp.springify()} style={modal_s.overlay}>
      <View style={modal_s.card}>
        <Text style={modal_s.emoji}>🎉</Text>
        <Text style={modal_s.title}>¡Lo lograste!</Text>
        <Text style={modal_s.sub}>Te sobraron ${SAFE_TO_SPEND} este ciclo. ¿Qué haces con ellos?</Text>

        <View style={modal_s.options}>
          {options.map((o, i) => (
            <TouchableOpacity
              key={i}
              style={[modal_s.optBtn, { borderColor: o.color + '55' }]}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onDismiss();
              }}
              activeOpacity={0.8}
            >
              <Text style={modal_s.optIcon}>{o.icon}</Text>
              <View>
                <Text style={[modal_s.optLabel, { color: o.color }]}>{o.label}</Text>
                <Text style={modal_s.optSub}>{o.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={onDismiss} style={modal_s.skip}>
          <Text style={modal_s.skipText}>Decidir después</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const modal_s = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 99,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  sub: { color: 'rgba(255,255,255,0.55)', fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  options: { width: '100%', gap: 10 },
  optBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  optIcon: { fontSize: 24 },
  optLabel: { fontWeight: '700', fontSize: 14 },
  optSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 1 },
  skip: { marginTop: 20 },
  skipText: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },
});