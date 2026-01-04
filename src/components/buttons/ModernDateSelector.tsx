import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  Platform,
  Dimensions
} from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  ZoomIn, 
  ZoomOut 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { MONTHS, WEEKDAYS_SHORT } from '../../constants/date';
import { useSettingsStore } from '../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../theme/colors';
import { ThemeColors } from '../../types/navigation';


const { width } = Dimensions.get('window');

interface ModernCalendarSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function ModernCalendarSelector({ 
  selectedDate, 
  onDateChange 
}: ModernCalendarSelectorProps) {
  const { theme } = useSettingsStore();
  const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;
  
  const [isOpen, setIsOpen] = useState(false);
  
  // 'viewDate' controla qué mes estamos viendo en el calendario (independiente de la fecha seleccionada)
  const [viewDate, setViewDate] = useState(selectedDate);

  // Sincronizar viewDate cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setViewDate(selectedDate);
    }
  }, [isOpen, selectedDate]);

  // Cambiar mes (maneja cambio de año automático)
  const changeMonth = (increment: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + increment, 1);
    setViewDate(newDate);
  };

  const handleDaySelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onDateChange(newDate);
    setIsOpen(false);
  };

  // Generar lógica de días para el calendario
  const getDaysArray = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Domingo
    
    const days = [];
    
    // Rellenar espacios vacíos antes del primer día
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Rellenar días reales
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
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
          style={styles.pillButton}
        >
          {Platform.OS === 'ios' ? (
             <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: isOpen ? colors.surface : colors.text }]} />
          )}

          <View style={styles.pillContent}>
            <Ionicons name="calendar-clear-outline" size={18} color={colors.accent} />
            {/* <Text style={styles.pillText}>{formatButtonDate()}</Text> */}
            <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.accent} />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* --- MODAL CALENDARIO --- */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
            <TouchableOpacity 
                style={StyleSheet.absoluteFill} 
                activeOpacity={1} 
                onPress={() => setIsOpen(false)}
            >
                <Animated.View 
                    entering={FadeIn} 
                    exiting={FadeOut} 
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }} 
                />
            </TouchableOpacity>

            <Animated.View 
            entering={ZoomIn.duration(100)}
                exiting={ZoomOut.duration(200)}
            style={[styles.calendarCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
                {/* Header: Navegación de Mes */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowBtn}>
                <MaterialIcons name="chevron-left" size={28} color={colors.text} />
                    </TouchableOpacity>
                    
                    <View style={{ alignItems: 'center' }}>
                <Text style={[styles.monthTitle, { color: colors.text }]}>
                            {MONTHS[viewDate.getMonth()]}
                        </Text>
                <Text style={[styles.yearSubtitle, { color: colors.textSecondary }]}>
                            {viewDate.getFullYear()}
                        </Text>
                    </View>
                    
                    <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowBtn}>
                <MaterialIcons name="chevron-right" size={28} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Días de la semana */}
                <View style={styles.weekRow}>
              {WEEKDAYS_SHORT.map((day, index) => (
                      <Text key={index} style={[styles.weekdayText, { color: colors.text }]}>{day}</Text>
                    ))}
                </View>

                {/* Grid de Días */}
                <View style={styles.daysGrid}>
                    {getDaysArray().map((day, index) => {
                        if (day === null) {
                            return <View key={`empty-${index}`} style={styles.dayCell} />;
                        }

                        const selected = isSelected(day);
                        const today = isToday(day);

                        return (
                            <TouchableOpacity
                                key={day}
                                onPress={() => handleDaySelect(day)}
                                style={styles.dayCell}
                            >
                                {selected ? (
                              <View

                                style={[styles.selectedDayBg, { backgroundColor: colors.text }]}
                                    >
                                <Text style={[styles.selectedDayText, { color: colors.surface }]}>{day}</Text>
                              </View>
                                ) : (
                                    <View style={[
                                        styles.dayContent, 
                                  today && [styles.todayBorder, { borderColor: colors.accent }]
                                    ]}>
                                        <Text style={[
                                            styles.dayText,
                                    { color: colors.text },
                                    today && { color: colors.accent, fontWeight: 'bold' }
                                        ]}>{day}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
          </Animated.View>
          {/* Footer: Jump to Today */}
          <View style={[styles.footer, { borderColor: colors.accent, backgroundColor: colors.surface }]}>
                    <TouchableOpacity 
                        onPress={() => {
                            const now = new Date();
                            onDateChange(now);
                            setIsOpen(false);
                        }}
                        style={styles.todayButton}
                    >
              <Text style={[styles.todayButtonText, { color: colors.accent }]}>Go to Today</Text>
                    </TouchableOpacity>
          </View>
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
    width: 'auto',
    zIndex: 100,

  },
  pillButton: {
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
  },
  pillContent: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 8,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // --- Modal Overlay ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarCard: {
    width: width * 0.9,
    maxWidth: 360,
    height: 400,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  },

  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  yearSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  arrowBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },

  // --- Grid ---
  weekRow: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  weekdayText: {
    fontSize: 13,
    fontWeight: '600',
    width: 40,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%', // 100% / 7
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  dayContent: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  todayBorder: {
    borderWidth: 2,
  },
  selectedDayBg: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12, 
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  dayText: {
    fontSize: 15,
  },
  selectedDayText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // --- Footer ---
  footer: {
    height: 60,
    justifyContent: 'center',
    marginTop: 15,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 2,
  },
  todayButton: {
    paddingHorizontal: 20,
  },
  todayButtonText: {
    fontWeight: '500',
    fontSize: 16,
  },
});