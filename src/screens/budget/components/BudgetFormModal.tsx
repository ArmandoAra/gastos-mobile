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
    FlatList,
    ListRenderItemInfo,
} from "react-native";
import { useState, useCallback, useMemo, useRef } from "react";
import Animated, { FadeIn, FadeInDown, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeColors } from '../../../types/navigation';
import { ExpenseBudget, Item } from "../../../interfaces/data.interface";
import * as useBudgetForm from "../hooks/useBudgetForm";
import WarningMessage from "../../transactions/components/WarningMessage";
import useBudgetsStore, { ToConvertBudget } from "../../../stores/useBudgetStore";
import { useTranslation } from "react-i18next";
import { CategoryIconSelector } from "./CategoryIconSelector";
import { useAuthStore } from "../../../stores/authStore";
import { BudgetItem } from "./BudgetItem";
import { useSettingsStore } from "../../../stores/settingsStore";
import { InputNameActive } from "../../../interfaces/settings.interface";
import CategorySelectorPopover from "../../../components/forms/Inputs/CategorySelector";
import { useTransactionForm } from "../../transactions/constants/hooks/useTransactionForm";
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles } from "../../../theme/global.styles";
import { BudgetFormNav } from "./BudgetFormNav";
import { BudgetFormSection } from "./BudgetFormSection";
import { ItemsHeaderRow } from "./ItemsHeaderRow";
import { SwipeDelete } from "../../../components/buttons/SwipeDelete";
import { CategoryAndName } from "./CategoryAndName";

// ─── COMPONENTES EXTERNOS ────────────────────────────────────────────────────

// ─── MODAL PRINCIPAL ─────────────────────────────────────────────────────────

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
    const theme = useSettingsStore((state) => state.theme);
    const { t } = useTranslation();

    const [menuVisible, setMenuVisible] = useState(false);
    const [delettingBudget, setDelettingBudget] = useState(false);
    const [stickyVisible, setStickyVisible] = useState(false);
    const formHeightRef = useRef(0);

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

    const isOverBudget = totalSpent > (parseFloat(budgetedAmount) || 0);

    // ── ACCIONES ──
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

    const handleAddItemRef = useRef(handleAddItem);
    handleAddItemRef.current = handleAddItem;
    const stableOnAddItem = useCallback(() => handleAddItemRef.current(), []);

    // ── LIST HEADER (Formulario + Cabecera Original) ──
    const ListHeader = useCallback(() => (
        <>
            <BudgetFormSection
                colors={colors}
                name={name}
                setName={setName}
                budgetedAmount={budgetedAmount}
                setBudgetedAmount={setBudgetedAmount}
                totalSpent={totalSpent}
                isOverBudget={isOverBudget}
                currencySymbol={currencySymbol}
                selectedCategory={selectedCategory}
                categorySelectorOpen={categorySelectorOpen}
                setCategorySelectorOpen={setCategorySelectorOpen}
                t={t}
            />
            <ItemsHeaderRow
                colors={colors}
                itemCount={items.length}
                fontScale={fontScale}
                title={t('budget_form.items.section_title')}
                addLabel={t('budget_form.items.add_button')}
                onAddItem={stableOnAddItem}
            />
        </>
    ), [colors, name, budgetedAmount, totalSpent, selectedCategory, currencySymbol, t, setName, setBudgetedAmount, categorySelectorOpen, setCategorySelectorOpen, isOverBudget, items.length, fontScale, stableOnAddItem]);

    if (!visible) return null;

    return (
        <Modal animationType="none" transparent={true} visible={visible} onRequestClose={onClose} statusBarTranslucent>
            {delettingBudget && (
                <WarningMessage
                    message={t('budget_form.warnings.delete_confirmation')}
                    onClose={() => setDelettingBudget(false)}
                    onSubmit={() => {
                        if (initialData) deleteBudget(initialData.id);
                        setDelettingBudget(false);
                        onClose();
                    }}
                />
            )}

            <LinearGradient
                colors={[colors.surfaceSecondary, theme === 'dark' ? colors.primary : colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={globalStyles.screenContainer}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <Animated.View
                        entering={SlideInDown.duration(300)}
                        exiting={SlideOutDown.duration(200)}
                        style={[styles.fullScreenSheet, { paddingTop: insets.top }]}
                    >
                        {/* 1. NAVEGACIÓN SUPERIOR */}
                        <BudgetFormNav
                            colors={colors}
                            dynamicIconSize={dynamicIconSize}
                            fontScale={fontScale}
                            isEditMode={!!initialData}
                            isFavorite={isFavorite}
                            setMenuVisible={setMenuVisible}
                            onClose={onClose}
                            onSave={handleSaveForm}
                            setCategorySelectorOpen={setCategorySelectorOpen}
                            t={t}
                        />

                        {/* 2. MENU POPUP */}
                        {menuVisible && (
                            <>
                                <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                                    <View style={headerStyles.menuBackdrop} />
                                </TouchableWithoutFeedback>
                                <Animated.View entering={FadeInDown.duration(150).springify()} style={[headerStyles.popupMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <TouchableOpacity style={headerStyles.menuOption} onPress={() => handleMenuAction('favorite')}>
                                        <View style={[headerStyles.menuOptionIcon, { backgroundColor: colors.warning + '22' }]}>
                                            <MaterialIcons name={isFavorite ? "star" : "star-outline"} size={18} color={colors.warning} />
                                        </View>
                                        <Text style={[headerStyles.menuOptionText, { color: colors.text }]}>{t('budget_form.menu.favorite')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={headerStyles.menuOption} onPress={() => handleMenuAction('convert')}>
                                        <View style={[headerStyles.menuOptionIcon, { backgroundColor: colors.accent + '22' }]}>
                                            <MaterialIcons name="transform" size={18} color={colors.accent} />
                                        </View>
                                        <Text style={[headerStyles.menuOptionText, { color: colors.text }]}>{t('budget_form.menu.convert_transaction')}</Text>
                                    </TouchableOpacity>
                                    <View style={[headerStyles.menuDivider, { backgroundColor: colors.border }]} />
                                    <TouchableOpacity style={headerStyles.menuOption} onPress={() => handleMenuAction('delete')} disabled={isFavorite}>
                                        <View style={[headerStyles.menuOptionIcon, { backgroundColor: isFavorite ? colors.border + '44' : colors.expense + '22' }]}>
                                            <MaterialIcons name="delete-outline" size={18} color={isFavorite ? colors.textSecondary : colors.expense} />
                                        </View>
                                        <Text style={[headerStyles.menuOptionText, { color: isFavorite ? colors.textSecondary : colors.expense }]}>{t('budget_form.menu.delete')}</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </>
                        )}

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

                        {/* 3. CONTENEDOR DE LA LISTA Y EL STICKY */}
                        <View style={[headerStyles.sectionBox, { backgroundColor: colors.surface }]}>
                            <CategoryAndName
                                colors={colors}
                                name={name}
                                setName={setName}
                                categorySelectorOpen={categorySelectorOpen}
                                setCategorySelectorOpen={setCategorySelectorOpen}
                                selectedCategory={selectedCategory}
                                t={t}
                            />
                        </View>
                        <View style={{ flex: 1, position: 'relative' }}>
                            {/* CLAVE DEL FIX: Aparece sin animación y usa position absolute para no mover la FlatList */}

                            <FlatList<Item>
                                data={items}
                                keyExtractor={(item) => item.id}
                                ListHeaderComponent={<ListHeader />}
                                renderItem={({ item }) => (
                                    <BudgetItem
                                        item={item}
                                        colors={colors}
                                        fontScale={fontScale}
                                        currencySymbol={currencySymbol}
                                        t={t}
                                        onUpdate={updateItem}
                                        onToggle={toggleItemDone}
                                        onRemove={removeItem}
                                        onSetRef={(ref) => { if (ref) itemsInputRefs.current[item.id] = ref; }}
                                    />
                                )}
                                scrollEventThrottle={16}
                                initialNumToRender={10}
                                maxToRenderPerBatch={10}
                                windowSize={5}
                                removeClippedSubviews={Platform.OS === 'android'}
                                scrollEnabled={!categorySelectorOpen}
                                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 150 }]}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </Modal>
    );
};

// ─── ESTILOS ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    fullScreenSheet: { flex: 1 },
    scrollContent: { padding: 12, flexGrow: 1 },
    externalStickyWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
    },
});

const headerStyles = StyleSheet.create({
    sectionBox: { borderRadius: 18, paddingHorizontal: 20, paddingVertical: 16, marginBottom: 4, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, gap: 14 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, zIndex: 10, minHeight: 64, gap: 10 },
    headerTitle: { fontSize: 16, fontFamily: 'FiraSans-Bold', flex: 1, textAlign: 'center' },
    headerIconBtn: { width: 40, height: 40, borderRadius: 50, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    menuBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 },
    popupMenu: { position: 'absolute', top: 70, right: 16, width: 230, borderRadius: 16, borderWidth: 1, paddingVertical: 6, zIndex: 100, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 8 },
    menuOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, minHeight: 48, gap: 12 },
    menuOptionIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    menuOptionText: { fontSize: 14, fontFamily: 'FiraSans-Regular', flex: 1 },
    menuDivider: { height: 1, marginVertical: 4, marginHorizontal: 14 },
});
