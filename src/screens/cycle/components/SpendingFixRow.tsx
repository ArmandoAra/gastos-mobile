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
  color: string;
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
      <View style={[styles.iconBox, { backgroundColor: item.color + '22' }]}>
        <MaterialCommunityIcons name={item.icon as any} size={18} color={item.color} />
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

// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import Animated, { FadeInDown, ZoomIn, ZoomOut } from 'react-native-reanimated';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';

// // Definición del tipo de dato según tu array
// type GastoFijoItem = {
//   icon: string;
//   label: string;
//   spent: number;
//   color: string;
//   paid: boolean;
// };

// interface FixedExpenseRowProps {
//   item: GastoFijoItem;
//   delay: number;
//   onToggle: () => void; // Función que viene del padre (Zustand o State local)
// }

// export function FixedExpenseRow({ item, delay, onToggle }: FixedExpenseRowProps) {
  
//   const handlePress = () => {
//     // Feedback táctil al usuario
//     Haptics.notificationAsync(
//       item.paid ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
//     );
//     onToggle();
//   };

//   return (
//     <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.container}>
//       <TouchableOpacity 
//         style={styles.row} 
//         activeOpacity={0.7} 
//         onPress={handlePress}
//       >
//         {/* 1. Icono Izquierdo */}
//         <View style={[styles.iconBox, { backgroundColor: item.color + '22' }]}>
//           <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
//         </View>

//         {/* 2. Información Central (Nombre y Monto) */}
//         <View style={styles.infoContainer}>
//           <Text style={styles.name}>{item.label}</Text>
//           <Text style={styles.amount}>${item.spent.toFixed(2)}</Text>
//         </View>

//         {/* 3. Estado y Checkbox (Derecha) */}
//         <View style={styles.statusContainer}>
//           <Text style={[
//             styles.statusText, 
//             { color: item.paid ? '#4ECDC4' : 'rgba(255,255,255,0.5)' }
//           ]}>
//             {item.paid ? 'Pagado' : 'Pendiente'}
//           </Text>

//           {/* Animación sutil para el icono del checkbox */}
//           <Animated.View key={item.paid ? 'checked' : 'unchecked'} entering={ZoomIn.duration(200)}>
//             <MaterialCommunityIcons 
//               name={item.paid ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
//               size={24} 
//               color={item.paid ? '#4ECDC4' : 'rgba(255,255,255,0.3)'} 
//             />
//           </Animated.View>
//         </View>

//       </TouchableOpacity>
//     </Animated.View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 8,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 12,
//     backgroundColor: 'rgba(255,255,255,0.03)', // Fondo sutil para separar items
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.05)',
//   },
//   iconBox: {
//     width: 42,
//     height: 42,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   infoContainer: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   name: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   amount: {
//     color: 'rgba(255,255,255,0.9)',
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   statusContainer: {
//     alignItems: 'flex-end',
//     gap: 4,
//   },
//   statusText: {
//     fontSize: 11,
//     fontWeight: '600',
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
// });