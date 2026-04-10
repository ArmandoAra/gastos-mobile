import React from 'react';
import { render } from '@testing-library/react-native';
import { PacingBar } from './PacingBar';

// Mock del store de configuración para evitar errores de contexto
jest.mock('../../../stores/settingsStore', () => ({
  useSettingsStore: jest.fn(() => 'dark'),
}));

describe('Componente PacingBar', () => {
  it('debe mostrar los porcentajes de progreso correctamente', () => {
    const { getByText } = render(<PacingBar timeProgress={0.5} spendProgress={0.25} />);
    
    expect(getByText('50%')).toBeTruthy();
    expect(getByText('25%')).toBeTruthy();
  });

  it('debe mostrar mensaje de "A ritmo" cuando el gasto es menor al tiempo', () => {
    // Tiempo 50%, Gasto 40% -> OK
    const { getByText } = render(<PacingBar timeProgress={0.5} spendProgress={0.4} />);
    // Nota: El texto exacto depende de i18next, aquí se asume la clave si no está mockeado el t()
    expect(getByText('cycle_screen.onTrack')).toBeTruthy();
  });

  it('debe mostrar mensaje de "Ritmo acelerado" cuando el gasto supera al tiempo', () => {
    // Tiempo 50%, Gasto 60% -> Peligro
    const { getByText } = render(<PacingBar timeProgress={0.5} spendProgress={0.6} />);
    expect(getByText('cycle_screen.overpacing')).toBeTruthy();
  });
});
