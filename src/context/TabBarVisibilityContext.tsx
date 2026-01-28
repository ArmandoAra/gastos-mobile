import React, { createContext, useContext, useRef } from 'react';
import { Animated } from 'react-native';

interface TabBarVisibilityContextType {
  translateY: Animated.Value;
  showTabBar: () => void;
  hideTabBar: () => void;
}

const TabBarVisibilityContext = createContext<TabBarVisibilityContextType | undefined>(undefined);

export const TabBarVisibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializamos en 0 (visible)
  const translateY = useRef(new Animated.Value(0)).current;

  const showTabBar = () => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const hideTabBar = () => {
    Animated.timing(translateY, {
      toValue: 150, // Un valor suficiente para bajar la barra fuera de pantalla
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TabBarVisibilityContext.Provider value={{ translateY, showTabBar, hideTabBar }}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
};

export const useTabBarVisibility = () => {
  const context = useContext(TabBarVisibilityContext);
  if (!context) throw new Error('useTabBarVisibility must be used within a TabBarVisibilityProvider');
  return context;
};