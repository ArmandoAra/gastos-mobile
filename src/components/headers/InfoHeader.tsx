import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform, AccessibilityInfo } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { format, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';
import ModernDateSelector from '../buttons/ModernDateSelector';
import useDateStore from '../../stores/useDateStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { ThemeColors } from '../../types/navigation';
import { darkTheme, lightTheme } from '../../theme/colors';
import { ViewMode, ViewPeriod } from '../../interfaces/date.interface';
import { useTranslation } from 'react-i18next';
import DataManagementSection from '../../screens/settings/components/DataManagementSection';

export interface InfoHeaderProps {
  viewMode: ViewMode | ViewPeriod;
}

export default function InfoHeader({ viewMode }: InfoHeaderProps) {
  const { theme, language } = useSettingsStore();
  const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;
  const { localSelectedDay, setLocalSelectedDay } = useDateStore();
  const { t } = useTranslation();

  // --- Lógica de Formato de Texto ---
  const dateText = useMemo(() => {
    const options = {
      locale: language === 'es' ? es : language === 'en' ? enUS : ptBR,
      weekStartsOn: 1 as const
    };

    switch (viewMode) {
      case 'day':
        return format(localSelectedDay, "EEEE, d 'de' MMMM yyyy", options);
      case 'week':
        const start = startOfWeek(localSelectedDay, options);
        const end = endOfWeek(localSelectedDay, options);
        const startFormat = format(start, 'd MMM', options);
        const endFormat = format(end, 'd MMM yyyy', options);
        return `${startFormat} - ${endFormat}`;
      case 'month':
        return format(localSelectedDay, 'MMMM yyyy', options);
      case 'year':
        return format(localSelectedDay, 'yyyy', options);
      default:
        return '';
    }
  }, [localSelectedDay, viewMode, language]);

  const subTitle = useMemo(() => {
    const today = new Date();
    // Clave de traducción basada en el modo
    if (viewMode === 'day' && isSameDay(localSelectedDay, today)) return 'header.today';
    
    switch (viewMode) {
      case 'day': return 'header.dailyoverview';
      case 'month': return 'header.monthlyoverview';
      case 'year': return 'header.annualoverview';
      default: return 'header.overview';
    }
  }, [localSelectedDay, viewMode]);

  const translatedSubtitle = t(subTitle);

  return (
    <Animated.View 
      entering={FadeInDown.duration(600).springify()} 
      style={styles.container}
    >
      {/* Tarjeta de Fecha Principal */}
      <View style={[styles.dateCard, { 
        backgroundColor: colors.surface, 
        shadowColor: colors.shadow,
        borderColor: colors.border
      }]}>
        
        {/* Fondo decorativo ignorado por accesibilidad */}
        <View
          style={[styles.glowEffect, { backgroundColor: colors.accent }]}
          importantForAccessibility="no-hide-descendants"
        />

        <View style={styles.dateContentRow}>
          {/* Columna de Texto (Flexible) */}
          <View
            style={styles.textColumn}
            accessible={true}
            accessibilityRole="header"
            accessibilityLabel={`${translatedSubtitle}, ${dateText}`}
          >
            <Text
              style={[styles.overviewLabel, { color: colors.text }]}
              maxFontSizeMultiplier={1.5}
            >
              {viewMode === 'day' && isSameDay(localSelectedDay, new Date()) ? `${translatedSubtitle} - ${dateText.split(',')[0]}` : translatedSubtitle}
            </Text>
            <Text
              style={[styles.dateDisplay, { color: colors.text }]}
              maxFontSizeMultiplier={1.3} // Limitamos ligeramente para no romper la tarjeta
            >
              {viewMode === 'day' && isSameDay(localSelectedDay, new Date()) ? dateText.split(',').slice(1).join(',') : dateText}
              {/* {dateText} */}
            </Text>
          </View>

          {/* Columna del Selector (Fija/Auto) */}
                <ModernDateSelector
            selectedDate={localSelectedDay}
            onDateChange={(date) => {
              setLocalSelectedDay(date);
              if (Platform.OS !== 'web') {
                AccessibilityInfo.announceForAccessibility(`Date changed to ${format(date, 'P')}`);
              }
            }}
          />
            </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  // Tarjeta
  dateCard: {
    borderRadius: 20,
    padding: 20, // Padding interno generoso
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    // Sombras
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  // Efecto visual
  glowEffect: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.15, // Opacidad reducida para no interferir con el texto
    transform: [{ scale: 1.2 }],
  },
  // Layout interno
  dateContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  // Columna de texto
  textColumn: {
    flex: 1, // CLAVE: Permite que el texto ocupe el espacio pero respete al botón
    paddingRight: 8, // Espacio de seguridad contra el botón
    justifyContent: 'center',
  },

  // Textos
  overviewLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontFamily: 'FiraSans-Bold',
    letterSpacing: 1,
    marginBottom: 4,
    opacity: 0.8,
  },
  dateDisplay: {
    fontSize: 20, // Ligeramente más grande
    fontFamily: 'Tinos-Bold',
    textTransform: 'capitalize',
    lineHeight: 26, // Altura de línea para cuando hace wrap
    flexWrap: 'wrap',
  },
});