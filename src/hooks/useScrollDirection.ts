// hooks/useScrollDirection.ts
import { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useTabBarVisibility } from '../context/TabBarVisibilityContext';

export const useScrollDirection = () => {
  // Obtenemos la función del contexto (asegúrate de que el contexto use Reanimated como vimos antes)
  const { setTabBarVisible } = useTabBarVisibility();
  
  // Guardamos el último offset y el estado actual en el UI Thread
  const lastContentOffset = useSharedValue(0);
  const isTabBarVisible = useSharedValue(true);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      // Obtenemos la posición actual Y
      const currentOffsetY = event.contentOffset.y;

      // Calculamos la diferencia
      const diff = currentOffsetY - lastContentOffset.value;

      // 1. ZONA SEGURA SUPERIOR (Rebote o inicio)
      // Si estamos en el tope (0-50px), siempre mostrar
      if (currentOffsetY <= 50) {
        if (!isTabBarVisible.value) {
          isTabBarVisible.value = true;
          setTabBarVisible(true);
        }
        // Actualizamos referencia y salimos
        lastContentOffset.value = currentOffsetY;
        return;
      }

      // 2. DETECCIÓN DE DIRECCIÓN
      // Hacia ABAJO (diff > 0) y pasamos umbral de 20px
      if (diff > 20 && isTabBarVisible.value) {
        isTabBarVisible.value = false;
        setTabBarVisible(false);
      } 
      // Hacia ARRIBA (diff < 0) y pasamos umbral de 5px
      else if (diff < -5 && !isTabBarVisible.value) {
        isTabBarVisible.value = true;
        setTabBarVisible(true);
      }

      // Guardamos la posición para el siguiente frame
      lastContentOffset.value = currentOffsetY;
    },
  });

  return { onScroll };
};