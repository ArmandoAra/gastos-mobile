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
import { SettingsIcon, AnalyticsIcon, SummarizeIcon } from '../../constants/icons';
import { useSettingsStore } from '../../stores/settingsStore';

const { width } = Dimensions.get('window');

interface CustomTabBarProps extends BottomTabBarProps {
  colors: ThemeColors;
}

// Helper para obtener el COMPONENTE del icono
const getIconComponent = (routeName: string) => {
  switch (routeName) {
    case 'Transactions':
      return SummarizeIcon;
    case 'Analytics':
      return AnalyticsIcon;
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
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: Platform.OS === 'ios' ? insets.bottom : 20,
          shadowColor: colors.shadow,
        }
      ]}>
        {state.routes.map((route, index) => {
          const routeName = route.name as keyof MainTabParamList;
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
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
                  backgroundColor: colors.accent,
                  borderColor: colors.border,
                  borderWidth: 1,
                      elevation: 5 
                    }
              ]}>
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                  {IconComponent && (
                    <IconComponent 
                        color={isFocused ? "#11224E" : "#043915"}
                        size={32}
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