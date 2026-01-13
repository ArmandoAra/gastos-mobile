import React, { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet,
    ScrollView,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform
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
import { ICON_OPTIONS, IconOption } from '../../../constants/icons';
import { TransactionType } from '../../../types/schemas';
import { useAuthStore } from '../../../stores/authStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import useCategoriesStore from '../../../stores/useCategoriesStore';
import { InputNameActive } from '../../../interfaces/settings.interface';
import { Category } from '../../../interfaces/data.interface';
import { set } from 'date-fns';



export default function CreateCategoryForm({type}: {type: TransactionType}) {
    const { t } = useTranslation();
    
    // 1. OBTENER DATOS DE STORES (Sin Props)
    const { user } = useAuthStore();
    const { theme } = useSettingsStore();
    const { addCategory } = useCategoriesStore();
    const colors = theme === 'dark' ? darkTheme : lightTheme;

    // 2. ESTADOS LOCALES
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLOR_PICKER_PALETTE[0]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // Refs y Animaciones
    const inputRef = useRef<TextInput>(null);
    const scale = useSharedValue(1);

    const handlePressIn = () => { scale.value = withSpring(0.95); };
    const handlePressOut = () => { scale.value = withSpring(1); };
    const animatedIconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    // 3. LÓGICA DE GUARDADO
    const handleCreate = () => {
        if (!name.trim()) {
            Alert.alert(t('common.error'), t('validation.nameRequired'));
            return;
        }
        if (!selectedCategory) {
            Alert.alert(t('common.error'), t('validation.iconRequired'));
            return;
        }
        if (!user) {
            Alert.alert('Error', 'No user found');
            return;
        }

        const newCategory = {
            id: uuid.v4(),
            name: name.trim(),
            icon: selectedCategory.icon || '', // Guardamos el ID del icono (ej: "Pizza")
            color: selectedColor,
            type: type,
            userId: user.id,
        };

        console.log('New Category to be added:', newCategory);

        addCategory(newCategory);
        
        // Reset del formulario
        setName('');
        setSelectedCategory(null);
        setSelectedColor(COLOR_PICKER_PALETTE[0]);
        Alert.alert(t('common.success'), t('categories.createdSuccess'));
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
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    {t('categories.createNew')}
                </Text>

                {/* === SECCIÓN 1: INPUT Y PREVIEW (Tu diseño adaptado) === */}
                <View style={styles.topInputContainer}>
                    
                    {/* PREVIEW ICONO (Izquierda) */}
                    <View style={styles.iconColumn}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            {t('common.icon', 'ICON')}
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                        >
                            <Animated.View entering={FadeInLeft} style={styles.iconContainerShadow}>
                                <Animated.View style={animatedIconStyle}>
                                    <LinearGradient
                                        colors={[selectedColor, selectedColor]} // Podrías oscurecer el segundo
                                        style={[styles.gradient, { borderColor: colors.border }]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        {SelectedIconComponent ? (
                                            <SelectedIconComponent size={32} color="#FFF" />
                                        ) : (
                                            <MaterialIcons name="add-photo-alternate" size={32} color="rgba(255,255,255,0.7)" />
                                        )}
                                    </LinearGradient>
                                </Animated.View>
                            </Animated.View>
                        </TouchableOpacity>
                    </View>

                    {/* INPUT NOMBRE (Derecha) */}
                    <View style={styles.inputColumn}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            {t('common.name', 'NAME')}
                        </Text>
                        <Animated.View
                            entering={FadeInRight}
                            style={[
                                styles.inputWrapper,
                                { backgroundColor: colors.surface, borderColor: colors.border }
                            ]}
                        >
                            <TextInput
                                ref={inputRef}
                                value={name}
                                onChangeText={setName}
                                placeholder={t('categories.placeholderName', 'Name')}
                                maxLength={20}
                                placeholderTextColor={colors.textSecondary}
                                style={[styles.input, { color: colors.text }]}
                                returnKeyType="done"
                            />
                        </Animated.View>
                    </View>
                </View>

                
                {/* === SECCIÓN 3: COLOR PICKER === */}
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
                                {selectedColor === color && <MaterialIcons name="check" size={16} color="#FFF" />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* === SECCIÓN 4: ICON GRID === */}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        {t('common.selectIcon')}
                    </Text>
                    <View style={styles.iconGrid}>
                        {/* Aplanamos los iconos para mostrarlos todos */}
                        {Object.values(defaultCategories).flat().map((item: Category) => {
                            const isSelected = selectedCategory?.id === item.id;
                            const IconComp = ICON_OPTIONS.find(icon => icon.label === item.icon)?.icon || null;
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => {
                                        setSelectedCategory(item)
                                        Keyboard.dismiss();
                                    }}
                                    style={[
                                        styles.iconItem,
                                        { backgroundColor: colors.surface, borderColor: colors.border },
                                        isSelected && { borderColor: selectedColor, backgroundColor: selectedColor + '15' }
                                    ]}
                                >
                                    {IconComp && <IconComp size={24} color={isSelected ? selectedColor : colors.text} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ESPACIO EXTRA PARA EL FAB O BOTÓN FLOTANTE */}
                <View style={{ height: 100 }} />

            </ScrollView>

            {/* === FOOTER: BOTÓN CREAR (Flotante o fijo abajo) === */}
            <Animated.View entering={FadeInDown.delay(200)} style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: colors.primary }]}
                    onPress={handleCreate}
                    activeOpacity={0.8}
                >
                    <Text style={styles.createButtonText}>
                        {t('common.create')}
                    </Text>
                    <MaterialIcons name="check" size={24} color="#FFF" />
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
    },
    // --- ESTILOS DE TU INPUT ORIGINAL ---
    topInputContainer: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    iconColumn: {
        alignItems: 'center',
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
    inputWrapper: {
        height: 68,
        borderRadius: 22,
        borderWidth: 1.5,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    input: {
        fontSize: 20,
        fontWeight: '600',
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginLeft: 4,
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
        paddingHorizontal: 2, // Para que no se corte la sombra del primero
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
        width: 58, // Aprox 5 por fila
        height: 58,
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
        height: 56,
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
    },
    createButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});

