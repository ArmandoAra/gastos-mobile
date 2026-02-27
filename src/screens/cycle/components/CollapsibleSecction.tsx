import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  withSpring,
  FadeInUp,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../../theme/colors';
import { globalStyles } from '../../../theme/global.styles';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  initialExpanded?: boolean;
    customStyles?: { [key: string]: string | number | boolean };
}

export function CollapsibleSection({ 
  title, 
  children, 
  initialExpanded = true ,
  customStyles,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(initialExpanded);
   const theme = useSettingsStore((s) => s.theme);
    const colors = useMemo(() => theme === 'dark' ? darkTheme : lightTheme, [theme]);

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(!expanded);
  };

  // Animación para rotar el ícono de la flecha (Chevron)
  const chevronStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: withSpring(expanded ? '180deg' : '0deg') }],
    };
  });

  return (
    <Animated.View layout={LinearTransition.springify()} style={[styles.container, customStyles]}>
      {/* HEADER: Título y Botón */}
      <TouchableOpacity 
        style={styles.header} 
        onPress={toggle} 
        activeOpacity={0.7}
      >
        <Text style={[globalStyles.headerTitleBase, { color: colors.text }]}>{title}</Text>
        <Animated.View style={chevronStyle}>
          <MaterialCommunityIcons name="chevron-down" size={24} color={colors.text} />
        </Animated.View>
      </TouchableOpacity>

      {/* BODY: Contenido desplegable */}
      {expanded && (
        <Animated.View
          entering={FadeInUp.springify().mass(0.5)}
          exiting={FadeOutUp.springify().mass(0.5)}
          style={styles.content}
        >
          {children}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 0.5,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    gap: 12, // Espacio entre las tarjetas si tu contenedor padre no lo tiene
  }
});