import React, { RefObject } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Platform 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
    useAnimatedStyle, 
    useSharedValue, 
    withSpring, 
    FadeInLeft,
    FadeInRight
} from 'react-native-reanimated';
import { Icon } from '@expo/vector-icons/build/createIconSet';
import { IconOption } from '../../../constants/icons';
import { useSettingsStore } from '../../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../../theme/colors';
import { ThemeColors } from '../../../types/navigation';

// Definimos la interfaz adaptada para RN
interface CategoryAndAmountInputProps {
    selectedIcon: IconOption | null;
    amount: string;
    setAmount: (value: string) => void;
    amountInputRef?: RefObject<TextInput | null>;
    handleIconClick: (event: any) => void; // <-- Debe recibir esto
    colors: ThemeColors;
}

export default function CategoryAndAmountInput({
    selectedIcon,
    amount,
    setAmount,
    amountInputRef,
    handleIconClick,
    colors,
}: CategoryAndAmountInputProps) {

    // Lógica de animación para el botón de categoría (Scale effect)
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <View 
            style={styles.container}
        >
            {/* 1. Category Selector */}
            <View style={styles.categoryColumn}>
                <Text style={styles.label}>CATEGORY</Text>
                
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={handleIconClick}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                >
                    <Animated.View
                        layout={FadeInLeft}
                        entering={FadeInLeft}
                        style={[styles.iconContainer]}>
                        <LinearGradient
                            colors={selectedIcon?.gradientColors || ['#ccc', '#999']}
                            style={styles.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {selectedIcon && React.createElement(selectedIcon.icon, { size: 28, color: colors.text })}
                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* 2. Amount Input */}
            <View
                style={styles.amountColumn}>
                <Text style={styles.label}>AMOUNT</Text>
                
                <Animated.View
                    layout={FadeInRight}
                    entering={FadeInRight}
                    style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TextInput
                        ref={amountInputRef}
                        value={amount}
                        onChangeText={(text) => {
                            // Validación de longitud y caracteres
                            if (text.length <= 9) {
                                // Opcional: Validar que sea número válido o permitir punto decimal
                                setAmount(text);
                            }
                        }}
                        placeholder="0.00"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="decimal-pad" // Teclado numérico con punto
                        style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
                        returnKeyType="done"
                    />
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'flex-start',
        width: '100%',
    },
    // Columna de Categoría
    categoryColumn: {
        alignItems: 'center', // Centrado para el icono
        flex: 0, // No crece, tamaño fijo
    },
    iconContainer: {
        // Contenedor para la animación de escala
    },
    gradient: {
        width: 56,
        height: 56,
        borderRadius: 18, // Bordes redondeados modernos
        justifyContent: 'center',
        alignItems: 'center',
        // CERO SOMBRAS
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },

    // Columna de Monto
    amountColumn: {
        flex: 1, // Ocupa el resto del espacio
    },
    inputWrapper: {
        width: '100%',
        height: 56, // Misma altura que el icono para alineación visual
        backgroundColor: '#F5F5F7', // Fondo gris estilo iOS Input
        borderRadius: 16,
        justifyContent: 'center',
        paddingHorizontal: 16,
        // Borde sutil en lugar de sombra
        borderWidth: 1,
        borderColor: 'transparent',
    },
    input: {
        fontSize: 18,
        fontWeight: '600',
        height: '100%', // Ocupa todo el wrapper
    },

    // Estilos Comunes
    label: {
        fontSize: 8,
        fontWeight: '700',
        color: '#888', // text.secondary
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        alignSelf: 'flex-start',
        marginLeft: 4,
    }
});