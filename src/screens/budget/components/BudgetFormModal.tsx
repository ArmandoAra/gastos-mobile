import { MaterialIcons } from "@expo/vector-icons";
import {
    Modal,
    View,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    FlatList // <--- Importamos FlatList
} from "react-native";
import { useState, useCallback, useMemo, useEffect } from "react";
import Animated, { FadeIn, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeColors } from '../../../types/navigation';
import { Category, ExpenseBudget, Item } from "../../../interfaces/data.interface";
// import BudgetCategorySelector from "./BudgetCategorySelector";
import * as useBudgetForm from "../hooks/useBudgetForm";
import WarningMessage from "../../transactions/components/WarningMessage";
import useBudgetsStore, { ToConvertBudget } from "../../../stores/useBudgetStore";
import { useTranslation } from "react-i18next";
import { CategoryIconSelector } from "./CategoryIconSelector";
import { useAuthStore } from "../../../stores/authStore";

// IMPORTANTE: Importamos el componente optimizado que creamos antes
import { BudgetItem } from "./BudgetItem";
import { useSettingsStore } from "../../../stores/settingsStore";
import { InputNameActive } from "../../../interfaces/settings.interface";
import { formatCurrency } from "../../../utils/helpers";
import CategorySelectorPopover from "../../../components/forms/Inputs/CategorySelector";
import { useTransactionForm } from "../../transactions/constants/hooks/useTransactionForm";
import useCategoriesStore from "../../../stores/useCategoriesStore";
import useDataStore from "../../../stores/useDataStore";

export const BudgetFormModal = ({
    visible,
    onClose,
    initialData,
    colors
}: {
    visible: boolean;
    onClose: () => void;
    initialData: ExpenseBudget | null;
    onSave: (data: ExpenseBudget) => void;
    colors: ThemeColors;
}) => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [menuVisible, setMenuVisible] = useState(false);
    const [delettingBudget, setDelettingBudget] = useState(false);

    const {
        name, setName,
        budgetedAmount, setBudgetedAmount,
        items,
        totalSpent,
        categorySelectorOpen, 
        dynamicIconSize,
        fontScale,
        defaultCategoriesOptions,
        selectedCategory,
        isFavorite,
        itemsInputRefs,
        setCategorySelectorOpen,
        handleSelectCategory,
        handleAddItem,
        updateItem,
        removeItem,
        handleSaveForm,
        toggleItemDone,
        toggleFavorite,
    } = useBudgetForm.useBudgetForm({ visible, onClose, initialData });
    const setInputNameActive = useSettingsStore(state => state.setInputNameActive);
    const setIsAddOptionsOpen = useSettingsStore(state => state.setIsAddOptionsOpen);
    const { handleDisableCategory, userActivesCategoriesOptions } = useTransactionForm();



    const currencySymbol = useAuthStore(state => state.currencySymbol);
    const deleteBudget = useBudgetsStore(state => state.deleteBudget);

    const handleMenuAction = (action: 'favorite' | 'convert' | 'delete') => {
        setMenuVisible(false);
        switch (action) {
            case 'favorite': toggleFavorite(); break;
            case 'convert': converToTransaction(); break;
            case 'delete': setDelettingBudget(true); break;
        }
    };

    const converToTransaction = useCallback(() => {
        const dataToTransact: ToConvertBudget = {
            name,
            totalAmount: totalSpent,
            slug_category_name: selectedCategory.name ? [selectedCategory.name] : initialData?.slug_category_name || [],
        };

        handleSaveForm();
        setCategorySelectorOpen(false);
        onClose();
        setIsAddOptionsOpen(true);
        setInputNameActive(InputNameActive.SPEND);
        useBudgetsStore.getState().setToTransactBudget(dataToTransact);
    }, [name, totalSpent, selectedCategory, initialData, handleSaveForm, setCategorySelectorOpen, onClose, setIsAddOptionsOpen, setInputNameActive]);

    // --- RENDERIZADO DEL HEADER DE LA LISTA ---
    // Contiene todo lo que va arriba de los items repetitivos
    const renderListHeader = useCallback(() => (
        <View onStartShouldSetResponder={() => true}>
            {/* SECCIÓN GENERAL (Inputs nombre, monto, etc.) */}
            <View style={[styles.sectionBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={{ marginBottom: 15, width: '100%' }}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>{t('budget_form.fields.name_label')}</Text>
                    <View style={styles.nameInputContainer}>
                        <TextInput
                            style={[styles.inputLarge, { color: colors.text, borderColor: colors.border }]}
                            placeholder={t('budget_form.fields.name_placeholder')}
                            placeholderTextColor={colors.textSecondary}
                            value={name}
                            maxLength={60}
                            onChangeText={setName}
                            accessibilityLabel={t('budget_form.fields.name_label')}
                            multiline={true}
                        />
                        <CategoryIconSelector
                            handleCategorySelector={() => setCategorySelectorOpen(!categorySelectorOpen)}
                            selectedCategory={selectedCategory}
                            colors={colors}
                        />
                    </View>
                </View>

                <View style={styles.rowWrap}>
                    <View style={styles.flexItem}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('budget_form.fields.target_amount_label')}</Text>
                        <TextInput
                            style={[styles.inputMedium, { color: colors.text, borderColor: colors.text }]}
                            placeholder={t('budget_form.fields.target_placeholder')}
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                            value={budgetedAmount}
                            onChangeText={setBudgetedAmount}
                            accessibilityLabel={t('budget_form.fields.target_amount_label')}
                        />
                    </View>
                    <View style={[styles.flexItem, { alignItems: 'flex-end' }]}>
                        <Text style={[styles.label, { color: colors.textSecondary, textAlign: 'right' }]}>{t('budget_form.fields.current_total_label')}</Text>
                        <Text
                            style={[styles.displayTotal, { color: totalSpent > (parseFloat(budgetedAmount) || 0) ? colors.expense : colors.text }]}
                            accessibilityLabel={`${t('budget_form.accessibility.calculated_total')} ${totalSpent.toFixed(2)}`}
                        >
                            {currencySymbol}{formatCurrency(totalSpent)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* CABECERA DE LA SECCIÓN ITEMS */}
            <View style={styles.itemsHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]} accessibilityRole="header">{t('budget_form.items.section_title')}</Text>
                    <View
                        style={[styles.itemsCounter, { backgroundColor: colors.accent }]}
                        accessible={true}
                        accessibilityLabel={t('budget_form.accessibility.items_count') + items.length}
                    >
                        <Text style={{ color: colors.text, fontSize: 12, fontFamily: 'FiraSans-Regular' }}>{items.length}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleAddItem}
                    style={[styles.addButtonSmall, { backgroundColor: colors.text, borderColor: colors.border }]}
                    accessibilityRole="button"
                    accessibilityLabel={t('budget_form.items.add_button')}
                >
                    <MaterialIcons name="add" size={18 * fontScale} color={colors.surfaceSecondary} />
                    <Text style={[styles.addButtonText, { fontSize: 14 * fontScale, color: colors.surfaceSecondary }]}>{t('budget_form.items.add_button')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    ), [colors, name, budgetedAmount, totalSpent, items.length, selectedCategory, fontScale, currencySymbol, t, setName, setBudgetedAmount, handleAddItem, categorySelectorOpen, setCategorySelectorOpen]);

    // --- RENDERIZADO DE CADA ITEM ---
    const renderItem = useCallback(({ item }: { item: Item }) => (
        <BudgetItem
            item={item}
            colors={colors}
            fontScale={fontScale}
            currencySymbol={currencySymbol}
            t={t}
            onUpdate={updateItem}
            onToggle={toggleItemDone}
            onRemove={removeItem}
            onSetRef={(ref) => {
                if (ref) itemsInputRefs.current[item.id] = ref;
            }}
        />
    ), [colors, fontScale, currencySymbol, t, updateItem, toggleItemDone, removeItem]);

    if (!visible) return null;

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            {/* Modal de Confirmación de Borrado */}
            {delettingBudget && <WarningMessage
                message={t('budget_form.warnings.delete_confirmation')}
                onClose={() => setDelettingBudget(false)}
                onSubmit={() => {
                    if (initialData) deleteBudget(initialData.id);
                    setDelettingBudget(false);
                    onClose();
                }}
            />}

            <View style={[styles.container, { backgroundColor: colors.surfaceSecondary }]}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <Animated.View
                        entering={SlideInDown.duration(300)}
                        exiting={SlideOutDown.duration(200)}
                        style={[
                            styles.fullScreenSheet,
                            { backgroundColor: colors.surfaceSecondary, paddingTop: insets.top }
                        ]}
                        accessibilityViewIsModal={true}
                    >
                        {/* 1. HEADER FIJO (Titulo y botones cerrar/guardar) */}
                        <View style={[styles.header, { borderBottomColor: colors.border }]}>
                            <TouchableOpacity
                                onPress={() => {
                                    setCategorySelectorOpen(false);
                                    onClose();
                                }}
                                style={[styles.iconBtn, { backgroundColor: colors.text }]}
                                accessibilityRole="button"
                                accessibilityLabel={t('budget_form.close_modal')}
                            >
                                <MaterialIcons name="close" size={dynamicIconSize} color={colors.surfaceSecondary} />
                            </TouchableOpacity>

                            <Text
                                style={[styles.headerTitle, { color: colors.text }]}
                                accessibilityRole="header"
                                maxFontSizeMultiplier={2}
                                numberOfLines={2}
                                adjustsFontSizeToFit
                            >
                                {initialData ? t('budget_form.title_edit') : t('budget_form.title_new')}
                            </Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                {isFavorite && (
                                    <View accessibilityLabel={t('budget_form.menu.favorite')}>
                                        <MaterialIcons name="star" size={24 * fontScale} color={colors.warning} />
                                    </View>
                                )}

                                {initialData && (
                                    <TouchableOpacity
                                        onPress={() => setMenuVisible(true)}
                                        style={styles.iconBtn}
                                        accessibilityRole="button"
                                        accessibilityLabel={t('budget_form.more_options')}
                                    >
                                        <MaterialIcons name="more-vert" size={dynamicIconSize} color={colors.text} />
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    onPress={handleSaveForm}
                                    style={[styles.iconBtn, { backgroundColor: colors.accent }]}
                                    accessibilityRole="button"
                                    accessibilityLabel={t('budget_form.save_budget')}
                                >
                                    <MaterialIcons name="check" size={dynamicIconSize} color={colors.surfaceSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* 2. MENÚ POPUP (Absoluto, fuera del scroll) */}
                        {menuVisible && (
                            <>
                                <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                                    <View style={styles.menuBackdrop} accessible={false} />
                                </TouchableWithoutFeedback>

                                <Animated.View
                                    entering={FadeIn.duration(150)}
                                    style={[styles.popupMenu, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.text }]}
                                    accessibilityRole="menu"
                                >
                                    <TouchableOpacity
                                        style={styles.menuOption}
                                        onPress={() => handleMenuAction('favorite')}
                                        accessibilityRole="menuitem"
                                        accessibilityState={{ selected: isFavorite }}
                                    >
                                        <MaterialIcons name={isFavorite ? "star" : "star-outline"} size={24} color={isFavorite ? colors.warning : colors.text} />
                                        <Text style={[styles.menuOptionText, { color: colors.text }]}>{t('budget_form.menu.favorite')}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.menuOption}
                                        onPress={() => handleMenuAction('convert')}
                                        accessibilityRole="menuitem"
                                    >
                                        <MaterialIcons name="transform" size={20} color={colors.text} />
                                        <Text style={[styles.menuOptionText, { color: colors.text }]}>{t('budget_form.menu.convert_transaction')}</Text>
                                    </TouchableOpacity>

                                    <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

                                    <TouchableOpacity
                                        style={styles.menuOption}
                                        onPress={() => handleMenuAction('delete')}
                                        disabled={isFavorite}
                                        accessibilityRole="menuitem"
                                        accessibilityState={{ disabled: isFavorite }}
                                    >
                                        <MaterialIcons name="delete-outline" size={20} color={isFavorite ? colors.text + "50" : colors.expense} />
                                        <Text style={[styles.menuOptionText, { color: isFavorite ? colors.text + "50" : colors.expense }]}>{t('budget_form.menu.delete')}</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </>
                        )}

                        {/* 3. SELECTOR DE CATEGORÍA (Se muestra por encima de la lista) */}
                        <CategorySelectorPopover
                            selectedCategory={selectedCategory}
                            popoverOpen={categorySelectorOpen}
                            handleClosePopover={() => setCategorySelectorOpen(false)}
                            handleSelectCategory={handleSelectCategory}
                            handleDisableCategory={handleDisableCategory}
                            colors={colors}
                            defaultCategories={defaultCategoriesOptions}
                            userActivesCategories={userActivesCategoriesOptions}
                        />

                        <FlatList
                            data={items}
                            keyExtractor={(item) => item.id}

                            // Todo el formulario superior es el Header
                            ListHeaderComponent={renderListHeader()}

                            // Renderiza cada BudgetItem
                            renderItem={renderItem}

                            // --- OPTIMIZACIONES DE RENDIMIENTO ---
                            initialNumToRender={10} // Renderiza pocos al abrir
                            maxToRenderPerBatch={10} // Lotes pequeños al scrollear
                            windowSize={5} // Mantiene en memoria 5 "pantallas" de items (arriba/abajo)
                            removeClippedSubviews={Platform.OS === 'android'} // Desmonta views fuera de pantalla (Vital para Android)

                            // --- ESTILOS ---
                            scrollEnabled={!categorySelectorOpen}
                            contentContainerStyle={[
                                styles.scrollContent,
                                { paddingBottom: insets.bottom + 150 } // Espacio al final
                            ]}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        />

                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    fullScreenSheet: { flex: 1 },

    // Header con layout flexible
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        zIndex: 10,
        minHeight: 60,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'FiraSans-Bold',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Menú
    menuBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 },
    popupMenu: {
        position: 'absolute',
        top: 65,
        right: 15,
        width: 240,
        borderRadius: 12,
        borderWidth: 1,
        paddingVertical: 5,
        zIndex: 100,
    },
    menuOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 15, minHeight: 48 },
    menuOptionText: { fontSize: 16, marginLeft: 12, fontFamily: 'FiraSans-Regular', flexShrink: 1 },
    menuDivider: { height: 1, marginVertical: 5 },

    // Categoría Selector Wrapper
    categorySelectorContainer: { paddingHorizontal: 20, marginVertical: 10 },
    closeSelectorBtn: {
        width: "100%",
        minHeight: 52,
        marginTop: 10,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 10
    },

    // Contenido
    scrollContent: { padding: 5, flexGrow: 1 },
    sectionBox: { width: '100%', borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 0.5 },
    label: { fontSize: 12, fontFamily: 'Tinos-Bold', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },

    // Inputs Principales
    nameInputContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    inputLarge: { 
        fontSize: 20,
        flex: 1,
        borderWidth: 0.5,
        borderRadius: 8, 
        paddingHorizontal: 12,
        fontFamily: 'FiraSans-Bold', 
        paddingVertical: 10,
        textAlignVertical: 'center',
        minHeight: 48 
    },
    inputMedium: { 
        paddingHorizontal: 12, 
        fontSize: 18,
        fontFamily: 'FiraSans-Regular', 
        borderWidth: 0.5,
        borderRadius: 8,
        paddingVertical: 10,
        minHeight: 48 
    },

    // Layout Flexible
    rowWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        gap: 15,
        marginTop: 10
    },
    flexItem: { flex: 1, minWidth: 140 },
    displayTotal: { fontSize: 22, fontFamily: 'FiraSans-Bold', paddingVertical: 5, textAlign: 'right' },

    // Items
    itemsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5, flexWrap: 'wrap', gap: 10 },
    sectionTitle: { fontSize: 20, fontFamily: 'FiraSans-Regular' },
    itemsCounter: { borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
    addButtonSmall: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, minHeight: 44, borderWidth: 1 },
    addButtonText: { fontFamily: 'FiraSans-Regular', marginLeft: 6 },
});