import React from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Modal,
    Dimensions
} from 'react-native';
import Animated, { 
    ZoomIn, 
    ZoomOut, 
    FadeIn, 
    Layout 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface WarningMessageProps {
    message: string;
    onClose: () => void;
    onSubmit: (e?: any) => void;
}

export default function WarningMessage({
    message,
    onClose,
    onSubmit,
}: WarningMessageProps) {

    return (
        <Modal
            transparent
            visible={true}
            animationType="none" // Usamos Reanimated para la animación
            onRequestClose={onClose}
        >
            {/* Backdrop oscuro para centrar y bloquear la pantalla */}
            <View style={styles.overlay}>
                
                {/* Contenedor Animado (Simula el Toast Variants) */}
                <Animated.View 
                    entering={ZoomIn.springify().damping(15).stiffness(200)}
                    exiting={ZoomOut.duration(200)}
                    layout={ZoomIn}
                    style={styles.animatedContainer}
                >
                    <LinearGradient
                        // Fondo oscuro verdoso
                        colors={['rgba(9, 26, 28, 0.95)', 'rgba(13, 68, 68, 0.9)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardGradient}
                    >
                        {/* Decoración de fondo (Círculo borroso) */}
                        <View style={styles.decorationCircle} />

                        {/* Contenido de Texto */}
                        <View style={styles.contentContainer}>
                            <Text style={styles.title}>Warning</Text>
                            <Text style={styles.message}>{message}</Text>
                        </View>

                        {/* Botones */}
                        <View style={styles.buttonRow}>
                            {/* Botón NO */}
                            <TouchableOpacity 
                                onPress={onClose}
                                style={styles.buttonWrapper}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#10b981', '#34d399']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.buttonText}>NO</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Botón YES */}
                            <TouchableOpacity 
                                onPress={onSubmit}
                                style={styles.buttonWrapper}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#ef4444', '#f87171']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.buttonText}>YES</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // Backdrop
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    animatedContainer: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        // Sombra / Glow rojo (border effect del original)
        shadowColor: "#d72323",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
        // Simulación de borde rojo con View contenedor o borderWidth directo
        borderWidth: 2,
        borderColor: 'rgba(215, 35, 35, 0.6)',
        overflow: 'hidden',
    },
    cardGradient: {
        padding: 24,
        borderRadius: 18, // Ligeramente menor que el contenedor
        alignItems: 'center',
        position: 'relative',
    },
    decorationCircle: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        zIndex: 0,
    },
    contentContainer: {
        alignItems: 'center',
        marginBottom: 24,
        zIndex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    message: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
        zIndex: 1,
    },
    buttonWrapper: {
        flex: 1,
        borderRadius: 12,
        // Sombra suave para botones
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonGradient: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 16,
        letterSpacing: 1,
    }
});