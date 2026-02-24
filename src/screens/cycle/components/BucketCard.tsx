import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {  View ,Text, StyleSheet, TouchableOpacity} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Bucket, BucketType } from "../../../stores/useCycleStore";
import * as Haptics from "expo-haptics";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const BUCKET_META: Record<BucketType, { gradient: [string, string]; glow: string }> = {
  savings:    { gradient: ['#1a4731', '#2d6a4f'], glow: 'rgba(104,211,145,0.35)' },
  emergency:  { gradient: ['#4a2c0a', '#7b4a1e'], glow: 'rgba(246,173,85,0.35)' },
  investment: { gradient: ['#2d1b69', '#4a2c8a'], glow: 'rgba(183,148,244,0.35)' },
  rollover:   { gradient: ['#0d2f4f', '#1a4a7a'], glow: 'rgba(99,179,237,0.35)' },
  buffer:     { gradient: ['#4a1a1a', '#7a2b2b'], glow: 'rgba(252,129,129,0.35)' },
};

export function BucketCard({ bucket, index }: { bucket: Bucket; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const meta = BUCKET_META[bucket.id];
  const lastDeposit = bucket.deposits[bucket.deposits.length - 1];

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => {
          Haptics.selectionAsync();
          setExpanded((v) => !v);
        }}
        style={{ marginBottom: 12 }}
      >
        <LinearGradient
          colors={meta.gradient}
          style={[bucket_s.card, { shadowColor: meta.glow }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Orb decorativo */}
          <View style={[bucket_s.orb, { backgroundColor: bucket.color + '18' }]} />

          <View style={bucket_s.topRow}>
            <View style={[bucket_s.emojiBox, { backgroundColor: bucket.color + '25' }]}>
              <Text style={bucket_s.emoji}>{bucket.emoji}</Text>
            </View>
            <View style={bucket_s.badge}>
              <Text style={[bucket_s.badgeText, { color: bucket.color }]}>
                {bucket.deposits.length} dep.
              </Text>
            </View>
          </View>

          <Text style={bucket_s.amount}>
            ${bucket.totalAccumulated.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
          </Text>
          <Text style={bucket_s.label}>{bucket.label}</Text>

          {lastDeposit && (
            <Text style={bucket_s.lastDeposit}>
              Último: +${lastDeposit.amount} ·{' '}
              {format(new Date(lastDeposit.date), 'dd MMM', { locale: es })}
            </Text>
          )}

          {/* Mini bar — fill relativo al mayor bucket */}
          {expanded && (
            <Animated.View entering={FadeInDown.springify()} style={bucket_s.historyBlock}>
              <View style={bucket_s.divider} />
              <Text style={bucket_s.historyTitle}>Historial de depósitos</Text>
              {bucket.deposits.length === 0 ? (
                <Text style={bucket_s.emptyHistory}>Sin depósitos aún</Text>
              ) : (
                [...bucket.deposits].reverse().slice(0, 5).map((d) => (
                  <View key={d.id} style={bucket_s.depositRow}>
                    <Text style={bucket_s.depositDate}>
                      {format(new Date(d.date), 'dd MMM yyyy', { locale: es })}
                    </Text>
                    <Text style={[bucket_s.depositAmount, { color: bucket.color }]}>
                      +${d.amount.toLocaleString()}
                    </Text>
                  </View>
                ))
              )}
            </Animated.View>
          )}

          <View style={bucket_s.chevronRow}>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color="rgba(255,255,255,0.3)"
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const bucket_s = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  orb: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  emojiBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 24 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  amount: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  label: { color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: 0.5, marginTop: 2 },
  lastDeposit: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 8 },
  chevronRow: { alignItems: 'center', marginTop: 12 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 12 },
  historyBlock: { marginTop: 4 },
  historyTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 1, marginBottom: 8, fontWeight: '700' },
  emptyHistory: { color: 'rgba(255,255,255,0.25)', fontSize: 12 },
  depositRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  depositDate: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  depositAmount: { fontWeight: '700', fontSize: 13 },
});