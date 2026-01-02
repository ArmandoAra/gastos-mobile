import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { format, isSameDay, set } from 'date-fns';
import { es } from 'date-fns/locale'; // Opcional: si quieres español
import ModernDateSelector from '../buttons/ModernDateSelector';
import useDateStore from '../../stores/useDateStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { ThemeColors } from '../../types/navigation';
import {darkTheme, lightTheme} from '../../theme/colors';

// Tipos
type ViewMode = 'day' | 'month' | 'year';

interface TransactionsHeaderProps {
  viewMode: ViewMode;
}

const COLORS = {
  accentGradient: ['#f97316', '#dc2626'] as [string, string], // Naranja a Rojo (Tu marca)
  blueGradient: ['#3b82f6', '#2563eb'] as [string, string], // Azul para contraste
};

export default function TransactionsHeader({ 
  viewMode 
}: TransactionsHeaderProps) {
  const { theme } = useSettingsStore();
    const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;
    const {localSelectedDay,setLocalSelectedDay} = useDateStore();

  // --- Lógica de Formato de Texto ---
  const dateText = useMemo(() => {
    switch (viewMode) {
      case 'day':
        return format(localSelectedDay, 'EEEE, d MMMM yyyy'); // Ej: Monday, 25 October 2023
      case 'month':
        return format(localSelectedDay, 'MMMM yyyy'); // Ej: October 2023
      case 'year':
        return format(localSelectedDay, 'yyyy'); // Ej: 2023
      default:
        return '';
    }
  }, [localSelectedDay, viewMode]);

  const subTitle = useMemo(() => {
    const today = new Date();
    if (viewMode === 'day' && isSameDay(localSelectedDay, today)) return 'Today';
    
    switch (viewMode) {
      case 'day': return 'Daily Overview';
      case 'month': return 'Monthly Overview';
      case 'year': return 'Annual Overview';
      default: return 'Overview';
    }
  }, [localSelectedDay, viewMode]);

  return (
    <Animated.View 
      entering={FadeInDown.duration(600).springify()} 
      style={styles.container}
    >
      {/* Tarjeta de Fecha Principal */}
      <View style={[styles.dateCard,{ 
        backgroundColor: colors.surface, 
        shadowColor: colors.shadow ,
        borderColor: colors.border
        }]}>
        {/* Fondo con brillo sutil */}
        <View style={styles.glowEffect} />
        
        <View style={styles.dateContent}>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                    <Text style={[styles.overviewLabel, {color: colors.text}]}>{subTitle}</Text>
                <Text style={[styles.dateDisplay, {color: colors.text}]}>{dateText}</Text>
                </View>
                
                <ModernDateSelector
                                selectedDate={localSelectedDay}
                                onDateChange={setLocalSelectedDay}
                            />
            </View>
        </View>
      </View>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 4, // Pequeño padding para alinear con el resto si es necesario
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    // Sombra sutil
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  
  // Tarjeta de Fecha
  dateCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  glowEffect: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.accentGradient[0], // Naranja
    opacity: 0.65,
    transform: [{ scale: 1.5 }],
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  dateIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: COLORS.accentGradient[1], // Rojo
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  overviewLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  dateDisplay: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
});