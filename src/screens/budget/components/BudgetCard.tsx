// import { MaterialIcons } from "@expo/vector-icons";
// import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
// import Animated, { FadeIn } from "react-native-reanimated";
// import { ExpenseBudget, Item } from "../../../interfaces/data.interface";
// import { ICON_OPTIONS } from "../../../constants/icons";
// import { useMemo } from "react";
// import { useAuthStore } from "../../../stores/authStore";
// import { defaultCategories, defaultCategoryNames } from "../../../constants/categories";
// import { ThemeColors } from "../../../types/navigation";
// import { useTranslation } from "react-i18next";
// import { useSettingsStore } from "../../../stores/settingsStore";
// import { formatCurrency } from "../../../utils/helpers";
// import useCategoriesStore from "../../../stores/useCategoriesStore";

// export const BudgetCard = ({
//     item,
//     onPress,
//     colors
// }: {
//     item: ExpenseBudget;
//     onPress: () => void;
//         colors: ThemeColors
// }) => {
//     const { t } = useTranslation();
//     const iconsOptions = useSettingsStore(state => state.iconsOptions);
//     const currencySymbol = useAuthStore(state => state.currencySymbol);
//     const { userCategories } = useCategoriesStore();
//     const user = useAuthStore(state => state.user);
//     const progress = item.budgetedAmount > 0 ? (item.spentAmount / item.budgetedAmount) : 0;
//     const isOverBudget = item.spentAmount > item.budgetedAmount;


//     // Lógica de visualización de items
//     const MAX_ITEMS_TO_SHOW = 8;
//     const itemsToList = item.items?.slice(0, MAX_ITEMS_TO_SHOW) || [];
//     const remainingItems = (item.items?.length || 0) - MAX_ITEMS_TO_SHOW;

//     const categoryIconData = useMemo(() => {
//         const allCategories = [...defaultCategories, ...userCategories];

//         // buscar la categoria que coincida con el id guardado en la transaccion
//         const matchCategory = allCategories.find(cat => cat.id === item.categoryId);

//         const iconDefinition = ICON_OPTIONS[iconsOptions].find(opt => opt.label === matchCategory?.icon);

//         return {
//             IconComponent: iconDefinition?.icon,
//             color: matchCategory?.color || '#B0BEC5',
//             displayName: matchCategory?.name || ''
//         };

//     }, [item.categoryId, userCategories, defaultCategories, user?.id, iconsOptions]);

//     const { IconComponent, color, displayName } = categoryIconData;

//     return (
//         <Animated.View
//             entering={FadeIn}
//             style={[styles.cardContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
//         >
//             <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.cardTouchable}>
//                 <View style={styles.cardHeader}>
//                     <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
//                         {item.name || "No title"}
//                     </Text>
//                     <Text style={{ marginRight: 8, color: colors.textSecondary }}>
//                         {defaultCategoryNames.some(name => name === displayName) ? t(`icons.${displayName}`) : displayName}
//                     </Text>
//                     <View style={[styles.iconCircle, { backgroundColor: iconsOptions === 'painted' ? 'transparent' : color, borderRadius: 25 }]}>
//                         {IconComponent ? <IconComponent size={20} color={colors.text} style={{
//                             width: iconsOptions === 'painted' ? 46 : 22,
//                             height: iconsOptions === 'painted' ? 46 : 22,
//                             backgroundColor: iconsOptions === 'painted' ? 'transparent' : colors.surface,
//                             borderRadius: iconsOptions === 'painted' ? 0 : 50,
//                             padding: iconsOptions === 'painted' ? 0 : 1,
//                         }} /> : (
//                             <MaterialIcons name="category" size={20} color={colors.text} style={{
//                                     backgroundColor: colors.surface,
//                                     borderRadius: 50,
//                                     padding: 1,
//                                 }} />
//                         )}
//                     </View>
//                 </View>

//                 {/* --- SECCIÓN MODIFICADA: ITEMS EN GRID --- */}
//                 <View style={styles.cardItemsPreview}>
//                     {itemsToList.map((subItem: Item) => (
//                         <View
//                             key={subItem.id}
//                             style={[styles.gridItem, { backgroundColor: colors.background || '#f0f0f0', borderColor: colors.border }]}
//                         >
//                             {/* Opcional: bullet point pequeño */}
//                             <View style={[styles.bullet, { backgroundColor: colors.textSecondary }]} />
//                             <Text style={[styles.miniItemText, { color: colors.textSecondary }]} numberOfLines={1}>
//                                 {subItem.name}
//                             </Text>
//                         </View>
//                     ))}

//                     {/* Indicador de restantes si hay más de 8 */}
//                     {remainingItems > 0 && (
//                         <View style={[styles.gridItem, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 0 }]}>
//                             <Text style={[styles.moreText, { color: colors.accent, fontWeight: 'bold' }]}>
//                                 +{remainingItems} {t('common.more')}
//                             </Text>
//                         </View>
//                     )}
//                 </View>
//                 {/* ----------------------------------------- */}

//                 {/* Footer con Totales */}
//                 <View style={styles.cardFooter}>
//                     <Text style={[styles.amountText, { color: isOverBudget ? colors.error : colors.income }]}>
//                         {currencySymbol} {formatCurrency(item.spentAmount)}
//                     </Text>
//                     <Text style={[styles.targetText, { color: isOverBudget ? colors.error : '#60a5fa' }]}>
//                         / {currencySymbol} {formatCurrency(item.budgetedAmount)}
//                     </Text>
//                 </View>

//                 {/* Barra de progreso visual */}
//                 <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceSecondary }]}>
//                     <View style={[
//                         styles.progressBarFill,
//                         {
//                             backgroundColor: isOverBudget ? colors.error : colors.accent,
//                             width: `${Math.min(progress * 100, 100)}%`
//                         }
//                     ]} />
//                 </View>

//                 {item.favorite && (
//                     <View style={{ position: 'absolute', bottom: 22, right: 10 }}>
//                         <MaterialIcons name="star" size={24} color={colors.warning} />
//                     </View>
//                 )}
//             </TouchableOpacity>
//         </Animated.View>
//     );
// };

// const styles = StyleSheet.create({
//     cardContainer: {
//         width: '100%',
//         borderRadius: 12,
//         borderWidth: 1,
//         overflow: 'hidden',
//     },
//     cardTouchable: {
//         padding: 12,
//         minHeight: 140,
//         justifyContent: 'space-between',
//     },
//     cardHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 20,
//         gap: 6,
//     },
//     cardTitle: {
//         fontFamily: 'FiraSans-Bold',
//         fontSize: 16,
//         flex: 1,
//         marginRight: 5,
//     },

//     // --- ESTILOS NUEVOS PARA EL GRID ---
//     cardItemsPreview: {
//         flexDirection: 'row',       // Flujo horizontal
//         flexWrap: 'wrap',           // Permite saltar de línea
//         gap: 5,                     // Espacio entre columnas y filas
//         marginBottom: 10,
//         flex: 1,
//     },
//     gridItem: {
//         width: '32%',               // 3 columnas (aprox 33% menos el gap)
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 4,
//         paddingVertical: 2,
//         borderRadius: 4,
//         borderWidth: 0.5,           // Borde sutil opcional para que parezca una celda/tag
//     },
//     miniItemText: {
//         fontSize: 11,
//         flex: 1,                    // Para que el texto se corte si es largo
//         fontFamily: 'FiraSans-Regular',
//     },
//     bullet: {
//         width: 3,
//         height: 3,
//         borderRadius: 2,
//         marginRight: 4,
//     },
//     moreText: {
//         fontSize: 11,
//         fontFamily: 'Tinos-Italic',
//     },
//     // ------------------------------------

//     cardFooter: {
//         flexDirection: 'row',
//         alignItems: 'baseline',
//         marginBottom: 6,
//     },
//     amountText: {
//         fontFamily: 'FiraSans-Bold',
//         fontSize: 15,
//     },
//     targetText: {
//         fontFamily: 'FiraSans-Bold',
//         fontSize: 12,
//         marginLeft: 4,
//     },
//     progressBarBg: {
//         height: 4,
//         borderRadius: 2,
//         width: '100%',
//         overflow: 'hidden',
//     },
//     progressBarFill: {
//         height: '100%',
//         borderRadius: 2,
//     },
//     iconCircle: {
//         width: 32,
//         height: 32,
//         borderRadius: 16,
//         justifyContent: 'center',
//         alignItems: 'center',
//     }
// });

import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { ExpenseBudget, Item } from "../../../interfaces/data.interface";
import { ICON_OPTIONS } from "../../../constants/icons";
import { useMemo } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { defaultCategories, defaultCategoryNames } from "../../../constants/categories";
import { ThemeColors } from "../../../types/navigation";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../../stores/settingsStore";
import { formatCurrency } from "../../../utils/helpers";
import useCategoriesStore from "../../../stores/useCategoriesStore";

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
    const iconsOptions = useSettingsStore(state => state.iconsOptions);
    const currencySymbol = useAuthStore(state => state.currencySymbol);
    const { userCategories } = useCategoriesStore();
    const user = useAuthStore(state => state.user);
    const progress = item.budgetedAmount > 0 ? (item.spentAmount / item.budgetedAmount) : 0;
    const isOverBudget = item.spentAmount > item.budgetedAmount;

    const MAX_ITEMS_TO_SHOW = 8;
    const itemsToList = item.items?.slice(0, MAX_ITEMS_TO_SHOW) || [];
    const remainingItems = (item.items?.length || 0) - MAX_ITEMS_TO_SHOW;

    const categoryIconData = useMemo(() => {
        const allCategories = [...defaultCategories, ...userCategories];
        const matchCategory = allCategories.find(cat => cat.id === item.categoryId);
        const iconDefinition = ICON_OPTIONS[iconsOptions].find(opt => opt.label === matchCategory?.icon);
        return {
            IconComponent: iconDefinition?.icon,
            color: matchCategory?.color || '#B0BEC5',
            displayName: matchCategory?.name || ''
        };
    }, [item.categoryId, userCategories, defaultCategories, user?.id, iconsOptions]);

    const { IconComponent, color, displayName } = categoryIconData;
    const progressPct = Math.min(progress * 100, 100);

    return (
        <Animated.View
            entering={FadeIn}
            style={[styles.cardContainer, { backgroundColor: colors.surface }]}
        >
            <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>

                {/* ── HEADER ── */}
                <View style={styles.cardHeader}>
                    {/* Avatar cuadrado redondeado — igual que iconBox de CategoryRow */}
                    <View style={[styles.avatar, { backgroundColor: color + '22' }]}>
                        {IconComponent ? (
                            <IconComponent
                                size={20}
                                color={color}
                                style={{
                                    width: iconsOptions === 'painted' ? 44 : 22,
                                    height: iconsOptions === 'painted' ? 44 : 22,
                                    backgroundColor: 'transparent',
                                    borderRadius: 50,
                                }}
                            />
                        ) : (
                            <MaterialIcons name="category" size={20} color={color} />
                        )}
                    </View>

                    {/* Nombre + chip de categoría */}
                    <View style={styles.headerText}>
                        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                            {item.name || "No title"}
                        </Text>
                        <View style={[styles.categoryChip, { backgroundColor: color + '22' }]}>
                            <Text style={[styles.categoryChipText, { color: color }]} numberOfLines={1}>
                                {defaultCategoryNames.some(n => n === displayName)
                                    ? t(`icons.${displayName}`)
                                    : displayName}
                            </Text>
                        </View>
                    </View>

                    {item.favorite && (
                        <MaterialIcons name="star" size={18} color={colors.warning} />
                    )}
                </View>

                {/* ── ITEMS GRID ── */}
                {itemsToList.length > 0 && (
                    <View style={styles.cardItemsPreview}>
                        {itemsToList.map((subItem: Item) => (
                            <View
                                key={subItem.id}
                                style={[styles.gridItem, {
                                    backgroundColor: color + '12',
                                    borderColor: color + '30',
                                }]}
                            >
                                <View style={[styles.bullet, { backgroundColor: color }]} />
                                <Text
                                    style={[styles.miniItemText, { color: colors.textSecondary }]}
                                    numberOfLines={1}
                                >
                                    {subItem.name}
                                </Text>
                            </View>
                        ))}
                        {remainingItems > 0 && (
                            <View style={[styles.gridItem, {
                                backgroundColor: colors.primary + '15',
                                borderColor: colors.primary + '30',
                            }]}>
                                <Text style={[styles.moreText, { color: colors.primary }]}>
                                    +{remainingItems} {t('common.more')}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* ── FOOTER: montos + barra ── */}
                <View style={styles.cardFooter}>
                    <View style={styles.amountsRow}>
                        <Text style={[styles.amountSpent, {
                            color: isOverBudget ? colors.expense : colors.income
                        }]}>
                            {currencySymbol}{formatCurrency(item.spentAmount)}
                        </Text>
                        <Text style={[styles.amountDivider, { color: colors.textSecondary }]}> / </Text>
                        <Text style={[styles.amountBudget, { color: colors.textSecondary }]}>
                            {currencySymbol}{formatCurrency(item.budgetedAmount)}
                        </Text>
                        <Text style={[styles.percentText, {
                            color: isOverBudget ? colors.expense : color
                        }]}>
                            {Math.round(progressPct)}%
                        </Text>
                    </View>

                    {/* Barra — misma altura y radius que CategoryRow */}
                    <View style={[styles.progressBg, { backgroundColor: colors.surfaceSecondary }]}>
                        <View style={[
                            styles.progressFill,
                            {
                                width: `${progressPct}%`,
                                backgroundColor: isOverBudget ? colors.expense : color,
                            }
                        ]} />
                    </View>
                </View>

            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    cardTouchable: {
        padding: 16,
        gap: 12,
    },

    // ── Header ──
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    // Avatar cuadrado — igual que iconBox (borderRadius 10-12) de CategoryRow
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    headerText: {
        flex: 1,
        gap: 4,
    },
    cardTitle: {
        fontFamily: 'FiraSans-Bold',
        fontSize: 14,
        lineHeight: 20,
    },
    // Chip pill — igual que CategoryRow y TransactionItem
    categoryChip: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 99,
    },
    categoryChipText: {
        fontSize: 10,
        fontFamily: 'FiraSans-Bold',
        lineHeight: 14,
    },

    // ── Items grid ──
    cardItemsPreview: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    gridItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 99,   // pill — coherente con chips del resto de la app
        borderWidth: 1,
        gap: 4,
    },
    miniItemText: {
        fontSize: 11,
        fontFamily: 'FiraSans-Regular',
        maxWidth: 80,
    },
    bullet: {
        width: 4,
        height: 4,
        borderRadius: 2,
        flexShrink: 0,
    },
    moreText: {
        fontSize: 11,
        fontFamily: 'FiraSans-Bold',
    },

    // ── Footer ──
    cardFooter: {
        gap: 7,
    },
    amountsRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    amountSpent: {
        fontFamily: 'FiraSans-Bold',
        fontSize: 15,
    },
    amountDivider: {
        fontFamily: 'FiraSans-Regular',
        fontSize: 13,
    },
    amountBudget: {
        fontFamily: 'FiraSans-Regular',
        fontSize: 13,
        flex: 1,            // empuja el % a la derecha
    },
    percentText: {
        fontFamily: 'FiraSans-Bold',
        fontSize: 12,
    },
    // Barra — altura 6 y radius 99, igual que CategoryRow
    progressBg: {
        height: 6,
        borderRadius: 99,
        width: '100%',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 99,
    },
});