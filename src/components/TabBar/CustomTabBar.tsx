import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  // 1. RENOMBRAMOS la librería nativa para evitar conflictos
  Animated as RNAnimated,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeColors, MainTabParamList } from '../../types/navigation';
import {
  SettingsIcon,
  AnalyticsIcon,
  SummarizeIcon,
  BudgetIcon,
  SettingsIconPainted,
  AnalyticsIconPainted,
  SummarizeIconPainted,
  BudgetIconPainted,
  CreditCircleIconPainted,
  CreditCircleIcon
} from '../../constants/icons';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTabBarVisibility } from '../../context/TabBarVisibilityContext';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';


interface CustomTabBarProps extends BottomTabBarProps {
  colors: ThemeColors;
}

// Helper para obtener el COMPONENTE del icono
const getIconComponent = (routeName: string, iconsOptions: string) => {
  if (iconsOptions === 'painted') {
    switch (routeName) {
      case 'Transactions':
        return SummarizeIconPainted;
      case 'Analytics':
        return AnalyticsIconPainted;
      case 'Budget':
        return BudgetIconPainted;
      case 'CreditCircle':
        return CreditCircleIconPainted; 
      case 'Settings':
        return SettingsIconPainted;
      default:
        return null;
    }
  } else {
    switch (routeName) {
    case 'Transactions':
      return SummarizeIcon;
    case 'Analytics':
      return AnalyticsIcon;
    case 'Budget':
      return BudgetIcon;
      case 'CreditCircle':
        return CreditCircleIcon;
    case 'Settings':
      return SettingsIcon;
    default:
      return null;
  }
  }
};

export const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation, colors }) => {
  const theme = useSettingsStore((state) => state.theme);
  const IconsOptions = useSettingsStore((state) => state.iconsOptions);
  const insets = useSafeAreaInsets();

  // 3. Obtenemos el valor compartido
  const { translateY } = useTabBarVisibility();

  // 4. Creamos el estilo animado para ocultar/mostrar la barra
  const animatedTabBarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    // 5. Aplicamos el estilo animado al contenedor principal
    <Animated.View
      style={[
        styles.tabBarContainer,
        animatedTabBarStyle
      ]}>
      <LinearGradient
        // 1. Colores del gradiente (de arriba hacia abajo usando tu tema)
        colors={[colors.surfaceSecondary, theme === 'dark' ? colors.primary : colors.accentSecondary,]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}

        // 2. Quitamos el backgroundColor sólido para que se vea el gradiente
        style={[
          styles.tabBar,
          {
            height: insets.bottom + 60,
            paddingBottom: insets.bottom - 15,
          }
        ]}
      >
        {state.routes.map((route, index) => {
          const routeName = route.name as keyof MainTabParamList;
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const IconComponent = getIconComponent(routeName, IconsOptions);

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

          const scaleValue = useRef(new RNAnimated.Value(1)).current;
          
          useEffect(() => {
            RNAnimated.spring(scaleValue, {
              toValue: isFocused ? 1.2 : 0.8,
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
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                { backgroundColor: isFocused ? colors.text : colors.surface },
                isFocused ? [{
                  backgroundColor: IconsOptions === 'painted' ? 'transparent' : colors.text,
                  borderColor: IconsOptions === 'painted' ? 'transparent' : colors.surface,
                      elevation: 5 
                }] : [
                    {
                      borderColor: IconsOptions === 'painted' ? 'transparent' : colors.border,
                      backgroundColor: IconsOptions === 'painted' ? 'transparent' : colors.surface
                    }
                ]
              ]}>
                {/* 7. Usamos RNAnimated.View aquí dentro */}
                <RNAnimated.View style={{ transform: [{ scale: scaleValue }] }}>
                  {IconComponent && (
                    <IconComponent 
                      color={isFocused ? colors.surface : colors.text}

                      style={{
                        width: IconsOptions === 'painted' ? 50 : 32,
                        height: IconsOptions === 'painted' ? 50 : 32,
                        backgroundColor: IconsOptions === 'painted' ? 'transparent' : (isFocused ? colors.text : colors.surface),
                        borderRadius: IconsOptions === 'painted' ? 0 : 50,
                        padding: IconsOptions === 'painted' ? 0 : 4,
                      }}
                    />
                  )}
                </RNAnimated.View>
              </View>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </Animated.View>
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
    width: '95%',
    paddingHorizontal: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    borderWidth: 0.5,
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    height: '100%',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 50,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
});