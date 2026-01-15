import { MaterialIcons } from "@expo/vector-icons";
import {
    Modal,
    View,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    Text,
    StyleSheet,
} from "react-native";
import Animated, { FadeIn, FadeInRight, SlideInDown, SlideOutDown, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeColors } from '../../../types/navigation';
import { ICON_OPTIONS } from "../../../constants/icons";
import { Category, ExpenseBudget, Item } from "../../../interfaces/data.interface";
import { useTransactionsLogic } from "../../transactions/hooks/useTransactionsLogic";
import BudgetCategorySelector from "./BudgetCategorySelector";

// Importamos nuestro nuevo hook
import { useBudgetForm } from "../hooks/useBudgetForm"; 

export const BudgetFormModal = ({
    visible,
    onClose,
    initialData,
    onSave,
    colors
}: {
    visible: boolean;
    onClose: () => void;
    initialData: ExpenseBudget | null;
    onSave: (data: ExpenseBudget) => void;
    colors: ThemeColors;
}) => {
    const insets = useSafeAreaInsets();

    // 1. Usamos el Hook para obtener toda la lógica
    const {
        name, setName,
        budgetedAmount, setBudgetedAmount,
        items,
        totalSpent,
        categorySelectorOpen, setCategorySelectorOpen,
        dynamicIconSize,
        fontScale,
        userCategoriesOptions,
        defaultCategoriesOptions,
        selectedCategory,
        handleSelectCategory,
        handleAddItem,
        updateItem,
        removeItem,
        handleSaveForm
    } = useBudgetForm({ visible, onClose, initialData });

    if (!visible) return null;

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <Animated.View
                        entering={SlideInDown.duration(300)}
                        exiting={SlideOutDown.duration(200)}
                        style={[
                            styles.fullScreenSheet,
                            { backgroundColor: colors.surfaceSecondary, paddingTop: insets.top }
                        ]}
                    >
                        {/* HEADER */}
                        <View style={[styles.header, { borderBottomColor: colors.border }]}>
                            <TouchableOpacity
                                onPress={onClose}
                                style={[styles.iconBtn, { minHeight: 44, minWidth: 44 }]}
                                accessibilityRole="button"
                                accessibilityLabel="Cerrar modal"
                                accessibilityHint="Cierra el formulario sin guardar"
                            >
                                <MaterialIcons name="close" size={dynamicIconSize} color={colors.text} />
                            </TouchableOpacity>

                            <Text
                                style={[styles.headerTitle, { color: colors.text }]}
                                accessibilityRole="header"
                                maxFontSizeMultiplier={1.5}
                            >
                                {initialData ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
                            </Text>

                            <TouchableOpacity
                                onPress={handleSaveForm}
                                style={[styles.iconBtn, { minHeight: 44, minWidth: 44, backgroundColor: colors.text, borderRadius: 50, justifyContent: 'center', alignItems: 'center' }]}
                                accessibilityRole="button"
                                accessibilityLabel="Guardar presupuesto"
                            >
                                <MaterialIcons name="check" size={dynamicIconSize} color={colors.accent} />
                            </TouchableOpacity>
                        </View>

                        {/* CONTENIDO SCROLLABLE */}
                        {categorySelectorOpen && (
                            <View style={{ paddingHorizontal: 20, marginBottom: 10, marginTop: 10 }}>
                                <BudgetCategorySelector
                                    closeCategorySelector={() => setCategorySelectorOpen(false)}
                                    handleSelectCategory={handleSelectCategory}
                                    selectedCategory={selectedCategory}
                                    colors={colors}
                                    defaultCategories={defaultCategoriesOptions}
                                    userCategories={userCategoriesOptions}
                                />
                                <TouchableOpacity
                                    onPress={() => setCategorySelectorOpen(false)}
                                    style={{ width: "100%", backgroundColor: colors.text, height: 52, marginTop: 10, borderRadius: 12, justifyContent: "center", alignItems: "center" }}
                                >
                                    <Text style={{ color: colors.surfaceSecondary, fontWeight: '600' }}>Cerrar</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <ScrollView
                            scrollEnabled={!categorySelectorOpen}
                            contentContainerStyle={[
                                styles.scrollContent,
                                { paddingBottom: insets.bottom + 150 }
                            ]}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Sección General */}
                            <View style={[styles.sectionBox, { backgroundColor: colors.surface }]}>
                                <View style={{ marginBottom: 15, width: '100%' }}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>NOMBRE PRESUPUESTO</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>

                                        <TextInput
                                            style={[styles.inputLarge, { color: colors.text, minHeight: 44 * fontScale, borderColor: colors.border }]}
                                            placeholder="Ej. Compras Supermercado"
                                            placeholderTextColor={colors.textSecondary}
                                            value={name}
                                            maxLength={40}
                                            onChangeText={setName}
                                            accessibilityLabel="Nombre del presupuesto"
                                            multiline={true}
                                            textAlignVertical="center"
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
                                        <Text style={[styles.label, { color: colors.textSecondary }]}>MONTO OBJETIVO</Text>
                                        <TextInput
                                            style={[styles.inputMedium, { color: colors.text, borderColor: colors.text, borderWidth: 0.5, borderRadius: 8 }]}
                                            placeholder="0.00"
                                            placeholderTextColor={colors.textSecondary}
                                            keyboardType="numeric"
                                            value={budgetedAmount}
                                            onChangeText={setBudgetedAmount}
                                            accessibilityLabel="Monto objetivo del presupuesto"
                                        />
                                    </View>
                                    <View style={[styles.flexItem, { alignItems: 'flex-end' }]}>
                                        <Text style={[styles.label, { color: colors.textSecondary, textAlign: 'right' }]}>TOTAL ACTUAL</Text>
                                        <Text
                                            style={[
                                                styles.displayTotal,
                                                { color: totalSpent > (parseFloat(budgetedAmount) || 0) ? colors.error : colors.accent }
                                            ]}
                                            accessibilityLabel={`Total calculado: ${totalSpent.toFixed(2)}`}
                                        >
                                            ${totalSpent.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Header de Items */}
                            <View style={styles.itemsHeaderRow}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Items</Text>
                                <TouchableOpacity
                                    onPress={handleAddItem}
                                    style={[styles.addButtonSmall, { backgroundColor: colors.text, borderColor: colors.border }]}
                                    accessibilityRole="button"
                                    accessibilityLabel="Agregar nuevo item a la lista"
                                >
                                    <MaterialIcons name="add" size={18 * fontScale} color={colors.surfaceSecondary} />
                                    <Text style={[styles.addButtonText, { fontSize: 14 * fontScale, color: colors.surfaceSecondary }]}>Agregar</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Lista de Items */}
                            {items.map((item: Item) => (
                                <Animated.View
                                    key={item.id}
                                    entering={FadeIn}
                                    style={[styles.itemRow, { backgroundColor: colors.surface }]}
                                >
                                    {/* Fila superior: Nombre y Eliminar */}
                                    <View style={styles.itemRowHeader}>
                                        <TextInput
                                            style={[styles.itemNameInput, { color: colors.text, minHeight: 40 * fontScale }]}
                                            placeholder="Nombre del item"
                                            placeholderTextColor={colors.textSecondary}
                                            value={item.name}
                                            onChangeText={(t) => updateItem(item.id, 'name', t)}
                                            accessibilityLabel={`Nombre del item ${item.name || 'sin nombre'}`}
                                            multiline
                                        />
                                        <TouchableOpacity
                                            onPress={() => removeItem(item.id)}
                                            style={{ padding: 8 }}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Eliminar item ${item.name || 'sin nombre'}`}
                                        >
                                            <MaterialIcons name="delete-outline" size={24 * fontScale} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Fila inferior: Inputs numéricos */}
                                    <View style={styles.itemRowInputs}>
                                        <View style={styles.inputGroup}>
                                            <Text style={[styles.miniLabel, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.5}>Cant.</Text>
                                            <TextInput
                                                style={[styles.inputSmall, { color: colors.text, borderColor: colors.border, minHeight: 40 * fontScale }]}
                                                keyboardType="numeric"
                                                value={item.quantity.toString()}
                                                onChangeText={(t) => updateItem(item.id, 'quantity', parseInt(t) || 0)}
                                                accessibilityLabel={`Cantidad para ${item.name}`}
                                                selectTextOnFocus
                                            />
                                        </View>

                                        <Text style={[styles.operatorText, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>x</Text>

                                        <View style={styles.inputGroup}>
                                            <Text style={[styles.miniLabel, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.5}>Precio</Text>
                                            <TextInput
                                                style={[styles.inputSmall, { color: colors.text, borderColor: colors.border, minHeight: 40 * fontScale }]}
                                                keyboardType="numeric"
                                                placeholder="0"
                                                value={item.price === 0 ? '' : item.price.toString()}
                                                onChangeText={(t) => updateItem(item.id, 'price', parseFloat(t) || 0)}
                                                accessibilityLabel={`Precio unitario para ${item.name}`}
                                                selectTextOnFocus
                                            />
                                        </View>

                                        <Text style={[styles.operatorText, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>=</Text>

                                        <Text
                                            style={[styles.itemTotal, { color: colors.text }]}
                                            accessibilityLabel={`Subtotal: ${(item.price * item.quantity).toFixed(2)}`}
                                        >
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </Text>
                                    </View>
                                </Animated.View>
                            ))}
                        </ScrollView>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

// ... Mantener CategoryIconSelector y Styles exactamente igual ...
const CategoryIconSelector = ({
    handleCategorySelector,
    selectedCategory,
    colors
}: {
    handleCategorySelector: () => void;
    selectedCategory: Category | null;
    colors: ThemeColors;
}) => {
    // ... tu lógica de selector de iconos ...
    const { t } = useTransactionsLogic();
    const scale = useSharedValue(1);
    const { icon: IconCategory } = ICON_OPTIONS.find(icon => icon.label === selectedCategory?.icon) || {};

    const handlePressIn = () => { scale.value = withSpring(0.95); };
    const handlePressOut = () => { scale.value = withSpring(1); };
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCategorySelector}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityRole="button"
            accessibilityLabel={t('accessibility.select_category', 'Select Category')}
            accessibilityHint={selectedCategory ? `${t('common.current')}: ${selectedCategory.name}` : t('common.none_selected')}
        >
            <Animated.View entering={FadeInRight} style={{ minWidth: 48, minHeight: 48, }}>

                <View
                    style={[{
                        minWidth: 48,
                        minHeight: 48,
                        padding: 12,
                        borderRadius: 50,
                        borderWidth: 0.5,
                        justifyContent: 'center',
                        alignItems: 'center',
                        elevation: 5,
                    }, { borderColor: colors.border, backgroundColor: selectedCategory?.color || colors.primary }]}
                >
                    {selectedCategory && IconCategory ? (
                        <IconCategory size={24} color={colors.text} style={{
                            backgroundColor: colors.surfaceSecondary,
                            borderRadius: 50,
                            padding: 5,
                        }} />
                    ) : (
                        <MaterialIcons name="category" size={28} color={colors.textSecondary} />
                    )}
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

// ... Mantener los styles igual ...
const styles = StyleSheet.create({
   // ... Tus estilos existentes
    container: {
        flex: 1,
    },
    fullScreenSheet: {
        flex: 1, 
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        flexShrink: 1, 
        textAlign: 'center',
    },
    iconBtn: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
        flexGrow: 1,
    },
    sectionBox: {
        width: '100%',
        borderRadius: 16,
        padding: 15,
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    inputLarge: {
        fontSize: 22,
        width: '80%',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 10,
        fontWeight: '600',
        padding: 5,
        textAlignVertical: 'center', 
    },
    inputMedium: {
        fontSize: 18,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(128,128,128,0.2)',
        marginVertical: 10,
    },
    rowWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap', 
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 10,
    },
    flexItem: {
        flex: 1,
        minWidth: 120, 
    },
    displayTotal: {
        fontSize: 22,
        fontWeight: 'bold',
        paddingVertical: 5,
        textAlign: 'right',
    },
    itemsHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingHorizontal: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    addButtonSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        minHeight: 36,
    },
    addButtonText: {
        color: '#FFF',
        fontWeight: '600',
        marginLeft: 6,
    },
    itemRow: {
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
    },
    itemRowHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start', 
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    itemNameInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        marginRight: 10,
        textAlignVertical: 'center',
    },
    itemRowInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap', 
        gap: 10,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, 
        minWidth: 90, 
    },
    miniLabel: {
        fontSize: 12,
        marginRight: 8,
    },
    inputSmall: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        flex: 1, 
        minWidth: 50, 
        textAlign: 'center',
    },
    operatorText: {
        marginHorizontal: 5,
        fontSize: 14,
    },
    itemTotal: {
        fontWeight: 'bold',
        fontSize: 16,
        minWidth: 60,
        textAlign: 'right',
    }
});