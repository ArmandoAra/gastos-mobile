import React, { use } from 'react';
import { Text, View, StyleSheet, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ThemeColors } from '../../types/navigation'; // Ajusta tu import de tipos
import { useSettingsStore } from '../../stores/settingsStore';

interface SpendiaryLogoProps {
    colors: ThemeColors; // Para adaptar sombras al tema si es necesario
    size?: 'small' | 'medium' | 'large';
}

// Paleta de gradiente: Un azul profundo a un turquesa moderno.
    // Se ve excelente tanto en temas claros como oscuros.
    const gradientColors = ['#FF712F', '#1A3799'] as const; 
    // Opción alternativa más cálida: ['#FF712F', '#1A3799'] (Naranja a Rosa)

const GradientText = (props: any) => {
        return (
            <MaskedView maskElement={<Text {...props} />}>
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* El texto aquí es invisible pero define el tamaño del gradiente */}
                    <Text {...props} style={[props.style, { opacity: 0 }]} />
                </LinearGradient>
            </MaskedView>
        );
    };

export const SpendiaryLogo = ({ colors, size = 'medium' }: SpendiaryLogoProps) => {
    const {theme} = useSettingsStore();

    // Definimos tamaños dinámicos
    const titleSize = {
        small: 24,
        medium: 32,
        large: 42,
    }[size];

    return (
        <Animated.View 
            entering={FadeInDown.duration(700).springify()}
            style={styles.container}
        >
            {/* Capa de Sombra Suave (Backend) */}
            {/* Esto crea un "resplandor" sutil detrás del texto para darle profundidad 3D */}
            <Text 
                style={[
                    styles.baseText, 
                    styles.shadowLayer, 
                    { 
                        fontSize: titleSize,
                        textShadowColor: theme === 'dark' ? 'rgba(27, 255, 255, 0.3)' : 'rgba(46, 49, 146, 0.25)',
                    }
                ]}
            >
                Spendiary
            </Text>

            {/* Capa Frontal con Gradiente */}
            <View style={styles.foregroundLayer}>
                <GradientText style={[styles.baseText, { fontSize: titleSize }]}>
                    Spendiary
                </GradientText>
            </View>

            {/* Elemento Gráfico Opcional (El punto de la 'i') */}
            {/* Si quisieras personalizar el punto de la 'i' con otro color, se agregaría aquí */}
            {/* <View style={[styles.accentDot, { left: titleSize * 4.6, top: titleSize * 0.25 }]} /> */}

        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        // Un pequeño padding asegura que las sombras no se corten
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    baseText: {
        fontWeight: '900', // Usar el peso más grueso disponible
        letterSpacing: 0.5,
        // Si tienes una fuente personalizada (ej. 'Poppins-Black' o 'Inter-ExtraBold'), úsala aquí:
        // fontFamily: 'Poppins-Black', 
        includeFontPadding: false,
        textAlign: 'center',
    },
    shadowLayer: {
        position: 'absolute',
        color: 'transparent', // El texto en sí es transparente, solo queremos la sombra
        zIndex: 0,
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 12,
    },
    foregroundLayer: {
        zIndex: 1,
         // En Android, el MaskedView necesita un fondo transparente explícito a veces
        backgroundColor: 'transparent',
    },
    // Estilo para el punto de acento opcional
    accentDot: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFD700', // Oro/Amarillo para acento
        zIndex: 2,
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
    }
});