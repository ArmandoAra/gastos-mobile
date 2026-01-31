import { useState, useMemo, useCallback } from 'react';
import {
    Dimensions,
    Platform,
    AccessibilityInfo,
    LayoutChangeEvent,
    AccessibilityActionInfo
} from 'react-native';
import { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../utils/helpers';
import { Transaction, TransactionType } from '../../../interfaces/data.interface';
import { ICON_OPTIONS } from '../../../constants/icons';
import { useAuthStore } from '../../../stores/authStore';
import useDataStore from '../../../stores/useDataStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { defaultCategories } from '../../../constants/categories';
import { InputNameActive } from '../../../interfaces/settings.interface';
import { ThemeColors } from '../../../types/navigation';
import useCategoriesStore from '../../../stores/useCategoriesStore';
import { CategoryLabel } from '../../../interfaces/categories.interface';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface UseTransactionItemLogicProps {
    transaction: Transaction;
    onDelete: (id: string, accountId: string, amount: number, type: TransactionType) => void;
    colors: ThemeColors;
}


export const useTransactionItemLogic = ({ transaction, onDelete, colors }: UseTransactionItemLogicProps) => {
    const { t } = useTranslation();
    const { user, currencySymbol } = useAuthStore();
    const { setInputNameActive, iconsOptions } = useSettingsStore();
    const { getAccountNameById } = useDataStore();

    // 1. ELIMINADO: Estado local isEditOpen

    const [isWarningOpen, setIsWarningOpen] = useState(false);

    // --- Valores Animados ---
    const translateX = useSharedValue(0);
    const itemHeight = useSharedValue<number | null>(null);
    const opacity = useSharedValue(1);
    const marginBottom = useSharedValue(8);
    const isExpense = transaction.type === TransactionType.EXPENSE;
    const formattedDate = format(new Date(transaction.date), 'dd/MM/yyyy - HH:mm');
    const formattedAmount = `${isExpense ? '-' : '+'}${currencySymbol} ${formatCurrency(Math.abs(transaction.amount))}`;


    const userCategoriesOptions = useMemo(() => {
        return useCategoriesStore.getState().userCategories || []; 
    }, []);

    // --- Lógica de Datos (Memoizada) ---
    const categoryIconData = useMemo(() => {
        // buscar el icono y el color de la categoria entre las categorias por defecto y las del usuario


        // Sacamos el nombre original de la categoria de la transaccion, lo mismo si es personalizada o por defecto, esta se guarda en slug_category_name[0]
        const categoryName = transaction.slug_category_name[0] as CategoryLabel;

        // Buscar en categorias personalizadas, por el nombre y el userId
        const customCategory = userCategoriesOptions.find(
            cat => cat.name === categoryName && cat.userId === user?.id
        );

        // Si se encuentra una categoria personalizada, usar su icono y color directamente y retornarla
        if (customCategory) {
            const iconDefinition = ICON_OPTIONS[iconsOptions].find(opt => opt.label === customCategory?.icon); // Usar el icono guardado en la transacción

            return {
                IconComponent: iconDefinition?.icon,
                color: customCategory?.color || '#B0BEC5',
            };
        }

        // De no encontrar la categoria en las personalizadas, buscar en las categorias por defecto y devolver el icono y el nombre que va a ser el slug

        const defaultCategory = defaultCategories.find(
            cat => cat.icon === transaction.category_icon_name && cat.userId === 'default' 
        );

        // const iconDefinition = ICON_OPTIONS[iconsOptions].find(opt => opt.label === found?.icon);

        const iconDefinition = ICON_OPTIONS[iconsOptions].find(opt => opt.label === defaultCategory?.icon); // Usar el icono guardado en la transacción


        return {
            IconComponent: iconDefinition?.icon,
            color: defaultCategory?.color || '#B0BEC5',
        };
    }, [transaction.slug_category_name, userCategoriesOptions, iconsOptions]);

    const accountName = useMemo(() => {
        return getAccountNameById(transaction.account_id);
    }, [transaction.account_id, getAccountNameById]);

    // --- Handlers de UI ---
    const handleLayout = useCallback((event: LayoutChangeEvent) => {
        const { height } = event.nativeEvent.layout;
        if (itemHeight.value === null) {
            itemHeight.value = height;
        }
    }, []);

    const prepareForEdit = useCallback(() => {
        setInputNameActive(transaction.type === TransactionType.INCOME ? InputNameActive.INCOME : InputNameActive.SPEND);
    }, [transaction.type, setInputNameActive]);

    // --- Lógica de Borrado y Animación ---
    const handleDeleteReference = useCallback(() => {
        onDelete(
            transaction.id,
            transaction.account_id,
            transaction.amount,
            transaction.type as TransactionType
        );
    }, [transaction, onDelete]);

    const performDelete = useCallback(() => {
        setIsWarningOpen(false);
        if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(t('common.deleted'));

        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 300 });
        itemHeight.value = withTiming(0, { duration: 300 });
        marginBottom.value = withTiming(0, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
            if (finished) {
                runOnJS(handleDeleteReference)();
            }
        });
    }, [t, handleDeleteReference]);

    const handleCancelDelete = useCallback(() => {
        setIsWarningOpen(false);
        translateX.value = withSpring(0);
    }, []);

    const openWarning = useCallback(() => {
        setIsWarningOpen(true);
    }, []);

    // --- Gestos ---
    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
            translateX.value = event.translationX;
        })
        .onEnd(() => {
            if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
                runOnJS(openWarning)();
            } else {
                translateX.value = withSpring(0);
            }
        });

    // --- Estilos Animados ---
    const rStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const rContainerStyle = useAnimatedStyle(() => ({
        height: itemHeight.value === null ? undefined : itemHeight.value,
        marginBottom: marginBottom.value,
        opacity: opacity.value,
        overflow: 'hidden',
    }));

    const rBackgroundStyle = useAnimatedStyle(() => {
        const isSwipe = Math.abs(translateX.value) > 0;
        return {
            backgroundColor: isSwipe ? colors.error : 'transparent',
            justifyContent: translateX.value < 0 ? 'flex-end' : 'flex-start',
        };
    });

    // --- Accesibilidad ---
    const accessibilityActions: AccessibilityActionInfo[] = [
        { name: 'delete', label: t('common.delete') },
        { name: 'activate', label: t('common.edit') }
    ];

    const handleAccessibilityAction = (event: any) => {
        switch (event.nativeEvent.actionName) {
            case 'delete':
                setIsWarningOpen(true);
                break;
            case 'activate':
                // Solo preparamos, el onPress del componente hará el resto
                prepareForEdit();
                break;
        }
    };

    return {
        // Data
        categoryIconData,
        accountName,
        formattedDate,
        formattedAmount,
        isExpense,
        t,
        
        // State (Limpiado)
        isWarningOpen,
        
        // Handlers
        handleLayout,
        prepareForEdit, // Exponemos la función de preparación
        performDelete,
        handleCancelDelete,
        handleAccessibilityAction,
        
        // Gesture & Animation
        panGesture,
        rStyle,
        rContainerStyle,
        rBackgroundStyle,
        accessibilityActions
    };
};