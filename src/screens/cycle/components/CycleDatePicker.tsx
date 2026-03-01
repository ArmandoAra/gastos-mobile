import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Text, ThemeProvider, useTheme } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';

// Importa tus colores y store
import { darkTheme, lightTheme } from '../../../theme/colors';
import { useSettingsStore } from '../../../stores/settingsStore';
import { selectActiveCycle, useCycleStore } from '../../../stores/useCycleStore';

export function CycleDatePicker() {
  // 1. Obtenemos el tema global de Paper (fuentes, animaciones, etc.)
  const paperTheme = useTheme();
  
  // 2. Obtenemos la preferencia del usuario desde tu store
  const themeMode = useSettingsStore((s) => s.theme);
  const language = useSettingsStore((s) => s.language);
  const isDark = themeMode === 'dark';
  const colors = useMemo(() => isDark ? darkTheme : lightTheme, [isDark]);

  // 3. Estados para el modal y las fechas
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<{ startDate: Date | undefined; endDate: Date | undefined }>({
    startDate: undefined,
    endDate: undefined,
  });

  // 3. Acción para iniciar un nuevo ciclo (si es necesario)
  const selectedCycleAccount = useCycleStore((s) => s.selectedCycleAccount);
  const cycles = useCycleStore((s) => s.cycles);
  const startNewCycle = useCycleStore((s) => s.startNewCycle);

  useEffect(() => {
    console.log('Ciclo activo:', selectedCycleAccount);
    console.log('Ciclos actuales:', cycles);
  }, [cycles, selectedCycleAccount]);

  // 4. Callback cuando el usuario confirma las fechas
  const onConfirmRange = useCallback(
    ({ startDate, endDate }: { startDate: Date | undefined; endDate: Date | undefined }) => {
      setOpen(false);
      if (startDate && endDate) {
        setRange({ startDate, endDate });

        const startCycleData = {
          startDate,
          endDate,
          cutoffDate: endDate,
          baseBudget: 0, // Puedes ajustar esto según tu lógica
          accountId: selectedCycleAccount, // Asegúrate de pasar el accountId correcto
        };

        startNewCycle(startCycleData);
      }
    },
    [selectedCycleAccount, startNewCycle]
  );

const datePickerTheme = useMemo(() => ({
    ...paperTheme, 
    roundness: 12, 
    colors: {
      ...paperTheme.colors,
      primary: colors.accent, 
      surface: colors.surface, 
      onSurface: colors.text, 
      primaryContainer: colors.accent, 
      onPrimaryContainer: colors.text, 

      // ─── AQUI ESTÁ EL COLOR DE "Desde" y "Hasta" ───
      onSurfaceVariant: colors.text, 
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
        color: colors.surface, 
      },
      bodySmall: {
        ...paperTheme.fonts.bodySmall,
        fontFamily: 'FiraSans-Bold',
        fontSize: 16, 
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
          locale={language}
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