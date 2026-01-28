import { useRef } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useTabBarVisibility } from '../context/TabBarVisibilityContext';

export const useScrollDirection = () => {
  const { showTabBar, hideTabBar } = useTabBarVisibility();
  
  const offset = useRef(0);
  const scrollValue = useRef(0); // Acumulador para detectar intención

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const dif = currentOffset - offset.current;

    // 1. ZONA SEGURA SUPERIOR:
    // Si estamos muy cerca del topo (ej: 0 a 50px), SIEMPRE mostramos la barra.
    // Esto evita que se esconda apenas empiezas a bajar.
    if (currentOffset <= 50) {
      showTabBar();
      offset.current = currentOffset;
      return;
    }

    // 2. DETECCIÓN DE DIRECCIÓN Y UMBRAL
    if (dif < 0) {
      // --- Hacia ARRIBA ---
      // Generalmente, al subir queremos ver el menú INMEDIATAMENTE para navegar.
      // Puedes ponerle un pequeño umbral si quieres (ej: dif < -5)
      if (dif < -5) {
        showTabBar();
      }
    } else {
      // --- Hacia ABAJO ---
      // Aquí aplicamos la lógica de "esperar un poco" o "segundo toque".
      // Solo ocultamos si el desplazamiento en este evento fue significativo
      // O si la velocidad es alta.
      
      // Si el usuario baja lento (leyendo), no escondemos (dif < 10).
      // Si el usuario hace un swipe fuerte (dif > 10), escondemos.
      if (dif > 20) { 
        hideTabBar();
      }
    }

    offset.current = currentOffset;
  };

  return { onScroll };
};