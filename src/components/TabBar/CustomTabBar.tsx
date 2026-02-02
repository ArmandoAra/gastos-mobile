import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
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
  BudgetIconPainted
} from '../../constants/icons';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTabBarVisibility } from '../../context/TabBarVisibilityContext';


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
    case 'Settings':
      return SettingsIcon;
    default:
      return null;
  }
  }
};

export const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation, colors }) => {
  const insets = useSafeAreaInsets();
  const IconsOptions = useSettingsStore((state) => state.iconsOptions);

  const { translateY } = useTabBarVisibility();

  return (
    <Animated.View
      style={[styles.tabBarContainer,
      { transform: [{ translateY }] }
      ]}>
      <View style={[
        styles.tabBar,
        {
          backgroundColor: colors.surfaceSecondary,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingHorizontal: 20,
          width: '90%',
          marginBottom: 20,
          shadowColor: colors.shadow,
          borderRadius: 50,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 10,
        }
      ]}>
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

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const scaleValue = useRef(new Animated.Value(1)).current;
          
          useEffect(() => {
            Animated.spring(scaleValue, {
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
              onLongPress={onLongPress}
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
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
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
                </Animated.View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
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
    // paddingTop: 10,

    justifyContent: 'space-around',
    alignItems: 'center',
    // width: width * 0.92,
    height: 60,
    // borderRadius: 35,
    paddingHorizontal: 10,
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