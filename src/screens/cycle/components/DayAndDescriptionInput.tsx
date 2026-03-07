import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Modal,
  Keyboard,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInLeft,
  SlideInRight,
  SlideInDown,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

import { ThemeColors } from '../../../types/navigation';
import { globalStyles } from '../../../theme/global.styles';

interface Props {
  isReady?: boolean;
  dayOfMonth: number;           // 1–31
  onDayChange: (day: number) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  colors: ThemeColors;
}

export function DayAndDescriptionInput({
  isReady,
  dayOfMonth,
  onDayChange,
  description,
  onDescriptionChange,
  colors,
}: Props) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  // Generamos un array del 1 al 31
  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleOpenPicker = () => {
    Keyboard.dismiss(); // Escondemos el teclado si estaba escribiendo la descripción
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowModal(true);
  };

  const handleSelectDay = (day: number) => {
    Haptics.selectionAsync();
    onDayChange(day);
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      {/* ── COLUMNA IZQUIERDA: Día del mes ── */}
      <View style={styles.dayColumn}>
        {isReady && (
          <Animated.View entering={FadeIn.delay(200)}>
            <Text
              style={[
                globalStyles.bodyTextSm,
                { color: colors.textSecondary, fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
              ]}
              numberOfLines={1}
            >
              {t('fixed_tx.day_label', 'DÍA')}
            </Text>
          </Animated.View>
        )}

        {isReady && (
          <Animated.View entering={SlideInLeft.duration(250)} style={{ width: '100%' }}>
            <TouchableOpacity
              onPress={handleOpenPicker}
              activeOpacity={0.7}
              style={[styles.dayPicker, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <MaterialCommunityIcons name="calendar-blank" size={18} color={colors.textSecondary} />
              
              <Text style={[styles.dayValue, { color: colors.text }]}>
                {String(dayOfMonth).padStart(2, '0')}
              </Text>
              
              <MaterialCommunityIcons name="chevron-down" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* ── COLUMNA DERECHA: Descripción ── */}
      <View style={styles.descColumn}>
        {isReady && (
          <Animated.View entering={FadeIn.delay(300)}>
            <Text
              style={[
                globalStyles.bodyTextSm,
                { color: colors.textSecondary, fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
              ]}
              numberOfLines={1}
            >
              {t('fixed_tx.description_label', 'DESCRIPCIÓN')}
            </Text>
          </Animated.View>
        )}

        {isReady && (
          <Animated.View
            entering={SlideInRight.duration(250)}
            style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={t('fixed_tx.description_placeholder', 'Netflix, Gimnasio...')}
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={onDescriptionChange}
              returnKeyType="done"
              maxLength={40}
            />
          </Animated.View>
        )}
      </View>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL — SELECTOR DE DÍAS (GRID)
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowModal(false)} />
        
        <View style={styles.modalWrapper}>
          <Animated.View 
            entering={SlideInDown.springify().damping(90)} 
            style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            
            <Text style={[globalStyles.headerTitleSm, { color: colors.text, textAlign: 'center', marginBottom: 16 }]}>
              {t('fixed_tx.select_day', 'Día de cobro')}
            </Text>

            <View style={styles.gridContainer}>
              {daysArray.map((d) => {
                const isSelected = d === dayOfMonth;
                return (
                  <TouchableOpacity
                    key={d}
                    activeOpacity={0.7}
                    onPress={() => handleSelectDay(d)}
                    style={[
                      styles.gridItem,
                      { backgroundColor: isSelected ? colors.accent : colors.surfaceSecondary }
                    ]}
                  >
                    <Text style={[
                      styles.gridItemText, 
                      { color: isSelected ? '#fff' : colors.text }
                    ]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
    width: '100%',
    paddingVertical: 8,
  },

  // ── Day picker Trigger ──
  dayColumn: {
    minHeight: 90,
    alignItems: 'center',
    flexShrink: 0,
    width: 100, // Ajustado para el nuevo botón
  },
  dayPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16, // Más moderno que 50 para botones con iconos
    borderWidth: 1, // Más visible
    height: 58,
    paddingHorizontal: 12,
  },
  dayValue: {
    fontSize: 20,
    fontFamily: 'FiraSans-Bold',
  },

  // ── Description input ──
  descColumn: {
    flex: 1,
    minHeight: 90,
  },
  inputWrapper: {
    height: 58,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'FiraSans-Regular',
    padding: 0,
  },

  // ── Modal Grid Styles ──
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 99,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  gridItem: {
    width: '12%', // Permite acomodar unos 7 días por fila tipo calendario
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridItemText: {
    fontSize: 16,
    fontFamily: 'FiraSans-Bold',
  },
});