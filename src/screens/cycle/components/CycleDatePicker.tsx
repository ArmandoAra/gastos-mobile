import React, { useMemo, useState, useCallback } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Text, ThemeProvider, useTheme } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';

// Importa tus colores y store
import { darkTheme, lightTheme } from '../../../theme/colors';
import { useSettingsStore } from '../../../stores/settingsStore';

export function CycleDatePicker() {
  // 1. Obtenemos el tema global de Paper (fuentes, animaciones, etc.)
  const paperTheme = useTheme();
  
  // 2. Obtenemos la preferencia del usuario desde tu store
  const themeMode = useSettingsStore((s) => s.theme);
  const isDark = themeMode === 'dark';
  const colors = useMemo(() => isDark ? darkTheme : lightTheme, [isDark]);

  // 3. Estados para el modal y las fechas
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<{ startDate: Date | undefined; endDate: Date | undefined }>({
    startDate: undefined,
    endDate: undefined,
  });

  // 4. Callback cuando el usuario confirma las fechas
  const onConfirmRange = useCallback(
    ({ startDate, endDate }: { startDate: Date | undefined; endDate: Date | undefined }) => {
      setOpen(false);
      if (startDate && endDate) {
        setRange({ startDate, endDate });
        // Aquí puedes despachar la acción a tu store para filtrar los datos globales
        // ej: useCycleStore.getState().setCustomRange(startDate, endDate);
      }
    },
    []
  );

  // 5. Tema inyectado exclusivamente para el calendario
const datePickerTheme = useMemo(() => ({
    ...paperTheme, 
    roundness: 12, 
    colors: {
      ...paperTheme.colors,
      primary: colors.accent, 
      surface: isDark ? colors.surfaceSecondary : '#ffffff', 
      onSurface: colors.text, 
      primaryContainer: isDark ? colors.surface : '#E0E7FF', 
      onPrimaryContainer: colors.text, 

      // ─── AQUI ESTÁ EL COLOR DE "Desde" y "Hasta" ───
      onSurfaceVariant: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', 
    },
    fonts: {
      ...paperTheme.fonts,

      // ─── AQUI ESTÁ LA FUENTE DE "Desde" y "Hasta" ───
      labelSmall: {
        ...paperTheme.fonts.labelSmall,
        fontFamily: 'Tinos-Regular',
        fontSize: 14, // Ajusta el tamaño como prefieras
        letterSpacing: 0.5,
      },

      titleSmall: {
        ...paperTheme.fonts.titleSmall,
        fontFamily: 'FiraSans-Regular',
        fontSize: 16, 
      },
      labelMedium: {
        ...paperTheme.fonts.labelMedium,
        fontFamily: 'Tinos-Regular',
        fontSize: 18, // Este en realidad afecta al título principal superior
      },
      labelLarge: {
        ...paperTheme.fonts.labelLarge,
        fontFamily: 'FiraSans-Regular',
        fontSize: 14, 
        backgroundColor: colors.text, 
        borderRadius: 25, 
        paddingHorizontal: 12,
        paddingVertical: 6,
        color: isDark ? colors.surface : '#ffffff', 
      },
      bodySmall: {
        ...paperTheme.fonts.bodySmall,
        fontFamily: 'FiraSans-Bold',
        fontSize: 12, 
      },
      titleLarge: {
        ...paperTheme.fonts.titleLarge,
        fontFamily: 'FiraSans-Regular',
        fontSize: 24, 
      },
    }
  }), [paperTheme, colors, isDark]);

  return (
    <ThemeProvider theme={datePickerTheme}>
      <View style={styles.container}>
        {/* Botón para abrir el selector */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.surfaceSecondary }]} 
          onPress={() => setOpen(true)}
        >
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>
            {range.startDate && range.endDate 
              ? `${range.startDate.toLocaleDateString()} - ${range.endDate.toLocaleDateString()}` 
              : 'Seleccionar ciclo'}
          </Text>
        </TouchableOpacity>

        {/* Modal de React Native Paper Dates */}
        <DatePickerModal
          locale="es"
          mode="range"
          visible={open}
          onDismiss={() => setOpen(false)}
          startDate={range.startDate}
          endDate={range.endDate}
          onConfirm={onConfirmRange}
          
          // Textos personalizados
          saveLabel="Confirmar"
          label="Seleccionar Periodo"
          startLabel="Desde"
          endLabel="Hasta"
          animationType="fade"
          uppercase={false}
        />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.2)',
  }
});