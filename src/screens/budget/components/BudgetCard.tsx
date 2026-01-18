import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Category, ExpenseBudget, Item } from "../../../interfaces/data.interface";
import { ICON_OPTIONS } from "../../../constants/icons";
import { CategoryLabel } from "../../../api/interfaces";
import { useMemo } from "react";
import { useTransactionForm } from "../../transactions/constants/hooks/useTransactionForm";
import { useAuthStore } from "../../../stores/authStore";
import { defaultCategories, defaultCategoryNames } from "../../../constants/categories";
import { ThemeColors } from "../../../types/navigation";
import { useTranslation } from "react-i18next";
import { filterCategoriesByType } from "../../../utils/categories";

export const BudgetCard = ({ 
    item, 
    onPress, 
    colors 
}: { 
    item: ExpenseBudget; 
    onPress: () => void; 
        colors: ThemeColors
}) => {
    const { t } = useTranslation();
    const currencySymbol = useAuthStore(state => state.currencySymbol);
    const {userCategoriesOptions} = useTransactionForm();
    const user = useAuthStore(state => state.user);
    const progress = item.budgetedAmount > 0 ? (item.spentAmount / item.budgetedAmount) : 0;
    const isOverBudget = item.spentAmount > item.budgetedAmount;


    // Lógica de visualización de items
    const MAX_ITEMS_TO_SHOW = 8;
    const itemsToList = item.items?.slice(0, MAX_ITEMS_TO_SHOW) || [];
    const remainingItems = (item.items?.length || 0) - MAX_ITEMS_TO_SHOW;

    const categoryIconData = useMemo(() => {
        const categoryName = item.slug_category_name[0] as CategoryLabel;

        const customCategory = userCategoriesOptions.find(
            cat => cat.name === categoryName && cat.userId === user?.id
        );
        const defaultCategory = defaultCategories.find(
            cat => cat.name === categoryName && cat.userId === 'default'
        );

        const found = customCategory || defaultCategory;
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
                    <Text style={{ marginRight: 8, color: colors.textSecondary }}>
                        {defaultCategoryNames.some(name => name === item.slug_category_name[0]) ? t(`icons.${item.slug_category_name[0]}`) : item.slug_category_name[0]}
                    </Text>
                    <View style={[styles.iconCircle, { backgroundColor: color || colors.text }]}>
                        {IconComponent ? <IconComponent size={20} color={colors.text} style={{
                            backgroundColor: colors.surface,
                            borderRadius: 50,
                            padding: 1,
                        }} /> : (
                            <MaterialIcons name="category" size={20} color={colors.text} style={{
                                    backgroundColor: colors.surface,
                                    borderRadius: 50,
                                    padding: 1,
                                }} />
                        )}
                    </View>
                </View>

                {/* --- SECCIÓN MODIFICADA: ITEMS EN GRID --- */}
                <View style={styles.cardItemsPreview}>
                    {itemsToList.map((subItem: Item) => (
                        <View
                            key={subItem.id}
                            style={[styles.gridItem, { backgroundColor: colors.background || '#f0f0f0', borderColor: colors.border }]}
                        >
                            {/* Opcional: bullet point pequeño */}
                            <View style={[styles.bullet, { backgroundColor: colors.textSecondary }]} />
                            <Text style={[styles.miniItemText, { color: colors.textSecondary }]} numberOfLines={1}>
                                {subItem.name}
                            </Text>
                        </View>
                    ))}

                    {/* Indicador de restantes si hay más de 8 */}
                    {remainingItems > 0 && (
                        <View style={[styles.gridItem, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 0 }]}>
                            <Text style={[styles.moreText, { color: colors.accent, fontWeight: 'bold' }]}>
                                +{remainingItems} {t('common.more')}
                            </Text>
                        </View>
                    )}
                </View>
                {/* ----------------------------------------- */}

                {/* Footer con Totales */}
                <View style={styles.cardFooter}>
                    <Text style={[styles.amountText, { color: isOverBudget ? colors.error : colors.income }]}>
                        {currencySymbol}{item.spentAmount.toFixed(2)}
                    </Text>
                    <Text style={[styles.targetText, { color: isOverBudget ? colors.error : '#60a5fa' }]}>
                        / {currencySymbol}{item.budgetedAmount.toFixed(2)}
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

                {item.favorite && (
                    <View style={{ position: 'absolute', bottom: 22, right: 10 }}>
                        <MaterialIcons name="star" size={24} color={colors.warning} />
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    cardTouchable: {
        padding: 12,
        minHeight: 140,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardTitle: {
        fontWeight: '700',
        fontSize: 16,
        flex: 1,
        marginRight: 5,
    },

    // --- ESTILOS NUEVOS PARA EL GRID ---
    cardItemsPreview: {
        flexDirection: 'row',       // Flujo horizontal
        flexWrap: 'wrap',           // Permite saltar de línea
        gap: 5,                     // Espacio entre columnas y filas
        marginBottom: 10,
        flex: 1,
    },
    gridItem: {
        width: '32%',               // 3 columnas (aprox 33% menos el gap)
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 0.5,           // Borde sutil opcional para que parezca una celda/tag
    },
    miniItemText: {
        fontSize: 11,
        flex: 1,                    // Para que el texto se corte si es largo
    },
    bullet: {
        width: 3,
        height: 3,
        borderRadius: 2,
        marginRight: 4,
    },
    moreText: {
        fontSize: 11,
        fontStyle: 'italic',
    },
    // ------------------------------------

    cardFooter: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 6,
    },
    amountText: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    targetText: {
        fontSize: 12,
        marginLeft: 4,
    },
    progressBarBg: {
        height: 4,
        borderRadius: 2,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    }
});