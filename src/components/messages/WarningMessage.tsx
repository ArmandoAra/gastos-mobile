import React from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Modal, 
    Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    FadeIn, 
    FadeOut,
    ZoomIn,
    ZoomOut
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface WarningMessageProps {
    message: string;
    onClose: () => void;
    onSubmit: () => void; // Cambiado de (e) => void a () => void para RN
    visible?: boolean; // Prop extra para controlar el Modal
}

export default function WarningMessage({
    message,
    onClose,
    onSubmit,
    visible = true
}: WarningMessageProps) {

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none" // Usamos Reanimated internamente
            onRequestClose={onClose}
            statusBarTranslucent
        >
            {/* Backdrop con Blur */}
            <View style={styles.backdropContainer}>
                {/* Fondo oscuro animado */}
                <Animated.View 
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    style={StyleSheet.absoluteFill}
                >
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
                    </BlurView>
                </Animated.View>

                {/* Tarjeta de Alerta */}
                <Animated.View
                    // Simula: y: -100 -> 0 y scale: 0.8 -> 1
                    entering={ZoomIn.duration(400).springify().damping(18)}
                    exiting={ZoomOut.duration(200)}
                    style={styles.cardWrapper}
                >
                    <LinearGradient
                        // Gradiente de fondo oscuro (Dark Teal)
                        colors={['rgba(9, 26, 28, 0.95)', 'rgba(13, 68, 68, 0.9)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardGradient}
                    >
                        {/* Decoración de fondo (Blur Circle) */}
                        <View style={styles.decorationCircle} />

                        {/* Contenido de Texto */}
                        <View style={styles.contentContainer}>
                            <Text style={styles.title}>Warning</Text>
                            <Text style={styles.message}>
                                {message}
                            </Text>
                        </View>

                        {/* Botones */}
                        <View style={styles.buttonsContainer}>
                            {/* Botón NO (Verde) */}
                            <PopupButton 
                                label="NO"
                                colors={['#10b981', '#34d399']}
                                hoverColors={['#14b8a6', '#10b981']} // En móvil no hay hover, pero usaremos el color base
                                onPress={onClose}
                            />

                            {/* Botón YES (Rojo) */}
                            <PopupButton 
                                label="YES"
                                colors={['#ef4444', '#f87171']}
                                onPress={onSubmit}
                            />
                        </View>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
}

// ============================================
// SUB-COMPONENTE: BOTÓN ANIMADO
// ============================================
interface PopupButtonProps {
    label: string;
    colors: [string, string];
    hoverColors?: [string, string];
    onPress: () => void;
}

function PopupButton({ label, colors, onPress }: PopupButtonProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <Animated.View style={[styles.buttonWrapper, animatedStyle]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={{ flex: 1 }}
            >
                <LinearGradient
                    colors={colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                >
                    <Text style={styles.buttonText}>{label}</Text>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
    backdropContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    cardWrapper: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        overflow: 'hidden',
        // Borde rojo sutil (border: 2px solid rgba(215, 35, 35, 0.9))
        borderWidth: 2,
        borderColor: 'rgba(215, 35, 35, 0.6)', 
    },
    cardGradient: {
        padding: 24,
        alignItems: 'center',
    },
    // Decoración (Círculo borroso arriba a la derecha)
    decorationCircle: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        // En Android el blur se logra mejor con opacidad baja o imágenes, 
        // aquí usamos un color sólido muy transparente.
    },
    contentContainer: {
        marginBottom: 24,
        alignItems: 'center',
        zIndex: 2,
    },
    title: {
        fontSize: 28, // 1.7rem aprox
        fontWeight: '600',
        color: 'white',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    message: {
        fontSize: 18, // 1.275rem aprox
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
        justifyContent: 'space-between',
        zIndex: 2,
    },
    // Estilos del Botón
    buttonWrapper: {
        flex: 1, // width: 45% -> flex: 1 en un contenedor row
        height: 48,
    },
    buttonGradient: {
        flex: 1,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        // Borde interno sutil
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.5,
    }
});