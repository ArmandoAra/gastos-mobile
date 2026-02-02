import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
import { useAuthStore } from '../../../stores/authStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import useCategoriesStore from '../../../stores/useCategoriesStore';
import { Category, TransactionType } from '../../../interfaces/data.interface';
import { IconsOptions } from '../../../../../Gastos/frontend/app/dashboard/constants/icons';

// --- CONSTANTES ---
const SPRING_CONFIG = {
    damping: 12,
    stiffness: 150,
} as const;

const KEYBOARD_AVOID_BEHAVIOR = Platform.select({
    ios: 'padding' as const,
    default: 'height' as const,
});

const MAX_NAME_LENGTH = 30;
const ICON_SIZE = {
    painted: 60,
    regular: 32,
} as const;

// --- INTERFACES ---
interface CreateCategoryFormProps {
    type: TransactionType;
    closeInput: () => void;
    setSelectingMyCategories: (value: boolean) => void;
    categoryToEdit?: Category | null;
}

// --- COMPONENTE DE PREVIEW DE ICONO MEMOIZADO ---
interface IconPreviewProps {
    selectedIconItem: Category | null;
    selectedColor: string;
    colors: any;
    iconsOptions: string;
    onPressIn: () => void;
    onPressOut: () => void;
    animatedStyle: any;
}

const IconPreview = React.memo<IconPreviewProps>(({
    selectedIconItem,
    selectedColor,
    colors,
    iconsOptions,
    onPressIn,
    onPressOut,
    animatedStyle,
}) => {
    const SelectedIconComponent = useMemo(() => {
        if (!selectedIconItem?.icon) return null;
        return ICON_OPTIONS[iconsOptions as keyof typeof ICON_OPTIONS]?.find(
            icon => icon.label === selectedIconItem.icon
        )?.icon || null;
    }, [selectedIconItem?.icon, iconsOptions]);

    const iconStyle = useMemo(() => ({
        width: iconsOptions === 'painted' ? ICON_SIZE.painted : ICON_SIZE.regular,
        height: iconsOptions === 'painted' ? ICON_SIZE.painted : ICON_SIZE.regular,
        backgroundColor: iconsOptions === 'painted' ? 'transparent' : colors.surface,
        borderRadius: iconsOptions === 'painted' ? 0 : 50,
        padding: iconsOptions === 'painted' ? 0 : 4,
    }), [iconsOptions, colors.surface]);

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
        >
            <Animated.View entering={FadeInLeft} style={styles.iconContainerShadow}>
                <Animated.View style={animatedStyle}>
                    <LinearGradient
                        colors={[selectedColor, selectedColor]}
                        style={[styles.gradient, { borderColor: colors.border }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {SelectedIconComponent ? (
                            <SelectedIconComponent
                                size={32}
                                color={colors.text}
                                style={iconStyle}
                            />
                        ) : (
                            <MaterialIcons
                                name="add-photo-alternate"
                                size={32}
                                color={colors.text}
                                style={{
                                    backgroundColor: colors.surfaceSecondary,
                                    borderRadius: 50,
                                    padding: 5,
                                }}
                            />
                        )}
                    </LinearGradient>
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
});

IconPreview.displayName = 'IconPreview';

// --- COMPONENTE DE COLOR PICKER MEMOIZADO ---
interface ColorPickerProps {
    selectedColor: string;
    onSelectColor: (color: string) => void;
    colors: any;
    label: string;
}

const ColorPicker = React.memo<ColorPickerProps>(({
    selectedColor,
    onSelectColor,
    colors,
    label,
}) => {
    return (
        <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                {label}
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.colorRow}
            >
                {COLOR_PICKER_PALETTE.map((color) => (
                    <TouchableOpacity
                        key={color}
                        onPress={() => onSelectColor(color)}
                        activeOpacity={0.7}
                        style={[
                            styles.colorCircle,
                            { backgroundColor: color },
                            selectedColor === color && styles.colorCircleSelected
                        ]}
                    >
                        {selectedColor === color && (
                            <MaterialIcons
                                name="circle"
                                size={24}
                                color={colors.surfaceSecondary}
                            />
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
});

ColorPicker.displayName = 'ColorPicker';

// --- COMPONENTE DE ICONO INDIVIDUAL MEMOIZADO ---
interface IconItemProps {
    item: Category;
    isSelected: boolean;
    selectedColor: string;
    colors: any;
    iconsOptions: string;
    onPress: () => void;
}

const IconItem = React.memo<IconItemProps>(({
    item,
    isSelected,
    selectedColor,
    colors,
    iconsOptions,
    onPress,
}) => {
    const IconComponent = useMemo(() => {
        return ICON_OPTIONS[iconsOptions as keyof typeof ICON_OPTIONS]?.find(
            icon => icon.label === item.icon
        )?.icon || null;
    }, [item.icon, iconsOptions]);

    const iconStyle = useMemo(() => ({
        width: iconsOptions === 'painted' ? 55 : 32,
        height: iconsOptions === 'painted' ? 55 : 32,
        backgroundColor: iconsOptions === 'painted' ? 'transparent' : colors.surface,
        borderRadius: iconsOptions === 'painted' ? 0 : 50,
        padding: iconsOptions === 'painted' ? 0 : 4,
    }), [iconsOptions, colors.surface]);

    const itemStyle = useMemo(() => [
        styles.iconItem,
        {
            borderColor: iconsOptions === 'painted' ? 'transparent' : colors.border,
            padding: iconsOptions === 'painted' ? 0 : 12,
        },
        isSelected && { backgroundColor: selectedColor },
    ], [isSelected, selectedColor, iconsOptions, colors.border]);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={itemStyle}
        >
            {IconComponent && (
                <IconComponent
                    size={24}
                    color={colors.text}
                    style={iconStyle}
                />
            )}
        </TouchableOpacity>
    );
}, (prev, next) => {
    return (
        prev.item.id === next.item.id &&
        prev.isSelected === next.isSelected &&
        prev.selectedColor === next.selectedColor &&
        prev.iconsOptions === next.iconsOptions
    );
});

IconItem.displayName = 'IconItem';

// --- HOOK PERSONALIZADO PARA LÓGICA DE FORMULARIO ---
const useFormLogic = (
    categoryToEdit: Category | null | undefined,
    type: TransactionType,
    user: any,
    addCategory: (category: Category) => void,
    updateCategory: (id: string, category: Category) => void,
    closeInput: () => void,
    setSelectingMyCategories: (value: boolean) => void,
    iconsOptions: string
) => {
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLOR_PICKER_PALETTE[0]);
    const [selectedIconItem, setSelectedIconItem] = useState<Category | null>(null);
    const [isNameTouched, setIsNameTouched] = useState(false);

    const isEditMode = !!categoryToEdit;

    // Cargar datos en modo edición
    useEffect(() => {
        if (categoryToEdit) {
            setName(categoryToEdit.name);
            setSelectedColor(categoryToEdit.color || COLOR_PICKER_PALETTE[0]);
            setIsNameTouched(true);

            const allDefaultIcons = Object.values(defaultCategories).flat();
            const foundIconItem = allDefaultIcons.find(
                cat => cat.icon === categoryToEdit.icon
            );

            setSelectedIconItem(
                foundIconItem || { ...categoryToEdit, id: 'temp' }
            );
        }
    }, [categoryToEdit]);

    // Validaciones memoizadas
    const isNameValid = useMemo(() => name.trim().length > 0, [name]);
    const isIconValid = useMemo(() => selectedIconItem !== null, [selectedIconItem]);
    const isFormValid = useMemo(
        () => isNameValid && isIconValid,
        [isNameValid, isIconValid]
    );

    // Handler de submit optimizado
    const handleSubmit = useCallback(() => {
        if (!isFormValid || !user) return;

        if (isEditMode && categoryToEdit) {
            const updatedCat: Category = {
                ...categoryToEdit, 
                name: name.trim(),
                icon: selectedIconItem?.icon || categoryToEdit.icon,
                color: selectedColor,
            };
            updateCategory(categoryToEdit.id, updatedCat);
        } else {
            const newCategory: Category = {
                id: uuid.v4(),
                name: name.trim(),
                icon: selectedIconItem?.icon || defaultCategories[0].icon,
                color: selectedColor,
                type: type,
                isActive: true,
                userId: user.id,
            };
            addCategory(newCategory);
        }
        
        // Reset
        setName('');
        setSelectedIconItem(null);
        setSelectedColor(COLOR_PICKER_PALETTE[0]);
        setIsNameTouched(false);
        Keyboard.dismiss();

        closeInput();
        setSelectingMyCategories(true);
    }, [
        isFormValid,
        user,
        isEditMode,
        categoryToEdit,
        name,
        selectedIconItem,
        selectedColor,
        type,
        addCategory,
        updateCategory,
        closeInput,
        setSelectingMyCategories,
    ]);

    return {
        name,
        setName,
        selectedColor,
        setSelectedColor,
        selectedIconItem,
        setSelectedIconItem,
        isNameTouched,
        setIsNameTouched,
        isEditMode,
        isNameValid,
        isIconValid,
        isFormValid,
        handleSubmit,
    };
};

// --- COMPONENTE PRINCIPAL ---
export default function CreateCategoryForm({
    type,
    closeInput,
    setSelectingMyCategories,
    categoryToEdit
}: CreateCategoryFormProps) {
    const { t } = useTranslation();

    // Stores
    const { user } = useAuthStore();
    const theme = useSettingsStore(state => state.theme);
    const iconsOptions = useSettingsStore(state => state.iconsOptions);
    const { addCategory, updateCategory } = useCategoriesStore();

    // Theme
    const colors = useMemo(
        () => theme === 'dark' ? darkTheme : lightTheme,
        [theme]
    );

    // Form logic
    const {
        name,
        setName,
        selectedColor,
        setSelectedColor,
        selectedIconItem,
        setSelectedIconItem,
        isNameTouched,
        setIsNameTouched,
        isEditMode,
        isNameValid,
        isFormValid,
        handleSubmit,
    } = useFormLogic(
        categoryToEdit,
        type,
        user,
        addCategory,
        updateCategory,
        closeInput,
        setSelectingMyCategories,
        iconsOptions
    );

    // Refs y Animaciones
    const inputRef = useRef<TextInput>(null);
    const scale = useSharedValue(1);

    const handlePressIn = useCallback(() => {
        scale.value = withSpring(0.95, SPRING_CONFIG);
    }, []);

    const handlePressOut = useCallback(() => {
        scale.value = withSpring(1, SPRING_CONFIG);
    }, []);

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    // Handlers optimizados
    const handleNameChange = useCallback((text: string) => {
        setName(text);
        if (!isNameTouched) setIsNameTouched(true);
    }, [isNameTouched]);

    const handleNameBlur = useCallback(() => {
        setIsNameTouched(true);
    }, []);

    const handleIconSelect = useCallback((item: Category) => {
        setSelectedIconItem(item);
        Keyboard.dismiss();
    }, []);

    // Iconos del grid memoizados
    const gridIcons = useMemo(
        () => Object.values(defaultCategories).flat(),
        []
    );

    // Estilos computados
    const inputWrapperStyle = useMemo(() => [
        styles.inputWrapper,
        {
            backgroundColor: colors.surface,
            borderColor: isNameTouched && !isNameValid ? colors.expense : colors.border
        }
    ], [colors.surface, colors.border, colors.expense, isNameTouched, isNameValid]);

    const buttonStyle = useMemo(() => [
        styles.createButton,
        {
            backgroundColor: isFormValid ? selectedColor : colors.border,
            opacity: isFormValid ? 1 : 0.6
        }
    ], [isFormValid, selectedColor, colors.border]);

    const buttonTextStyle = useMemo(() => [
        styles.createButtonText,
        { color: isFormValid ? '#FFF' : colors.textSecondary }
    ], [isFormValid, colors.textSecondary]);

    const footerStyle = useMemo(() => [
        styles.footer,
        { backgroundColor: colors.background, borderTopColor: colors.border }
    ], [colors.background, colors.border]);

    return (
        <KeyboardAvoidingView 
            behavior={KEYBOARD_AVOID_BEHAVIOR}
            style={styles.container}
        >
            <ScrollView 
                contentContainerStyle={[
                    styles.scrollContainer,
                    { backgroundColor: colors.background }
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* HEADER */}
                <Text
                    style={[styles.headerTitle, { color: colors.text }]}
                    maxFontSizeMultiplier={2}
                    accessibilityRole="header"
                >
                    {isEditMode
                        ? t('categories.edit', 'Edit Category')
                        : t('categories.createNew')
                    }
                </Text>

                {/* PREVIEW E INPUT */}
                <View style={styles.topInputContainer}>
                    {/* PREVIEW ICONO */}
                    <View style={styles.iconColumn}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            {t('common.icon', 'ICON')} {selectedIconItem ? '✓' : '*'}
                        </Text>
                        <IconPreview
                            selectedIconItem={selectedIconItem}
                            selectedColor={selectedColor}
                            colors={colors}
                            iconsOptions={iconsOptions}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            animatedStyle={animatedIconStyle}
                        />
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

                        <Animated.View entering={FadeInRight} style={inputWrapperStyle}>
                            <TextInput
                                ref={inputRef}
                                value={name}
                                onChangeText={handleNameChange}
                                onBlur={handleNameBlur}
                                placeholder={t('auth.name', 'Name')}
                                maxLength={MAX_NAME_LENGTH}
                                placeholderTextColor={colors.textSecondary}
                                style={[styles.input, { color: colors.text }]}
                                returnKeyType="done"
                                autoCorrect={false}
                            />
                        </Animated.View>
                    </View>
                </View>

                {/* COLOR PICKER */}
                <ColorPicker
                    selectedColor={selectedColor}
                    onSelectColor={setSelectedColor}
                    colors={colors}
                    label={t('common.color')}
                />

                {/* ICON GRID */}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        {t('common.selectIcon')}
                    </Text>
                    <View style={styles.iconGrid}>
                        {gridIcons.map((item) => (
                            <IconItem
                                key={item.id}
                                item={item}
                                isSelected={selectedIconItem?.icon === item.icon}
                                selectedColor={selectedColor}
                                colors={colors}
                                iconsOptions={iconsOptions}
                                onPress={() => handleIconSelect(item)}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.spacer} />
            </ScrollView>

            {/* FOOTER */}
            <Animated.View
                entering={FadeInDown.delay(200)}
                style={footerStyle}
            >
                <TouchableOpacity
                    style={buttonStyle}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                    disabled={!isFormValid}
                >
                    <Text style={buttonTextStyle}>
                        {isEditMode
                            ? t('common.save', 'Save')
                            : t('common.create', 'Create')
                        }
                    </Text>
                    {isFormValid && (
                        <MaterialIcons
                            name={isEditMode ? "save" : "check"}
                            size={24}
                            color="#FFF"
                        />
                    )}
                </TouchableOpacity>
            </Animated.View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: 'Tinos-Italic',
        marginBottom: 24,
        flexWrap: 'wrap',
    },
    topInputContainer: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    iconColumn: {
        alignItems: 'center',
        gap: 8,
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
        flexWrap: 'wrap',
    },
    label: {
        fontSize: 12,
        fontFamily: 'FiraSans-Bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginLeft: 4,
    },
    errorText: {
        fontSize: 11,
        fontFamily: 'FiraSans-Regular',
    },
    inputWrapper: {
        minHeight: 68,
        borderRadius: 22,
        borderWidth: 1.5,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    input: {
        fontSize: 20,
        fontFamily: 'FiraSans-Regular',
        paddingVertical: 0,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'FiraSans-Bold',
        textTransform: 'uppercase',
        marginBottom: 12,
        letterSpacing: 1,
    },
    colorRow: {
        gap: 12,
        paddingHorizontal: 2,
        paddingBottom: 10,
    },
    colorCircle: {
        width: 44,
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
        height: 58,
        aspectRatio: 1,
        borderRadius: 250,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    spacer: {
        height: 120,
    },
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
        minHeight: 56,
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
    },
});