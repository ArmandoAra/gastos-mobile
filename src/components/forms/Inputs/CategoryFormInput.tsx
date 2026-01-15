import React, { useState, useRef, useMemo } from 'react';
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
    AccessibilityInfo
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
import useMessage from '../../../stores/useMessage';
import { MessageType } from '../../../interfaces/message.interface';

interface CreateCategoryFormProps {
    type: TransactionType;
    closeInput: () => void;
}

export default function CreateCategoryForm({ type, closeInput }: CreateCategoryFormProps) {
    const { t } = useTranslation();
    const { showMessage } = useMessage();
    
    // 1. OBTENER DATOS DE STORES
    const { user } = useAuthStore();
    const { theme } = useSettingsStore();
    const { addCategory } = useCategoriesStore();
    const colors = theme === 'dark' ? darkTheme : lightTheme;

    // 2. ESTADOS LOCALES
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLOR_PICKER_PALETTE[0]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isNameTouched, setIsNameTouched] = useState(false); // Para saber si el usuario ya intentó escribir

    // Refs y Animaciones
    const inputRef = useRef<TextInput>(null);
    const scale = useSharedValue(1);

    const handlePressIn = () => { scale.value = withSpring(0.95); };
    const handlePressOut = () => { scale.value = withSpring(1); };
    const animatedIconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    // 3. VALIDACIÓN (Derivada)
    const isNameValid = name.trim().length > 0;
    const isIconValid = selectedCategory !== null;
    const isFormValid = isNameValid && isIconValid;

    // 4. LÓGICA DE GUARDADO
    const handleCreate = () => {
        if (!isFormValid || !user) return; // Doble check de seguridad

        const newCategory = {
            id: uuid.v4(),
            name: name.trim(),
            icon: selectedCategory?.icon || '', 
            color: selectedColor,
            type: type,
            userId: user.id,
        };

        addCategory(newCategory);
        
        // Reset del formulario
        setName('');
        setSelectedCategory(null);
        setSelectedColor(COLOR_PICKER_PALETTE[0]);
        setIsNameTouched(false);
        Keyboard.dismiss();


        // Anuncio de accesibilidad para lectores de pantalla
        if (Platform.OS !== 'web') {
            showMessage(MessageType.SUCCESS, t('categories.createdSuccess'));
            AccessibilityInfo.announceForAccessibility(t('categories.createdSuccess'));
        }
        // Cerrar el formulario
        closeInput();
    };

    // Componente de Icono seleccionado para el preview
    const SelectedIconComponent = ICON_OPTIONS.find(icon => icon.label === selectedCategory?.icon)?.icon || null;

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
                {/* === HEADER: TÍTULO === */}
                <Text
                    style={[styles.headerTitle, { color: colors.text }]}
                    maxFontSizeMultiplier={2} // Permite crecer x2
                    accessibilityRole="header"
                >
                    {t('categories.createNew')}
                </Text>

                {/* === SECCIÓN 1: INPUT Y PREVIEW === */}
                <View style={styles.topInputContainer}>
                    
                    {/* PREVIEW ICONO (Izquierda) */}
                    <View style={styles.iconColumn}>
                        <Text
                            style={[styles.label, { color: colors.textSecondary }]}
                            maxFontSizeMultiplier={1.5}
                        >
                            {t('common.icon', 'ICON')} {selectedCategory ? '✓' : '*'}
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            accessibilityLabel={t('accessibility.selected_icon_preview')}
                            accessibilityHint={selectedCategory ? t('common.selected') : t('validation.iconRequired')}
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
                                                backgroundColor: colors.surfaceSecondary,
                                                borderRadius: 50,
                                                padding: 5,
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

                    {/* INPUT NOMBRE (Derecha) */}
                    <View style={styles.inputColumn}>
                        <View style={styles.labelContainer}>
                            <Text
                                style={[styles.label, { color: colors.textSecondary }]}
                                maxFontSizeMultiplier={1.5}
                            >
                                {t('auth.name', 'NAME')} *
                            </Text>
                            {/* Mensaje de error INLINE (sin Alert) */}
                            {!isNameValid && isNameTouched && (
                                <Text
                                    style={[styles.errorText, { color: colors.expense }]}
                                    maxFontSizeMultiplier={1.5}
                                >
                                    {t('validation.required')}
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
                                accessibilityLabel={t('auth.name', 'Name')}
                                accessibilityHint={t('categories.inputNameHint')}
                                // Importante para Dynamic Type:
                                multiline={false}
                                allowFontScaling={true} 
                            />
                        </Animated.View>
                    </View>
                </View>

                
                {/* === SECCIÓN 3: COLOR PICKER === */}
                <View style={styles.sectionContainer}>
                    <Text
                        style={[styles.sectionTitle, { color: colors.textSecondary }]}
                        maxFontSizeMultiplier={1.5}
                    >
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
                                accessibilityLabel={`${t('common.color')} ${color}`}
                                accessibilityRole="radio"
                                accessibilityState={{ selected: selectedColor === color }}
                            >
                                {selectedColor === color && <MaterialIcons name="circle" size={24} color={colors.surfaceSecondary} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* === SECCIÓN 4: ICON GRID === */}
                <View style={styles.sectionContainer}>
                    <Text
                        style={[styles.sectionTitle, { color: colors.textSecondary }]}
                        maxFontSizeMultiplier={1.5}
                    >
                        {t('common.selectIcon')}
                    </Text>
                    <View style={styles.iconGrid}>
                        {Object.values(defaultCategories).flat().map((item: Category) => {
                            const isSelected = selectedCategory?.id === item.id;
                            const IconComp = ICON_OPTIONS.find(icon => icon.label === item.icon)?.icon || null;
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => {
                                        setSelectedCategory(item);
                                        Keyboard.dismiss();
                                    }}
                                    style={[
                                        styles.iconItem,
                                        { backgroundColor: colors.surface, borderColor: colors.border },
                                        isSelected && { backgroundColor: selectedColor }
                                    ]}
                                    accessibilityLabel={`${t('common.icon')} ${item.name}`}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: isSelected }}
                                >
                                    {IconComp && <IconComp size={24} color={colors.text} style={{
                                        backgroundColor: colors.surfaceSecondary,
                                        borderRadius: 50,
                                        padding: 5,
                                    }} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ESPACIO EXTRA PARA EL BOTÓN */}
                <View style={{ height: 120 }} />

            </ScrollView>

            {/* === FOOTER: BOTÓN CREAR === */}
            <Animated.View
                entering={FadeInDown.delay(200)}
                style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}
            >
                <TouchableOpacity
                    style={[
                        styles.createButton,
                        {
                            // Color dinámico o gris si está deshabilitado
                            backgroundColor: isFormValid ? selectedColor : colors.border,
                            opacity: isFormValid ? 1 : 0.6
                        }
                    ]}
                    onPress={handleCreate}
                    activeOpacity={0.8}
                    disabled={!isFormValid} // Desactiva el botón
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !isFormValid }}
                    accessibilityLabel={t('common.create')}
                    accessibilityHint={!isFormValid ? t('validation.completeAllFields') : undefined}
                >
                    <Text
                        style={[styles.createButtonText, { color: isFormValid ? '#FFF' : colors.textSecondary }]}
                        maxFontSizeMultiplier={1.3}
                    >
                        {t('common.create')}
                    </Text>
                    {isFormValid && <MaterialIcons name="check" size={24} color="#FFF" />}
                </TouchableOpacity>
            </Animated.View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 24,
        flexWrap: 'wrap', // Permite que el título baje de línea si la fuente es enorme
    },
    topInputContainer: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'flex-start', // Importante: Align start para que si uno crece, el otro no se deforme
        marginBottom: 24,
    },
    iconColumn: {
        alignItems: 'center',
        paddingTop: 4, // Ajuste visual ligero
    },
    iconContainerShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    gradient: {
        width: 68,
        height: 68,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    inputColumn: {
        flex: 1,
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        flexWrap: 'wrap', // Permite que el error baje de línea si falta espacio
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginLeft: 4,
    },
    errorText: {
        fontSize: 11,
        fontWeight: '600',
    },
    inputWrapper: {
        // height: 68, -> ELIMINADO para soportar texto grande
        minHeight: 68, // NUEVO: Crece si es necesario
        borderRadius: 22,
        borderWidth: 1.5,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10, // Padding vertical para cuando el texto sea multilínea/grande
    },
    input: {
        fontSize: 20,
        fontWeight: '600',
        paddingVertical: 0, // Reset default padding
    },

    // --- SECCIONES COMUNES ---
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 12,
        letterSpacing: 1,
    },

    // --- COLOR PICKER ---
    colorRow: {
        gap: 12,
        paddingHorizontal: 2,
        paddingBottom: 10, // Espacio para la sombra
    },
    colorCircle: {
        width: 44, // Mínimo recomendado para touch target (44x44)
        height: 44,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorCircleSelected: {
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.8)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },

    // --- ICON GRID ---
    iconGrid: {
        width: '100%',
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 20,
    },
    iconItem: {
        width: 58,
        height: 58, // Si el usuario tiene iconos gigantes en configuración, considera usar minWidth/minHeight
        aspectRatio: 1,
        borderRadius: 250,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // --- FOOTER ---
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        borderTopWidth: 1,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    createButton: {
        minHeight: 56, // Usar minHeight para botones
        borderRadius: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
        paddingHorizontal: 16,
    },
    createButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
    }
});