import React from 'react';
import { 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    View 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    FadeInLeft 
} from 'react-native-reanimated';
import {useSettingsStore} from '../../stores/settingsStore';
import { InputNameActive } from '../../interfaces/settings.interface';



export default function CloseInputButton() {
    const { setInputNameActive } = useSettingsStore();

    // 1. Lógica de cierre
    const handleClose = () => {
        setInputNameActive(InputNameActive.NONE);
    };

    // 2. Animación de escala (Press Effect)
    const scale = useSharedValue(1);



    const handlePressIn = () => {
        scale.value = withSpring(0.96); // Efecto de encogimiento sutil
    };

    const handlePressOut = () => {
        scale.value = withSpring(1); // Rebote al soltar
    };

    return (
        <Animated.View 
            layout={FadeInLeft}

            // Entra deslizándose desde la izquierda (opuesto al botón Save)
            entering={FadeInLeft.duration(300).delay(100).springify()}
            style={[styles.container]}
        >
            <TouchableOpacity
                onPress={handleClose}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
                style={styles.touchable}
            >
                <LinearGradient
                    // Gradiente Rojo (#ef4444 -> #f87171)
                    colors={['#ef4444', '#f87171']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <Text style={styles.text}>
                        Close
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // Ocupa el espacio disponible equitativamente
        height: 48,
        maxWidth: 200, // Evita que se estire demasiado en tablets
    },
    touchable: {
        flex: 1,
        borderRadius: 12,
        // CERO SOMBRAS para evitar destellos
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // Borde sutil interno para mejor definición
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    text: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.5,
    }
});