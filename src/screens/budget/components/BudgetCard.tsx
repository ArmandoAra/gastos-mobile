import { MaterialIcons } from "@expo/vector-icons";
import {  TouchableOpacity, View, Text } from "react-native";
import Animated, {  FadeIn } from "react-native-reanimated";
import {styles} from "../BudgetScreen"
import { Category, ExpenseBudget, Item } from "../../../interfaces/data.interface";
import { ICON_OPTIONS } from "../../../constants/icons";
import { CategoryLabel } from "../../../api/interfaces";
import { useMemo } from "react";
import { useTransactionForm } from "../../transactions/constants/hooks/useTransactionForm";
import { useAuthStore } from "../../../stores/authStore";
import { defaultCategories } from "../../../constants/categories";


export const BudgetCard = ({ 
    item, 
    onPress, 
    colors 
}: { 
    item: ExpenseBudget; 
    onPress: () => void; 
    colors: any 
}) => {
    const {userCategoriesOptions} = useTransactionForm();
    const { user } = useAuthStore();
    const progress = item.budgetedAmount > 0 ? (item.spentAmount / item.budgetedAmount) : 0;
    const isOverBudget = item.spentAmount > item.budgetedAmount;

    const categoryIconData = useMemo(() => {
        // 1. Obtenemos el nombre que buscamos
        const categoryName = item.slug_category_name[0] as CategoryLabel;

        // 2. BUSQUEDA CON PRIORIDAD:
        // Intentamos encontrar primero una categoría que coincida en nombre Y sea del usuario
        const customCategory = userCategoriesOptions.find(
            cat => cat.name === categoryName && cat.userId === user?.id
        );

        // Si no hay custom, buscamos la por defecto (userId 'default' o cualquiera que coincida en nombre)
        const defaultCategory = defaultCategories.find(
            cat => cat.name === categoryName && cat.userId === 'default'
        );

        // La categoría final es la custom (si existe) o la default
        const found = customCategory || defaultCategory;

        // 3. Obtener el componente visual del Icono
        // Buscamos en ICON_OPTIONS usando el 'icon' (label) que viene dentro de la categoría encontrada
        const iconDefinition = ICON_OPTIONS.find(opt => opt.label === found?.icon);

        return {
            IconComponent: iconDefinition?.icon,
            color: found?.color || '#B0BEC5',
        };

    }, [ item.slug_category_name, userCategoriesOptions, defaultCategories, user?.id]);
const { IconComponent, color } = categoryIconData;

    return (
        <Animated.View 
            entering={FadeIn}
            style={[styles.cardContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
        >
            <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.cardTouchable}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                        {item.name || "No title"}
                    </Text>
                    <View style={[styles.iconCircle, { backgroundColor: color || colors.text }]}>
                        {IconComponent ? <IconComponent size={20} color={colors.text} style={{
                                    backgroundColor: colors.surface,
                                    borderRadius: 50,
                                    padding: 1,

                                }}/> : (
                            <MaterialIcons name="category" size={20} color={colors.text} style={{
                                    backgroundColor: colors.surface,
                                    borderRadius: 50,
                                    padding: 1,

                                }}/>
                        )}
                    </View>

                </View>

                {/* Lista previa de items (max 3) */}
                <View style={styles.cardItemsPreview}>
                    {item.items?.slice(0, 3).map((subItem: Item) => (
                        <View key={subItem.id} style={styles.miniItemRow}>
                            <View style={[styles.bullet, { backgroundColor: colors.textSecondary }]} />
                            <Text style={[styles.miniItemText, { color: colors.textSecondary }]} numberOfLines={1}>
                                {subItem.name}
                            </Text>
                        </View>
                    ))}
                    {(item.items?.length || 0) > 3 && (
                        <Text style={[styles.moreText, { color: colors.textSecondary }]}>
                            +{(item.items?.length || 0) - 3} más...
                        </Text>
                    )}
                </View>

                {/* Footer con Totales */}
                <View style={styles.cardFooter}>
                    <Text style={[styles.amountText, { color: isOverBudget ? colors.error : colors.text }]}>
                        ${item.spentAmount.toFixed(2)}
                    </Text>
                    <Text style={[styles.targetText, { color: colors.textSecondary }]}>
                        / ${item.budgetedAmount.toFixed(2)}
                    </Text>
                </View>

                {/* Barra de progreso visual */}
                <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceSecondary }]}>
                    <View style={[
                        styles.progressBarFill, 
                        { 
                            backgroundColor: isOverBudget ? colors.error : colors.accent,
                            width: `${Math.min(progress * 100, 100)}%` 
                        }
                    ]} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};