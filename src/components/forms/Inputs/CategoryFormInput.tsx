import React, { useState, useRef, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet,
    ScrollView,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
    useAnimatedStyle, 
    useSharedValue, 
    withSpring, 
    FadeInLeft, 
    FadeInRight,
    FadeInDown
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as uuid from 'uuid';
import { darkTheme, lightTheme } from '../../../theme/colors';
import { COLOR_PICKER_PALETTE, defaultCategories } from '../../../constants/categories';
import { ICON_OPTIONS } from '../../../constants/icons';
import { TransactionType } from '../../../types/schemas';
import { useAuthStore } from '../../../stores/authStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import useCategoriesStore from '../../../stores/useCategoriesStore';
import { Category } from '../../../interfaces/data.interface';

interface CreateCategoryFormProps {
    type: TransactionType;
    closeInput: () => void;
    setSelectingMyCategories: (value: boolean) => void;
    categoryToEdit?: Category | null; // NUEVA PROP OPCIONAL
}

export default function CreateCategoryForm({
    type,
    closeInput,
    setSelectingMyCategories,
    categoryToEdit // Recibimos la categoría a editar
}: CreateCategoryFormProps) {
    const { t } = useTranslation();
    
    // 1. OBTENER DATOS DE STORES
    const { user } = useAuthStore();
    const theme = useSettingsStore(state => state.theme);
    const iconsOptions = useSettingsStore(state => state.iconsOptions);
    const { addCategory, updateCategory } = useCategoriesStore(); // Asegúrate de importar updateCategory
    const colors = theme === 'dark' ? darkTheme : lightTheme;

    // 2. ESTADOS LOCALES
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLOR_PICKER_PALETTE[0]);
    // selectedCategory aquí se refiere al OBJETO ICONO que seleccionamos de la lista predeterminada
    // para extraer su nombre de icono.
    const [selectedIconItem, setSelectedIconItem] = useState<Category | null>(null);
    const [isNameTouched, setIsNameTouched] = useState(false);

    // Refs y Animaciones
    const inputRef = useRef<TextInput>(null);
    const scale = useSharedValue(1);

    const handlePressIn = () => { scale.value = withSpring(0.95); };
    const handlePressOut = () => { scale.value = withSpring(1); };
    const animatedIconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    // --- EFECTO PARA CARGAR DATOS EN MODO EDICIÓN ---
    useEffect(() => {
        if (categoryToEdit) {
            setName(categoryToEdit.name);
            setSelectedColor(categoryToEdit.color || COLOR_PICKER_PALETTE[0]);
            setIsNameTouched(true);

            // Necesitamos encontrar el objeto "item" de la lista por defecto que coincida con el icono
            // para que se marque visualmente en la grilla.
            const allDefaultIcons = Object.values(defaultCategories).flat();
            const foundIconItem = allDefaultIcons.find(cat => cat.icon === categoryToEdit.icon);

            // Si no encontramos el exacto, creamos uno temporal solo para que la UI funcione
            // o seleccionamos null si no importa.
            if (foundIconItem) {
                setSelectedIconItem(foundIconItem);
            } else {
                // Fallback visual si el icono no está en la lista default actual
                setSelectedIconItem({ ...categoryToEdit, id: 'temp' });
            }
        }
    }, [categoryToEdit]);

    // 3. VALIDACIÓN
    const isNameValid = name.trim().length > 0;
    // En modo edición, selectedIconItem puede venir precargado
    const isIconValid = selectedIconItem !== null; 
    const isFormValid = isNameValid && isIconValid;
    const isEditMode = !!categoryToEdit; // Helper booleano

    // 4. LÓGICA DE GUARDADO (CREAR O ACTUALIZAR)
    const handleSubmit = () => {
        if (!isFormValid || !user) return;

        if (isEditMode && categoryToEdit) {
            // === MODO ACTUALIZAR ===
            const updatedCat: Category = {
                ...categoryToEdit, // Mantenemos ID original
                name: name.trim(),
                icon: selectedIconItem?.icon || categoryToEdit.icon,
                color: selectedColor,
                // type y userId no deberían cambiar usualmente
            };
            updateCategory(categoryToEdit.id, updatedCat);
        } else {
            // === MODO CREAR ===
            const newCategory: Category = {
                id: uuid.v4(),
                name: name.trim(),
                icon: selectedIconItem?.icon || '',
                color: selectedColor,
                type: type,
                userId: user.id,
            };
            addCategory(newCategory);
        }
        
        // Reset y Cierre
        resetForm();
        closeInput();
        setSelectingMyCategories(true);
    };

    const resetForm = () => {
        setName('');
        setSelectedIconItem(null);
        setSelectedColor(COLOR_PICKER_PALETTE[0]);
        setIsNameTouched(false);
        Keyboard.dismiss();
    }

    // Icono seleccionado para preview
    const SelectedIconComponent = ICON_OPTIONS[iconsOptions].find(icon => icon.label === selectedIconItem?.icon)?.icon || null;

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView 
                contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* HEADER: TÍTULO DINÁMICO */}
                <Text
                    style={[styles.headerTitle, { color: colors.text }]}
                    maxFontSizeMultiplier={2}
                    accessibilityRole="header"
                >
                    {isEditMode ? t('categories.edit', 'Edit Category') : t('categories.createNew')}
                </Text>

                {/* SECCIÓN 1: INPUT Y PREVIEW */}
                <View style={styles.topInputContainer}>
                    {/* PREVIEW ICONO */}
                    <View style={styles.iconColumn}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            {t('common.icon', 'ICON')} {selectedIconItem ? '✓' : '*'}
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                        >
                            <Animated.View entering={FadeInLeft} style={styles.iconContainerShadow}>
                                <Animated.View style={animatedIconStyle}>
                                    <LinearGradient
                                        colors={[selectedColor, selectedColor]} 
                                        style={[styles.gradient, { borderColor: colors.border }]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        {SelectedIconComponent ? (
                                            <SelectedIconComponent size={32} color={colors.text} style={{
                                                width: iconsOptions === 'painted' ? 60 : 32,
                                                height: iconsOptions === 'painted' ? 60 : 32,
                                                backgroundColor: iconsOptions === 'painted' ? 'transparent' : colors.surface,
                                                borderRadius: iconsOptions === 'painted' ? 0 : 50,
                                                padding: iconsOptions === 'painted' ? 0 : 4,
                                            }} />
                                        ) : (
                                                <MaterialIcons name="add-photo-alternate" size={32} color={colors.text} style={{
                                                    backgroundColor: colors.surfaceSecondary,
                                                    borderRadius: 50,
                                                    padding: 5,
                                                }} />
                                        )}
                                    </LinearGradient>
                                </Animated.View>
                            </Animated.View>
                        </TouchableOpacity>
                    </View>

                    {/* INPUT NOMBRE */}
                    <View style={styles.inputColumn}>
                        <View style={styles.labelContainer}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                {t('auth.name', 'NAME')} *
                            </Text>
                            {!isNameValid && isNameTouched && (
                                <Text style={[styles.errorText, { color: colors.expense }]}>
                                    {t('commonWarnings.requiredField')}
                                </Text>
                            )}
                        </View>

                        <Animated.View
                            entering={FadeInRight}
                            style={[
                                styles.inputWrapper,
                                { backgroundColor: colors.surface, borderColor: isNameTouched && !isNameValid ? colors.expense : colors.border }
                            ]}
                        >
                            <TextInput
                                ref={inputRef}
                                value={name}
                                onChangeText={(text) => {
                                    setName(text);
                                    if (!isNameTouched) setIsNameTouched(true);
                                }}
                                onBlur={() => setIsNameTouched(true)}
                                placeholder={t('auth.name', 'Name')}
                                maxLength={30}
                                placeholderTextColor={colors.textSecondary}
                                style={[styles.input, { color: colors.text }]}
                                returnKeyType="done"
                            />
                        </Animated.View>
                    </View>
                </View>

                {/* SECCIÓN 3: COLOR PICKER */}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        {t('common.color')}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
                        {COLOR_PICKER_PALETTE.map((color) => (
                            <TouchableOpacity
                                key={color}
                                onPress={() => setSelectedColor(color)}
                                style={[
                                    styles.colorCircle,
                                    { backgroundColor: color },
                                    selectedColor === color && styles.colorCircleSelected
                                ]}
                            >
                                {selectedColor === color && <MaterialIcons name="circle" size={24} color={colors.surfaceSecondary} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* SECCIÓN 4: ICON GRID */}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        {t('common.selectIcon')}
                    </Text>
                    <View style={styles.iconGrid}>
                        {Object.values(defaultCategories).flat().map((item: Category) => {
                            // Usamos el nombre del icono para comparar
                            const isSelected = selectedIconItem?.icon === item.icon;
                            const IconComp = ICON_OPTIONS[iconsOptions].find(icon => icon.label === item.icon)?.icon || null;
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => {
                                        setSelectedIconItem(item);
                                        Keyboard.dismiss();
                                    }}
                                    style={[
                                        styles.iconItem,
                                        {
                                            borderColor: iconsOptions === 'painted' ? 'transparent' : colors.border, padding: iconsOptions === 'painted' ? 0 : 12,
                                        },
                                        isSelected && { backgroundColor: selectedColor },
                                    ]}
                                >
                                    {IconComp && <IconComp size={24} color={colors.text} style={{
                                        width: iconsOptions === 'painted' ? 55 : 32,
                                        height: iconsOptions === 'painted' ? 55 : 32,
                                        backgroundColor: iconsOptions === 'painted' ? 'transparent' : colors.surface,
                                        borderRadius: iconsOptions === 'painted' ? 0 : 50,
                                        padding: iconsOptions === 'painted' ? 0 : 4,
                                    }} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* FOOTER: BOTÓN ACCIÓN */}
            <Animated.View
                entering={FadeInDown.delay(200)}
                style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}
            >
                <TouchableOpacity
                    style={[
                        styles.createButton,
                        {
                            backgroundColor: isFormValid ? selectedColor : colors.border,
                            opacity: isFormValid ? 1 : 0.6
                        }
                    ]}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                    disabled={!isFormValid}
                >
                    <Text style={[styles.createButtonText, { color: isFormValid ? '#FFF' : colors.textSecondary }]}>
                        {isEditMode ? t('common.save', 'Save') : t('common.create', 'Create')}
                    </Text>
                    {isFormValid && <MaterialIcons name={isEditMode ? "save" : "check"} size={24} color="#FFF" />}
                </TouchableOpacity>
            </Animated.View>
        </KeyboardAvoidingView>
    );
}

// ... styles se mantienen igual (omito para ahorrar espacio, usa los mismos de antes)
const styles = StyleSheet.create({
    // Copia los estilos de tu archivo original aquí
    scrollContainer: { padding: 20, paddingBottom: 40 },
    headerTitle: { fontSize: 28, fontFamily: 'Tinos-Italic', marginBottom: 24, flexWrap: 'wrap' },
    topInputContainer: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', marginBottom: 24 },
    iconColumn: { alignItems: 'center', gap: 8 },
    iconContainerShadow: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 6 },
    gradient: { width: 68, height: 68, borderRadius: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    inputColumn: { flex: 1 },
    labelContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' },
    label: { fontSize: 12, fontFamily: 'FiraSans-Bold', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 4 },
    errorText: { fontSize: 11, fontFamily: 'FiraSans-Regular' },
    inputWrapper: { minHeight: 68, borderRadius: 22, borderWidth: 1.5, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 10 },
    input: { fontSize: 20, fontFamily: 'FiraSans-Regular', paddingVertical: 0 },
    sectionContainer: { marginBottom: 24 },
    sectionTitle: { fontSize: 14, fontFamily: 'FiraSans-Bold', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
    colorRow: { gap: 12, paddingHorizontal: 2, paddingBottom: 10 },
    colorCircle: { width: 44, height: 44, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    colorCircleSelected: { borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 4 },
    iconGrid: { width: '100%', flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 20 },
    iconItem: { width: 58, height: 58, aspectRatio: 1, borderRadius: 250, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    footer: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0 },
    createButton: { minHeight: 56, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 8, paddingHorizontal: 16 },
    createButtonText: { fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }
});