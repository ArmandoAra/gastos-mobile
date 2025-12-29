import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeColors, MainTabParamList } from '../../types/navigation';
// Asumo que estos son componentes funcionales (ej: SVGs)
import { AnaliticsIcon, SettingsIcon, SumarizeIcon } from '../../constants/icons';

const { width } = Dimensions.get('window');

interface CustomTabBarProps extends BottomTabBarProps {
  colors: ThemeColors;
}

// Helper para obtener el COMPONENTE del icono
const getIconComponent = (routeName: string) => {
  switch (routeName) {
    case 'Transactions':
      return SumarizeIcon;
    case 'Analytics':
      return AnaliticsIcon;
    case 'Settings':
      return SettingsIcon;
    default:
      return null;
  }
};

export const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation, colors }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.tabBarContainer}>
      <View style={[
        styles.tabBar,
        {
          backgroundColor: "#A8F1FF",
          borderWidth: 1,
          borderColor: "#211832",
          marginBottom: Platform.OS === 'ios' ? insets.bottom : 20,
          shadowColor: '#000',
        }
      ]}>
        {state.routes.map((route, index) => {
          const routeName = route.name as keyof MainTabParamList;
          const { options } = descriptors[route.key];
          
          const isFocused = state.index === index;

          // 1. Obtenemos la REFERENCIA al componente (Nótese la mayúscula inicial por convención)
          const IconComponent = getIconComponent(routeName);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const scaleValue = useRef(new Animated.Value(1)).current;
          
          useEffect(() => {
            Animated.spring(scaleValue, {
                toValue: isFocused ? 1.1 : 1,
                friction: 5,
                useNativeDriver: true,
            }).start();
          }, [isFocused]);

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                isFocused && { 
                  backgroundColor: "#C2E2FA",
                  borderColor: "#211832",
                  borderWidth: 1,
                      elevation: 5 
                    }
              ]}>
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                  {/* 2. Renderizamos el componente directamente si existe */}
                  {IconComponent && (
                    <IconComponent 
                        // Pasamos el color y tamaño como props (tus iconos deben soportar esto)
                        color={isFocused ? "#11224E" : "#043915"}
                        size={32}
                        // Si tus iconos usan 'fill' o 'stroke' en lugar de color, ajústalo aquí
                        // fill={isFocused ? colors.primary : colors.textSecondary}
                    />
                  )}
                </Animated.View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
    elevation: 0,
    zIndex: 100,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: width * 0.92,
    height: 70,
    borderRadius: 35,
    paddingHorizontal: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    height: '100%',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    backgroundColor: "#FFE6D4"
  },
});