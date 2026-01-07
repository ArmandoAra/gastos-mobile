import React, { useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Dimensions 
} from 'react-native';
import Animated, { 
    FadeInUp, 
    FadeOutUp, 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming, 
    Easing, 
    ZoomIn,
    Layout
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Store Hook (Asumiendo la misma estructura)
import useMessage from '../../stores/useMessage';
import { useSettingsStore } from '../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../theme/colors';

const DURATION = 3000;

// Configuración de variantes por tipo (Colores y Gradientes)
const VARIANT_CONFIG = {
    success: {
        colors: ['#10b981', '#34d399'] as const, // Green
        shadowColor: '#10b981',
        title: 'Success',
        icon: 'check-circle' as const
    },
    error: {
        colors: ['#ef4444', '#f87171'] as const, // Red
        shadowColor: '#ef4444',
        title: 'Error',
        icon: 'error' as const
    },
    updated: { // Default / Info
        colors: ['#3b82f6', '#60a5fa'] as const, // Blue
        shadowColor: '#3b82f6',
        title: 'Updated',
        icon: 'info' as const
    }
};

export default function InfoPopUp() {
    const { hideMessage, messageType, isMessageOpen, messageText } = useMessage();
    const { theme } = useSettingsStore()
    const colors = theme === 'dark' ? darkTheme : lightTheme;
    
    // Valores animados para la barra de progreso
    const progressWidth = useSharedValue(100);

    // Seleccionar configuración basada en el tipo
    const config = VARIANT_CONFIG[messageType as keyof typeof VARIANT_CONFIG] || VARIANT_CONFIG.updated;

    useEffect(() => {
        if (isMessageOpen) {
            // 1. Resetear barra de progreso
            progressWidth.value = 100;
            
            // 2. Animar barra de progreso a 0% linealmente
            progressWidth.value = withTiming(0, {
                duration: DURATION,
                easing: Easing.linear
            });

            // 3. Timer para cerrar
            const timer = setTimeout(() => {
                hideMessage();
            }, DURATION);

            return () => clearTimeout(timer);
        }
    }, [isMessageOpen, hideMessage]);

    // Estilo animado para la barra de progreso
    const progressStyle = useAnimatedStyle(() => {
        return {
            width: `${progressWidth.value}%`
        };
    });

    if (!isMessageOpen) return null;

    return (
        <Animated.View
            entering={FadeInUp.duration(300)}
            exiting={FadeOutUp.duration(200)}
            style={[
                styles.container,
            ]}
        >
            <LinearGradient
                colors={config.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.gradientCard,
                    { shadowColor: colors.accent, borderColor: colors.border } // Sombra dinámica
                ]}
            >
                <View style={styles.contentContainer}>
                    {/* Icono Animado */}
                    <Animated.View 
                        entering={FadeInUp.duration(300).delay(100)}
                        style={styles.iconContainer}
                    >
                        <MaterialIcons name={config.icon} size={32} color={colors.text} />
                    </Animated.View>

                    {/* Textos */}
                    <View style={styles.textContainer}>
                        <Text style={[styles.titleText, { color: colors.text }]}>{config.title}</Text>
                        <Text style={[styles.messageText, { color: colors.text }]}>{messageText}</Text>
                    </View>

                    {/* Botón de cerrar */}
                    <TouchableOpacity 
                        onPress={hideMessage}
                        style={[styles.closeButton, { backgroundColor: colors.surfaceSecondary }]}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="close" size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Barra de Progreso */}
                <View style={styles.progressBarContainer}>
                    <Animated.View style={[styles.progressBar, progressStyle, { backgroundColor: colors.text }]} />
                </View>

                {/* Decoración de fondo (Blur Circle simulado) */}
                <View style={[styles.backgroundDecoration, { backgroundColor: colors.surface }]} />
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 30,
        left: 20,
        right: 20,
        alignItems: 'center', 
        zIndex: 9999,
    },
    gradientCard: {
        width: '100%',
        borderRadius: 26,
        overflow: 'hidden',
        borderWidth: 0.5,
        // Sombras estilo iOS/Android
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 16,
        zIndex: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        // Simulación básica de borde
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    textContainer: {
        flex: 1,
    },
    titleText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 4,
    },
    messageText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
    },
    closeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    progressBar: {
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        zIndex: 3,
    },
    backgroundDecoration: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        borderRadius: 50,
        transform: [{ scale: 1.5 }],
    }
});