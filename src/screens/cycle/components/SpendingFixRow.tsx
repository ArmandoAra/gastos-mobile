import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../../theme/colors';
import { globalStyles } from '../../../theme/global.styles';
import { useAuthStore } from '../../../stores/authStore';

// Definimos la estructura de tus datos
export type GastoFijo = {
  icon: string;
  label: string;
  spent: number;
  paid: boolean;
};

type Props = {
  item: GastoFijo;
  delay: number;
  onToggle: (label: string) => void; // Emitimos el evento al padre
};

export function FixedExpenseRow({ item, delay, onToggle }: Props) {
    const currencySymbol = useAuthStore((s) => s.currencySymbol);
  const theme = useSettingsStore((s) => s.theme);
    const colors = useMemo(() => theme === 'dark' ? darkTheme : lightTheme, [theme]);
  
  const handlePress = () => {
    // Añadimos feedback háptico (vibración ligera) para mejor UX
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle(item.label);
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.row}>
      {/* Icono */}
      <View style={styles.iconBox}> {/* Definir el color por la propiedad del icono que sera buscado en la base de los iconos */}
        <MaterialCommunityIcons name={item.icon as any} size={18} color={colors.text} />
      </View>

      {/* Información central (Nombre y Estado) */}
      <View style={styles.infoContainer}>
        <Text style={[globalStyles.bodyTextSm, { color: colors.text, fontWeight: 'bold' }]}>{item.label}</Text>
        <Text style={[styles.statusText, { color: item.paid ? colors.success : colors.textSecondary }]}>
          {item.paid ? 'Pagado' : 'Pendiente'}
        </Text>
      </View>

      {/* Monto y Checkbox */}
      <View style={styles.rightAction}>
        <Text style={[styles.amount, { color: item.paid ? colors.textSecondary : colors.text }]}>
          {currencySymbol}{item.spent}
        </Text>
        
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={styles.checkboxButton}>
          <MaterialCommunityIcons 
            name={item.paid ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
            size={24} 
            color={item.paid ? colors.success : colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    paddingVertical: 10, 
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)', // Opcional: línea separadora
  },
  iconBox: { 
    width: 38, 
    height: 38, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  infoContainer: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  name: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '600',
    marginBottom: 2 
  },
  statusText: { 
    fontSize: 12,
    fontWeight: '500'
  },
  rightAction: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  amount: { 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  checkboxButton: {
    padding: 2, // Área táctil extra
  }
});