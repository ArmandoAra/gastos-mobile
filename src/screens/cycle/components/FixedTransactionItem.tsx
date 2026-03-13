import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { t } from 'i18next';
import * as Haptics from 'expo-haptics';

import { FixedTransaction } from '../../../interfaces/cycle.interface';
import { ThemeColors } from '../../../types/navigation';
import { TransactionType } from '../../../interfaces/data.interface';
import { useSettingsStore } from '../../../stores/settingsStore';
import { globalStyles } from '../../../theme/global.styles';
import { useAuthStore } from '../../../stores/authStore';

// Hooks y Componentes de tu sistema de Transacciones
import { useTransactionItemLogic } from '../../transactions/hooks/useTransactionItemLogic';
import WarningMessage from '../../transactions/components/WarningMessage';
import { SwipeDelete } from '../../../components/buttons/SwipeDelete';

// Categorías e íconos
import useCategoriesStore from '../../../stores/useCategoriesStore';
import { defaultCategories } from '../../../constants/categories';
import { ICON_OPTIONS } from '../../../constants/icons';

interface FixedTransactionItemProps {
  tx: FixedTransaction;
  colors: ThemeColors;
  onToggle: (id: string, accountId: string, amount: number) => void;
  onDelete: (id: string) => void;
  onEdit: (tx: FixedTransaction) => void;
  delay?: number;
}

export const FixedTransactionItem = React.memo(({
  tx,
  colors,
  onToggle,
  onDelete,
  onEdit,
  delay = 0
}: FixedTransactionItemProps) => {

  const currencySymbol = useAuthStore((s) => s.currencySymbol);
  const iconsOptions = useSettingsStore(state => state.iconsOptions);
  const { getUserCategories } = useCategoriesStore();

  // 1. RESOLUCIÓN DE ÍCONOS (Tu lógica restaurada)
  const categoryIconData = useMemo(() => {
    const customCategory = getUserCategories();
    const allCategories = [...defaultCategories, ...customCategory];

    // Buscar la categoría que coincida con el id guardado en la transacción
    const matchCategory = allCategories.find(cat => cat.id === tx.categoryId);
    const iconDefinition = ICON_OPTIONS[iconsOptions].find(opt => opt.label === matchCategory?.icon);
    
    return {
      IconComponent: iconDefinition?.icon,
      color: matchCategory?.color || '#B0BEC5',
      displayName: matchCategory?.name || ''
    };
  }, [tx.categoryId, iconsOptions, getUserCategories]);

  const { IconComponent, color, displayName } = categoryIconData;

  // 2. ADAPTADOR: Convertimos temporalmente FixedTx a formato Transaction para SwipeDelete
  const mockTransactionForSwipe = useMemo(() => ({
    id: tx.id,
    account_id: tx.account_id,
    amount: tx.amount,
    type: TransactionType.EXPENSE,
    description: tx.description,
    category_icon_name: tx.category_icon_name,
    date: tx.date || new Date().toISOString(),
    user_id: tx.user_id,
    created_at: tx.created_at,
    updated_at: tx.updated_at,
  }), [tx]);

  // 3. LOGICA SWIPE Y ANIMACIONES
  const {
    formattedAmount, // Trae el monto formateado nativo de tu hook
    isWarningOpen,
    handleLayout,
    prepareForEdit,
    performDelete,
    handleCancelDelete,
    handleAccessibilityAction,
    panGesture,
    rStyle,
    rContainerStyle,
    rBackgroundStyle,
    accessibilityActions
  } = useTransactionItemLogic({ 
    transaction: mockTransactionForSwipe as any, 
    onDelete: () => onDelete(tx.id), 
    colors 
  });

  const handleEditPress = () => {
    prepareForEdit();
    onEdit(tx);
  };

  const handleCheckPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(tx.id, tx.account_id, tx.amount);
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify().damping(60)}
      exiting={FadeOutUp.duration(150)}
      layout={LinearTransition.springify().damping(18).stiffness(120)}
      style={[styles.containerWrapper, rContainerStyle]}
      onLayout={handleLayout}
    >
      {/* Swipe Delete Fondo (Solo si no está pagado) */}
      {!tx.isPaid && (
        <SwipeDelete rBackgroundStyle={rBackgroundStyle} colors={colors} />
      )}

      {/* Tarjeta Principal Deslizable */}
      <GestureHandlerRootView>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.itemContainer,
            rStyle,
            { backgroundColor: colors.surfaceSecondary }
          ]}
        >
          <View style={styles.contentRow}>
            
            {/* ZONA DE EDICIÓN (Izquierda y Centro) */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleEditPress}
              style={styles.touchableContent}
              accessibilityRole="button"
              accessibilityLabel={`Editar gasto ${tx.description}`}
              accessibilityActions={accessibilityActions}
              onAccessibilityAction={handleAccessibilityAction}
            >
              {/* Avatar Icono Reparado */}
              <View style={[styles.avatar, { backgroundColor: color + '22' }]}>
                {IconComponent ? (
                  <IconComponent
                    color={color}
                    style={{
                      width: iconsOptions === 'painted' ? 44 : 24,
                      height: iconsOptions === 'painted' ? 44 : 24,
                      backgroundColor: 'transparent',
                    }}
                  />
                ) : (
                  <MaterialIcons name="shopping-bag" size={20} color={color} />
                )}
              </View>

              {/* Textos Centrales */}
              <View style={styles.textContainer}>
                <Text
                  style={[styles.description, {  color: tx.isPaid ? colors.income : colors.text }]}
                  numberOfLines={1}
                >
                  {tx.description || displayName || t('common.noDescription')}
                </Text>

                <View style={styles.metaRow}>
                  <Text style={[globalStyles.bodyTextXs, { color: colors.textSecondary }]}>
                    {t('fixed_tx.day_of_month', { day: tx.dayOfMonth })} {tx.dayOfMonth}
                  </Text>
                  <Text style={[globalStyles.bodyTextXs, { color: tx.isPaid ? colors.income : colors.expense }]}>
                    • {tx.isPaid ? t('fixed_tx.paid') : t('fixed_tx.unpaid')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* ZONA DE CHECK Y MONTO (Derecha) */}
            <View style={styles.rightActionContainer}>
              <Text style={[globalStyles.amountSm, { color: tx.isPaid ? colors.textSecondary : colors.text, marginBottom: 4 }]}>
                {formattedAmount} {/* Ya viene formateado con el símbolo */}
              </Text>
              
              <TouchableOpacity
                onPress={handleCheckPress}
                style={styles.checkButton}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <MaterialCommunityIcons
                  name={tx.isPaid ? "check-circle" : "checkbox-blank-circle-outline"}
                  size={26}
                  color={tx.isPaid ? colors.success : colors.border}
                />
              </TouchableOpacity>
            </View>

          </View>
        </Animated.View>
      </GestureDetector>
      </GestureHandlerRootView>

      {/* Modal de Advertencia de Borrado */}
      {isWarningOpen && (
        <WarningMessage
          message={t('transactions.deleteConfirm')}
          onClose={handleCancelDelete}
          onSubmit={performDelete}
        />
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  containerWrapper: {
    borderRadius: 14,
    minHeight: 72,
    marginBottom: 8,
  },
  itemContainer: {
    borderRadius: 14,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  touchableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 8,
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    gap: 5,
    justifyContent: 'center',
  },
  description: {
    fontSize: 14,
    fontFamily: 'FiraSans-Regular',
    lineHeight: 20,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'FiraSans-Regular',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rightActionContainer: {
    paddingRight: 16,
    paddingVertical: 14,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  checkButton: {
    padding: 2,
  }
});