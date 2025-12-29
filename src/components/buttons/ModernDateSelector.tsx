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

const { width } = Dimensions.get('window');

// --- Constantes ---
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const COLORS = {
  glassBg: 'rgba(30, 41, 59, 0.85)', 
  modalBg: '#DDF4E7',
  border: 'rgba(255, 255, 255, 0.1)',
  text: '#061E29',
  textMuted: '#f97316',
  activeGradient: ['#f97316', '#dc2626'] as const, // Naranja a Rojo
  todayHighlight: 'rgba(249, 115, 22, 0.2)',
};

interface ModernCalendarSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function ModernCalendarSelector({ 
  selectedDate, 
  onDateChange 
}: ModernCalendarSelectorProps) {
  
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

  // Formato para el botón flotante (ej: "Oct 24, 2024")
  const formatButtonDate = () => {
    return selectedDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
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
             <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.glassBg }]} />
          )}

          <View style={styles.pillContent}>
            <Ionicons name="calendar-clear-outline" size={18} color={COLORS.textMuted} />
            {/* <Text style={styles.pillText}>{formatButtonDate()}</Text> */}
            <MaterialIcons name="keyboard-arrow-down" size={20} color={COLORS.activeGradient[0]} />
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
                style={styles.calendarCard}
            >
                {/* Header: Navegación de Mes */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowBtn}>
                        <MaterialIcons name="chevron-left" size={28} color={COLORS.text} />
                    </TouchableOpacity>
                    
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.monthTitle}>
                            {MONTHS[viewDate.getMonth()]}
                        </Text>
                        <Text style={styles.yearSubtitle}>
                            {viewDate.getFullYear()}
                        </Text>
                    </View>
                    
                    <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowBtn}>
                        <MaterialIcons name="chevron-right" size={28} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {/* Días de la semana */}
                <View style={styles.weekRow}>
                    {WEEKDAYS.map((day, index) => (
                        <Text key={index} style={styles.weekdayText}>{day}</Text>
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
                                    <LinearGradient
                                        colors={COLORS.activeGradient}
                                        style={styles.selectedDayBg}
                                    >
                                        <Text style={styles.selectedDayText}>{day}</Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={[
                                        styles.dayContent, 
                                        today && styles.todayBorder
                                    ]}>
                                        <Text style={[
                                            styles.dayText,
                                            today && { color: COLORS.activeGradient[0], fontWeight: 'bold' }
                                        ]}>{day}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Footer: Jump to Today */}
                <View style={styles.footer}>
                    <TouchableOpacity 
                        onPress={() => {
                            const now = new Date();
                            onDateChange(now);
                            setIsOpen(false);
                        }}
                        style={styles.todayButton}
                    >
                        <Text style={styles.todayButtonText}>Go to Today</Text>
                    </TouchableOpacity>
                </View>

            </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // --- Botón Flotante ---
  floatingContainer: {
    position: 'relative',
    width: 'auto',
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 8,
  },
  pillButton: {
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillContent: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 8,
  },
  pillText: {
    color: COLORS.text,
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
    height: 500,
    backgroundColor: COLORS.modalBg,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.text,
  },
  yearSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
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
    color: COLORS.textMuted,
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
    borderWidth: 1,
    borderColor: COLORS.activeGradient[0],
    backgroundColor: COLORS.todayHighlight,
  },
  selectedDayBg: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12, // Un poco más cuadrado para el seleccionado
    shadowColor: COLORS.activeGradient[0],
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  dayText: {
    color: COLORS.text,
    fontSize: 15,
  },
  selectedDayText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // --- Footer ---
  footer: {
    marginTop: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 15,
  },
  todayButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  todayButtonText: {
    color: COLORS.activeGradient[1], // Rojo/Naranja
    fontWeight: '700',
    fontSize: 14,
  },
});