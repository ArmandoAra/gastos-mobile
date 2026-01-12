import { renderHook, act } from '@testing-library/react-native';
import useDateStore from '../useDateStore';

describe('useDateStore', () => {
  // FECHA FIJA DE REFERENCIA: 1 de Enero de 2024, 12:00 PM
  const FIXED_DATE = new Date('2024-01-01T12:00:00Z');

  beforeEach(() => {
    // 1. Congelamos el tiempo antes de cada test
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);

    // 2. Reseteamos el store a un estado limpio
    // Como Zustand es global, necesitamos resetearlo manualmente
    const { result } = renderHook(() => useDateStore());
    act(() => {
      // Usamos las acciones del store para limpiar
      result.current.resetDateFilters();
      // Forzamos la fecha al valor fijo
      result.current.setLocalSelectedDay(FIXED_DATE);
      result.current.setSelectedYear(2024);
      result.current.setSelectedMonth(1);
      result.current.setSelectedDay(1);
    });
  });

  afterEach(() => {
    // Devolvemos el reloj a la normalidad
    jest.useRealTimers();
  });

  it('debe inicializarse con valores por defecto (aunque depende del momento de carga)', () => {
    const { result } = renderHook(() => useDateStore());

      // Verificamos que isDateSelectorOpen empiece cerrado
      expect(result.current.isDateSelectorOpen).toBe(false);
    });

  it('debe actualizar el AÑO seleccionado', () => {
    const { result } = renderHook(() => useDateStore());

      act(() => {
        result.current.setSelectedYear(2030);
      });

      expect(result.current.selectedYear).toBe(2030);
    });

  it('debe actualizar el DÍA seleccionado', () => {
    const { result } = renderHook(() => useDateStore());

      act(() => {
        result.current.setSelectedDay(15);
    });

      expect(result.current.selectedDay).toBe(15);
    });

  it('debe actualizar el MES seleccionado si es válido', () => {
    const { result } = renderHook(() => useDateStore());

      act(() => {
        result.current.setSelectedMonth(5); // Mayo
      });

      expect(result.current.selectedMonth).toBe(5);
    });

  it('NO debe actualizar el MES si está fuera de rango (Validación)', () => {
    const { result } = renderHook(() => useDateStore());

      // Estado inicial (configurado en beforeEach es 1)
      expect(result.current.selectedMonth).toBe(1);

      act(() => {
        result.current.setSelectedMonth(13); // Mes inválido
    });

      // No debe haber cambiado
      expect(result.current.selectedMonth).toBe(1);

      act(() => {
        result.current.setSelectedMonth(-1); // Mes inválido
      });

      // Sigue sin cambiar
      expect(result.current.selectedMonth).toBe(1);
    });

  it('debe abrir y cerrar el selector de fechas', () => {
    const { result } = renderHook(() => useDateStore());

      // Abrir
      act(() => {
        result.current.setIsDateSelectorOpen(true);
      });
      expect(result.current.isDateSelectorOpen).toBe(true);

      // Cerrar vía resetDateFilters (tu función de utilidad)
      act(() => {
        result.current.resetDateFilters();
      });
      expect(result.current.isDateSelectorOpen).toBe(false);
    });

  it('debe actualizar localSelectedDay con una fecha completa', () => {
    const { result } = renderHook(() => useDateStore());
    const newDate = new Date('2025-12-25T10:00:00Z');

      act(() => {
        result.current.setLocalSelectedDay(newDate);
      });

      expect(result.current.localSelectedDay).toEqual(newDate);
    });

  it('debe resetear a la fecha actual ("setCurrentDate")', () => {
    const { result } = renderHook(() => useDateStore());

      // 1. Primero cambiamos la fecha a algo antiguo (ej. año 2000)
      act(() => {
        result.current.setLocalSelectedDay(new Date('2000-01-01T00:00:00Z'));
      });
      expect(result.current.localSelectedDay.getUTCFullYear()).toBe(2000);

      // 2. Ejecutamos setCurrentDate
      // Nota: Como usamos jest.setSystemTime(FIXED_DATE) en beforeEach,
      // "hoy" será 2024-01-01.
      act(() => {
        result.current.setCurrentDate();
      });

      // 3. Verificamos que volvió a la fecha "actual" (la mockeada)
      expect(result.current.localSelectedDay).toEqual(FIXED_DATE);
    });
});