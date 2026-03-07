import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from 'react-native-reanimated';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useSettingsStore } from '../../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../../theme/colors';
import { globalStyles } from '../../../theme/global.styles';
import { useAuthStore } from '../../../stores/authStore';
import { useTransactionForm } from '../../transactions/constants/hooks/useTransactionForm';
import { useTransactionItemLogic } from '../../transactions/hooks/useTransactionItemLogic';
import useCategoriesStore from '../../../stores/useCategoriesStore';
import { defaultCategories } from '../../../constants/categories';
import { ICON_OPTIONS } from '../../../constants/icons';

export type GastoFijo = {
  categoryId: string;
  icon: string;
  label: string;
  spent: number;
  paid: boolean;
};

type Props = {
  item: GastoFijo;
  delay: number;
  onToggle: () => void;
};

export function FixedExpenseRow({ item, delay, onToggle }: Props) {
  const currencySymbol = useAuthStore((s) => s.currencySymbol);
  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => (theme === 'dark' ? darkTheme : lightTheme), [theme]);
  const { getUserCategories } = useCategoriesStore();
  const { iconsOptions } = useSettingsStore();

  const categoryIconData = useMemo(() => {
    // Sacamos el nombre original de la categoria de la transaccion, lo mismo si es personalizada o por defecto, esta se guarda en slug_category_name[0]
    const customCategory = getUserCategories()
    const allCategories = [...defaultCategories, ...customCategory];

    // buscar la categoria que coincida con el id guardado en la transaccion
    const matchCategory = allCategories.find(cat => cat.id === item.categoryId);
    const iconDefinition = ICON_OPTIONS[iconsOptions].find(opt => opt.label === matchCategory?.icon);
    return {
      IconComponent: iconDefinition?.icon,
      color: matchCategory?.color || '#B0BEC5',
      displayName: matchCategory?.name || ''
    };
  }, [item.categoryId, iconsOptions]);

  const { IconComponent, color, displayName } = categoryIconData;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  };
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify().damping(60)}
      exiting={FadeOutUp.delay(delay).springify()}
      style={[styles.row, { borderBottomColor: colors.border }]}
    >
      <TouchableOpacity
        style={styles.touchableArea}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
          {IconComponent ? (
            <IconComponent
              color={color}
              style={{
                width: iconsOptions === 'painted' ? 52 : 26,
                height: iconsOptions === 'painted' ? 52 : 26,
                backgroundColor: 'transparent',
                borderRadius: 50,
              }}
            />
          ) : (
            <MaterialIcons name="shopping-bag" size={20} color={color} />
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text
            style={[globalStyles.bodyTextSm, { color: colors.text, fontWeight: 'bold' }]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
          <Text style={[styles.statusText, { color: item.paid ? colors.success : colors.textSecondary }]}>
            {item.paid ? 'Pagado' : 'Pendiente'}
          </Text>
        </View>

        <View style={styles.rightAction}>
          <Text style={[styles.amount, { color: item.paid ? colors.textSecondary : colors.text }]}>
            {currencySymbol}{Number(item.spent).toFixed(2)}
          </Text>

          <MaterialCommunityIcons 
            name={item.paid ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'} 
            size={24} 
            color={item.paid ? colors.success : colors.textSecondary} 
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { 
    borderBottomWidth: StyleSheet.hairlineWidth, // Usa la línea más fina posible del dispositivo
  },
  touchableArea: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    paddingVertical: 12, // Un poco más de espacio para tocar cómodamente
  },
  iconBox: { 
    width: 40,
    height: 40, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  infoContainer: { 
    flex: 1, 
    justifyContent: 'center',
  },
  statusText: { 
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  rightAction: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10,
  },
  amount: { 
    fontSize: 14, 
    fontWeight: 'bold',
  },
});