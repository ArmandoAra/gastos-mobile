import React, { useState, useEffect } from 'react';
import { 
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Dimensions,
  AccessibilityInfo
} from 'react-native';
import Animated, { 
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut
} from 'react-native-reanimated';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { months, weekDaysShort } from '../../constants/date';
import { useSettingsStore } from '../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../theme/colors';
import { ThemeColors } from '../../types/navigation';
import { useTranslation } from 'react-i18next';


interface ModernCalendarSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function ModernCalendarSelector({ 
  selectedDate,
  onDateChange
}: ModernCalendarSelectorProps) {
  const { t } = useTranslation();
  const { theme, language } = useSettingsStore();
  const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;

  const [isOpen, setIsOpen] = useState(false);

  // Controla qué mes estamos viendo
  const [viewDate, setViewDate] = useState(selectedDate);

  useEffect(() => {
    if (isOpen) {
      setViewDate(selectedDate);
      if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(t('calendar.opened', 'Calendar opened'));
    }
  }, [isOpen, selectedDate]);

  const changeMonth = (increment: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + increment, 1);
    setViewDate(newDate);
  };

  const handleDaySelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onDateChange(newDate);
    setIsOpen(false);
    if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(`${t('calendar.selected', 'Selected')} ${day}`);
  };

  // Generar días
  const getDaysArray = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Domingo

    const days = [];
    // Rellenar vacíos
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    // Rellenar días
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const isSelected = (day: number) => {
    return selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewDate.getMonth() &&
      selectedDate.getFullYear() === viewDate.getFullYear();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
      today.getMonth() === viewDate.getMonth() &&
      today.getFullYear() === viewDate.getFullYear();
  };

  // Helper para nombre del mes accesible
  const monthName = months[language][viewDate.getMonth()];

  return (
    <>
      {/* --- BOTÓN FLOTANTE --- */}
      <Animated.View
        entering={FadeIn.delay(300)}
        style={styles.floatingContainer}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsOpen(true)}
          style={[styles.pillButton, { borderColor: colors.border, backgroundColor: isOpen ? colors.surface : colors.text }]}
          accessibilityRole="button"
          accessibilityLabel={t('calendar.open_calendar', 'Open date picker')}
          accessibilityHint={t('calendar.current_date', `Current date: ${selectedDate.toLocaleDateString()}`)}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={30} tint={theme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: isOpen ? colors.surface : colors.text, opacity: 0.95 }]} />
          )}

          <View style={styles.pillContent}>
            <Ionicons name="calendar-clear-outline" size={20} color={colors.accent} importantForAccessibility="no" />
            <MaterialIcons name="keyboard-arrow-down" size={24} color={colors.accent} importantForAccessibility="no" />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* --- MODAL CALENDARIO --- */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
        accessibilityViewIsModal={true}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop Clickeable */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
            accessibilityLabel={t('common.close')}
            accessibilityRole="button"
            >
            <Animated.View
              entering={FadeIn}
              exiting={FadeOut} 
              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
            />
            </TouchableOpacity>

            <Animated.View 
            entering={ZoomIn.duration(200)}
            exiting={ZoomOut.duration(150)}
            style={[
              styles.calendarCard,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
            >
            {/* Header: Navegación de Mes */}
            <View style={styles.header} accessibilityRole="header">
              <TouchableOpacity
                onPress={() => changeMonth(-1)}
                style={styles.arrowBtn}
                accessibilityRole="button"
                accessibilityLabel={t('calendar.prev_month', 'Previous month')}
              >
                <MaterialIcons name="chevron-left" size={32} color={colors.text} />
              </TouchableOpacity>

              <View style={{ alignItems: 'center' }} accessible={true}>
                <Text style={[styles.monthTitle, { color: colors.text }]}>
                  {monthName}
                </Text>
                <Text style={[styles.yearSubtitle, { color: colors.textSecondary }]}>
                  {viewDate.getFullYear()}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => changeMonth(1)}
                style={styles.arrowBtn}
                accessibilityRole="button"
                accessibilityLabel={t('calendar.next_month', 'Next month')}
              >
                <MaterialIcons name="chevron-right" size={32} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Días de la semana (Ignorados por lector para no ser redundantes al navegar por días) */}
            <View style={styles.weekRow} importantForAccessibility="no-hide-descendants">
              {weekDaysShort[language].map((day, index) => (
                <Text key={index} style={[styles.weekdayText, { color: colors.textSecondary }]}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Grid de Días */}
            <View style={styles.daysGrid}>
              {getDaysArray().map((day, index) => {
                // Espacios vacíos (Decorativos)
                if (day === null) {
                  return <View key={`empty-${index}`} style={styles.dayCell} importantForAccessibility="no" />;
                }

                const selected = isSelected(day);
                const today = isToday(day);

                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => handleDaySelect(day)}
                    style={styles.dayCell}
                    accessibilityRole="button"
                    accessibilityLabel={`${day}, ${months[language][viewDate.getMonth()]} ${viewDate.getFullYear()}`}
                    accessibilityState={{ selected: selected }}
                    accessibilityHint={today ? t('calendar.today_hint', 'Today') : t('calendar.select_hint', 'Tap to select')}
                  >
                                    <View style={[
                      styles.dayContent,
                      selected && { backgroundColor: colors.accentSecondary },
                      today && !selected && { borderWidth: 2, borderColor: colors.accent }
                                    ]}>
                      <Text
                        style={[
                          styles.dayText,
                          { color: selected ? colors.text : colors.textSecondary },
                          today && !selected && { color: colors.accent }
                        ]}
                        // CLAVE: Evita que el número se salga del círculo si el texto es gigante
                        adjustsFontSizeToFit={true}
                        numberOfLines={1}
                        minimumFontScale={0.5}
                      >
                        {day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Footer: Jump to Today */}
            <TouchableOpacity
              onPress={() => {
                const now = new Date();
                onDateChange(now);
                setIsOpen(false);
              }}
              style={[
                styles.footerButton,
                { backgroundColor: colors.surfaceSecondary }
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('calendar.go_to_today', 'Select Today')}
            >
              <Text style={[styles.todayButtonText, { color: colors.text }]}>
                {t('header.today')}
              </Text>
            </TouchableOpacity>

          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // --- Botón Flotante ---
  floatingContainer: {
    position: 'absolute',
    right: 0,
    zIndex: 100,
  },
  pillButton: {
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pillContent: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 4,
    minWidth: 44, // Touch target mínimo
  },

  // --- Modal Overlay ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 380, 
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10,
  },

  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  monthTitle: {
    fontSize: 20,
    textTransform: 'capitalize',
    fontFamily: 'Tinos-Bold',
  },
  yearSubtitle: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Tinos-Bold',
  },
  arrowBtn: {
    padding: 10, // Touch target más grande
    borderRadius: 12,
    backgroundColor: 'rgba(125,125,125,0.1)',
  },

  // --- Grid ---
  weekRow: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  weekdayText: {
    fontSize: 13,
    width: '14.28%', // Distribución exacta
    fontFamily: 'FiraSans-Bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  dayCell: {
    width: '14.28%', // 100% / 7
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayContent: {
    width: '85%', // Relativo al contenedor padre
    height: '85%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999, // Círculo perfecto
  },
  dayText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'FiraSans-Regular',
  },

  // --- Footer ---
  footerButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    borderWidth: 0.5,
    width: '100%',
  },
  todayButtonText: {
    fontFamily: 'FiraSans-Bold',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});