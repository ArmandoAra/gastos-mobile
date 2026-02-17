import React, { createContext, useContext, useCallback } from 'react';
import { useSharedValue, withTiming, SharedValue, useDerivedValue } from 'react-native-reanimated';

interface TabBarVisibilityContextType {
  translateY: SharedValue<number>;
  setTabBarVisible: (visible: boolean) => void;
}

const TabBarVisibilityContext = createContext<TabBarVisibilityContextType | undefined>(undefined);

export const TabBarVisibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // SharedValue vive en el UI Thread
  const translateY = useSharedValue(0);

  // Función para controlar la visibilidad (puede ser llamada desde JS o UI Thread)
  const setTabBarVisible = useCallback((visible: boolean) => {
    'worklet'; // Esto permite que sea llamada desde el hilo de UI
    const target = visible ? 0 : 150; // 150 u otra altura de tu TabBar
    translateY.value = withTiming(target, { duration: 250 });
  }, []);

  return (
    <TabBarVisibilityContext.Provider value={{ translateY, setTabBarVisible }}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
};

export const useTabBarVisibility = () => {
  const context = useContext(TabBarVisibilityContext);
  if (!context) throw new Error('useTabBarVisibility must be used within a TabBarVisibilityProvider');
  return context;
};