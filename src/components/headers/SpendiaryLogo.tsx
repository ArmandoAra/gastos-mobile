import React, { useEffect } from 'react';
import { Text, View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    FadeInDown,
    ZoomIn
} from 'react-native-reanimated';
import { useSettingsStore } from '../../stores/settingsStore';
import { ThemeColors } from '../../types/navigation';
import { Image } from 'expo-image';

interface SpendiaryLogoProps {
    colors?: ThemeColors;
    size?: 'small' | 'medium' | 'large';
    showIcon?: boolean;
}

// 🎨 Paleta Mejorada: Añadí un color intermedio (Violeta) para evitar 
// que la mezcla entre Naranja y Azul se vea "sucia" o grisácea.
const LOGO_GRADIENT = ['#FF712F', '#D946EF', '#4F46E5'] as const;

// Componente para el Texto con Gradiente
const GradientText = (props: any) => {
    return (
        <MaskedView maskElement={<Text {...props} />}>
            <LinearGradient
                colors={LOGO_GRADIENT}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill} // Asegura que cubra todo
            />
            {/* Texto invisible para mantener el layout */}
            <Text {...props} style={[props.style, { opacity: 0 }]} />
        </MaskedView>
    );
};

// Usado en: SetupScreen.
export const SpendiaryLogo = ({ size = 'medium', showIcon = true }: SpendiaryLogoProps) => {
    const { theme } = useSettingsStore();
    const isDark = theme === 'dark';

    // Configuración de tamaños
    const config = {
        small: { fontSize: 24, iconSize: 24 },
        medium: { fontSize: 32, iconSize: 40 },
        large: { fontSize: 48, iconSize: 60 },
    }[size];

    return (
        <View style={styles.container}>
            {/* 1. Capa de Luz Ambiental (Ambient Light) */}
            {/* Crea una atmósfera detrás del logo en lugar de una sombra dura */}
            <View style={{
                position: 'absolute',
                width: config.fontSize * 6,
                height: config.fontSize * 2,
                backgroundColor: isDark ? '#4F46E5' : '#FF712F',
                opacity: isDark ? 0.15 : 0.08,
                borderRadius: 100,
                transform: [{ scaleY: 0.6 }],
                zIndex: -1,
                // Blur simulado (si expo-blur no es opción, usas opacidad baja)
            }} />

            <View style={styles.row}>
                {/* 2. Icono con animación de entrada Pop-up */}
                {showIcon && (
                    <View style={[styles.iconCircle]}>
                        <Image
                            style={styles.image}
                            source={require('../../../assets/splash-icon.png')}
                            accessible={false}
                        />
                    </View>
                )}

                {/* 3. Texto con gradiente y tipografía */}
                <Animated.View entering={FadeInDown.duration(700).delay(100).springify()}>
                    <View style={{ position: 'relative' }}>
                        {/* Sombra suave para legibilidad */}
                        <Text style={[
                            styles.textBase,
                            { 
                                fontSize: config.fontSize,
                                position: 'absolute',
                                color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                top: 2, left: 1
                            }
                        ]}>
                            Spendiary
                        </Text>

                        {/* Texto Principal */}
                        <GradientText style={[styles.textBase, { fontSize: config.fontSize }]}>
                            Spendiary
                        </GradientText>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
    },
    image: {
        flex: 1,
        borderRadius: 40,
        width: 120,
        height: 120,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8, // Espacio entre icono y texto
    },
    textBase: {
        fontFamily: 'Tinos-Bold',
        letterSpacing: -0.5, // Las fuentes Serif modernas se ven mejor un poco más juntas (tracking negativo)
        textAlign: 'center',
    },
});