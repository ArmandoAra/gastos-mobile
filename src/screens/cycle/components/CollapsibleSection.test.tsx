import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CollapsibleSection } from './CollapsibleSection';
import { Text } from 'react-native';

describe('Componente CollapsibleSection', () => {
  it('debe alternar la visibilidad del contenido al presionar el encabezado', () => {
    const title = "Sección de Prueba";
    const content = "Contenido Ocultable";
    
    const { getByText, queryByText } = render(
      <CollapsibleSection title={title}>
        <Text>{content}</Text>
      </CollapsibleSection>
    );

    // Por defecto está expandido
    expect(getByText(content)).toBeTruthy();

    // Presionar para colapsar
    fireEvent.press(getByText(title));
    expect(queryByText(content)).toBeNull();

    // Presionar para expandir de nuevo
    fireEvent.press(getByText(title));
    expect(getByText(content)).toBeTruthy();
  });

  it('debe iniciar colapsado si initialExpanded es false', () => {
    const { queryByText } = render(
      <CollapsibleSection title="Titulo" initialExpanded={false}>
        <Text>Contenido</Text>
      </CollapsibleSection>
    );

    expect(queryByText('Contenido')).toBeNull();
  });
});
