import React, { useMemo, useState, useCallback } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Text, ThemeProvider, useTheme } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { startOfDay, differenceInDays, eachDayOfInterval } from 'date-fns';

import { darkTheme, lightTheme } from '../../../theme/colors';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useCycleStore } from '../../../stores/useCycleStore';
import { selectActiveCycle } from '../selectors/cycleSelectors';
import { t } from 'i18next';
import { useAuthStore } from '../../../stores/authStore';

const MIN_CYCLE_DAYS = 3;

export function CycleDatePicker() {
  const paperTheme = useTheme();
  const themeMode = useSettingsStore((s) => s.theme);
  const language = useSettingsStore((s) => s.language);
  const isDark = themeMode === 'dark';
  const colors = useMemo(() => isDark ? darkTheme : lightTheme, [isDark]);

  const [open, setOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedCycleAccount = useCycleStore((s) => s.selectedCycleAccount);
  const startNewCycle = useCycleStore((s) => s.startNewCycle);
  const allCycles = useCycleStore((s) => s.cycles);
  const userId = useAuthStore((s) => s.user?.id);

  const activeCycle = useCycleStore((state) => selectActiveCycle(selectedCycleAccount)(state));

  const currentStartDate = activeCycle?.startDate ? new Date(activeCycle.startDate) : undefined;
  const currentEndDate = activeCycle?.endDate ? new Date(activeCycle.endDate) : undefined;


  const today = startOfDay(new Date());

  const disabledDates = useMemo(() => {
    const closedCycles = allCycles.filter(
      (c) => c.accountId === selectedCycleAccount && c.status === 'closed'
    );
    const dates: Date[] = [];
    for (const cycle of closedCycles) {
      const start = startOfDay(new Date(cycle.startDate));
      const end = startOfDay(new Date(cycle.endDate));
      try {
        eachDayOfInterval({ start, end }).forEach((d) => dates.push(d));
      } catch {
        // eachDayOfInterval lanza si start > end — ignoramos ciclos corruptos
      }
    }
    return dates;
  }, [allCycles, selectedCycleAccount]);

  // ── RANGO VÁLIDO PARA EL PICKER ──────────────────────────────────────────
  // startDate = hoy → bloquea fechas pasadas.
  // disabledDates → días de ciclos cerrados, pintados en gris en el calendario.
  const validRange = useMemo(() => ({
    startDate: today,
    disabledDates,
  }), [today.toDateString(), disabledDates]);


  // ── CONFIRMACIÓN ─────────────────────────────────────────────────────────
  const onConfirmRange = useCallback(
    ({ startDate, endDate }: { startDate: Date | undefined; endDate: Date | undefined }) => {
      setValidationError(null);

      if (!startDate || !endDate || !selectedCycleAccount) {
        setOpen(false);
        return;
      }

      const days = differenceInDays(endDate, startDate) + 1;

      // Validar mínimo de días (sin máximo)
      if (days < MIN_CYCLE_DAYS) {
        setValidationError(
          t('cycle_screen.min_cycle_error', `El ciclo debe tener al menos ${MIN_CYCLE_DAYS} días`)
        );
        // Dejamos el modal abierto para que el usuario corrija
        return;
      }

      // Validar que ningún día del rango seleccionado coincida con un ciclo cerrado
      const selectedDays = eachDayOfInterval({ start: startOfDay(startDate), end: startOfDay(endDate) });
      const overlaps = selectedDays.some((sd) =>
        disabledDates.some((dd) => dd.getTime() === sd.getTime())
      );
      if (overlaps) {
        setValidationError(
          t('cycle_screen.overlap_error', 'El rango seleccionado incluye días de un ciclo anterior')
        );
        return;
      }

      setOpen(false);
      if (!userId) return;
      startNewCycle({
        baseBudget: 0,
        startDate: startDate,
        endDate: endDate,
        cutoffDate: endDate,
        accountId: selectedCycleAccount,
        userId: userId,
      });
    },
    [selectedCycleAccount, startNewCycle, disabledDates, userId]
  );

  const onDismiss = useCallback(() => {
    setOpen(false);
    setValidationError(null);
  }, []);

  // ── TEMA DEL PICKER ──────────────────────────────────────────────────────
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
      labelSmall: { ...paperTheme.fonts.labelSmall, fontFamily: 'Tinos-Regular', fontSize: 14, letterSpacing: 0.5 },
      titleSmall: { ...paperTheme.fonts.titleSmall, fontFamily: 'FiraSans-Regular', fontSize: 16 },
      labelMedium: { ...paperTheme.fonts.labelMedium, fontFamily: 'Tinos-Regular', fontSize: 18 },
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
      bodySmall: { ...paperTheme.fonts.bodySmall, fontFamily: 'FiraSans-Bold', fontSize: 16 },
      titleLarge: { ...paperTheme.fonts.titleLarge, fontFamily: 'FiraSans-Regular', fontSize: 24 },
    },
  }), [paperTheme, colors]);

  return (
    <ThemeProvider theme={datePickerTheme}>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.surfaceSecondary }]}
          onPress={() => setOpen(true)}
        >
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>
            {currentStartDate && currentEndDate
              ? `${currentStartDate.toLocaleDateString()} - ${currentEndDate.toLocaleDateString()}`
              : t('cycle_screen.select_cycle', 'Seleccionar ciclo')
            }
          </Text>
        </TouchableOpacity>

        {/* Error de validación inline */}
        {validationError && (
          <Text style={[styles.errorText, { color: colors.expense }]}>
            {validationError}
          </Text>
        )}

        <DatePickerModal
          locale={language}
          mode="range"
          visible={open}
          onDismiss={onDismiss}
          startDate={currentStartDate}
          endDate={currentEndDate}
          onConfirm={onConfirmRange}
          // Rango válido: hoy → hoy + 31 días (bloquea pasado y > 31 días)
          validRange={validRange}
          saveLabel={t('common.confirm', 'Confirmar')}
          label={t('cycle_screen.select_period', 'Seleccionar Periodo')}
          startLabel={t('common.from', 'Desde')}
          endLabel={t('common.to', 'Hasta')}
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
    alignItems: 'flex-start',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.2)',
  },
  errorText: {
    fontSize: 11,
    fontFamily: 'FiraSans-Regular',
    marginTop: 6,
    paddingHorizontal: 4,
  },
});