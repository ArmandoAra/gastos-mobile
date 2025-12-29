import React from 'react';
import { 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator,
    View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    FadeInRight 
} from 'react-native-reanimated';
import { MessageType } from '../../interfaces/message.interface';
import useMessage from '../../stores/useMessage';
import { TransactionType } from '../../interfaces/data.interface';

// Definición de Enum y Props
export enum addOption {
    Income = "Income",
    Spend = "Spend"
}

interface SubmitButtonProps {
    handleSave: () => void;
    // Adaptamos el tipo para asegurar compatibilidad
    selectedIcon: { id: string; gradientColors: [string, string] } | null;
    option?: addOption;
    loading?: boolean; // Prop extra recomendada para móviles
    disabled?: boolean; // Nueva prop para deshabilitar el botón
}

export default function SubmitButton({
    handleSave,
    selectedIcon,
    disabled,
    option,
    loading = false
}: SubmitButtonProps) {
    const {showMessage} = useMessage();

    // 1. Animación de Escala (Press Effect)
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.96); // Se encoge ligeramente
    };

    const handlePressOut = () => {
        scale.value = withSpring(1); // Vuelve a tamaño original
    };

    // 2. Colores por defecto si no hay icono seleccionado
    // (Un azul genérico o el color que prefieras)
    const colors = selectedIcon?.gradientColors || ['#667eea', '#764ba2'];

    return (

            <TouchableOpacity
                onPress={handleSave}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            disabled={disabled}
                activeOpacity={0.9}
                style={styles.touchable}
            >
                <LinearGradient
                    colors={colors as [string, string]} // Casting seguro
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={styles.text}>
                            Save
                        </Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 48,
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden', // Asegura que el gradiente respete el borde
    },
    touchable: {
        width: '100%',
        height: 48,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 5,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // Borde sutil interno para definición en fondos blancos
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    text: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16, // Equivalente a 1rem
        letterSpacing: 0.5,
    }
});