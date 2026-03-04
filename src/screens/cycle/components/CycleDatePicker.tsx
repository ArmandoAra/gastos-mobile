import React, { useMemo, useState, useCallback } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Text, ThemeProvider, useTheme } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';

// Importa tus colores y store
import { darkTheme, lightTheme } from '../../../theme/colors';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useCycleStore } from '../../../stores/useCycleStore';
import { selectActiveCycle } from '../selectors/cycleSelectors';

export function CycleDatePicker() {
  const paperTheme = useTheme();

  const themeMode = useSettingsStore((s) => s.theme);
  const language = useSettingsStore((s) => s.language);
  const isDark = themeMode === 'dark';
  const colors = useMemo(() => isDark ? darkTheme : lightTheme, [isDark]);

  // SOLO necesitamos estado local para abrir/cerrar el modal
  const [open, setOpen] = useState(false);

  // 1. Obtenemos la cuenta seleccionada y las acciones
  const selectedCycleAccount = useCycleStore((s) => s.selectedCycleAccount);
  const startNewCycle = useCycleStore((s) => s.startNewCycle);

  //  Obtenemos el ciclo activo directamente del store
  const activeCycle = useCycleStore((state) => selectActiveCycle(selectedCycleAccount)(state));

  // 3. Derivamos las fechas para pasarlas al modal y mostrarlas en la UI
  const currentStartDate = activeCycle?.startDate ? new Date(activeCycle.startDate) : undefined;
  const currentEndDate = activeCycle?.endDate ? new Date(activeCycle.endDate) : undefined;

  // 4. Callback: Al confirmar, creamos el ciclo en el store.
  // Al hacer esto, "activeCycle" cambiará automáticamente y la UI se actualizará sin useEffects.
  const onConfirmRange = useCallback(
    ({ startDate, endDate }: { startDate: Date | undefined; endDate: Date | undefined }) => {
      setOpen(false);

      if (startDate && endDate && selectedCycleAccount) {
        const startCycleData = {
          startDate,
          endDate,
          cutoffDate: endDate, // O lógica ajustada (ej. subDays(endDate, 5))
          baseBudget: 0,
          accountId: selectedCycleAccount, 
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
      onSurfaceVariant: colors.text, 
    },
    fonts: {
      ...paperTheme.fonts,
      labelSmall: {
        ...paperTheme.fonts.labelSmall,
        fontFamily: 'Tinos-Regular',
        fontSize: 14, 
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
        fontSize: 18, 
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
            {currentStartDate && currentEndDate
              ? `${currentStartDate.toLocaleDateString()} - ${currentEndDate.toLocaleDateString()}` 
              : 'Seleccionar ciclo'}
          </Text>
        </TouchableOpacity>

        {/* Modal de React Native Paper Dates */}
        <DatePickerModal
          locale={language}
          mode="range"
          visible={open}
          onDismiss={() => setOpen(false)}
          startDate={currentStartDate} // Pasamos la fecha derivada del store
          endDate={currentEndDate}     // Pasamos la fecha derivada del store
          onConfirm={onConfirmRange}

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
    alignItems: 'flex-start', // Opcional, ajústalo según el diseño original
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.2)',
  }
});