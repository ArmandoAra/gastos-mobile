import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  AccessibilityInfo 
} from 'react-native';
import { useTranslation } from 'react-i18next';
// Asegúrate de que las rutas sean correctas según tu proyecto
import { ViewPeriod } from '../../../../interfaces/date.interface'; 
import { ThemeColors } from '../../../../types/navigation';

interface PeriodSelectorProps {
  selectedPeriod: ViewPeriod;
  onPeriodChange: (period: ViewPeriod) => void;
  colors: ThemeColors;
  periods?: ViewPeriod[];
}
const periods: ViewPeriod[] = ['day', 'week', 'month', 'year'];

export default function PeriodSelector({
  selectedPeriod,
  onPeriodChange,
  colors,
}: PeriodSelectorProps) {
  const { t } = useTranslation();

  const handlePress = (p: ViewPeriod) => {
    onPeriodChange(p);
    if (Platform.OS !== 'web') {
      const label = t(`transactions.${p}`, p);
      AccessibilityInfo.announceForAccessibility(`${label} ${t('accessibility.selected', 'selected')}`);
    }
  };

  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: colors.surface, borderColor: colors.border }
      ]}
      accessibilityRole="radiogroup"
      // Importante: Agrupa la navegación para lectores de pantalla
      importantForAccessibility="yes" 
    >
      <View style={styles.content}>
        {periods.map((p) => {
          const isSelected = selectedPeriod === p;
          const label = t(`transactions.${p}`, p); 

          return (
            <TouchableOpacity
              key={p}
              onPress={() => handlePress(p)}
              style={[
                styles.periodBtn,
                {
                  backgroundColor: isSelected ? colors.text : colors.surface,
                  borderColor: colors.border
                }
              ]}
              // Accesibilidad
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={label}
              accessibilityHint={t('accessibility.double_tap_select', `Double tap to filter by ${label}`)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.periodText,
                  { color: isSelected ? colors.surface : colors.text },
                ]}
                // Permitimos que la fuente crezca hasta el doble, pero no infinitamente para no romper todo
                maxFontSizeMultiplier={2} 
                numberOfLines={1}
                // Eliminamos adjustsFontSizeToFit para respetar el tamaño de fuente del usuario
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 2,
    // Opcional: Borde inferior sutil
  },
  content: {
    flexDirection: 'row',
    // CRÍTICO: Permite que los botones salten a la siguiente línea si no caben
    flexWrap: 'wrap', 
    gap: 8,
    justifyContent: 'center',
  },
  periodBtn: {
    flexGrow: 1,
    minWidth: 70, 
    minHeight: 44, 
    paddingVertical: 8,
    paddingHorizontal: 12, // Un poco más de padding lateral
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  periodText: {
    fontFamily: 'FiraSans-Bold',
    fontSize: 14,
    textAlign: 'center',
    textTransform: 'capitalize'
  }
});