import React, { useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Modal,
    Dimensions,
    AccessibilityInfo,
    Platform
} from 'react-native';
import Animated, { 
    ZoomIn, 
    ZoomOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

    // Anunciar al lector de pantalla cuando aparece
    useEffect(() => {
        if (Platform.OS !== 'web') {
            AccessibilityInfo.announceForAccessibility(`${t('common.warning')}: ${message}`);
        }
    }, [message, t]);

    return (
        <Modal
            transparent
            visible={true}
            animationType="none" 
            onRequestClose={onClose}
            accessibilityViewIsModal={true}
        >
            {/* Backdrop */}
            <View style={styles.overlay}>
                
                {/* Contenedor Animado */}
                <Animated.View 
                    entering={ZoomIn.duration(200)}
                    exiting={ZoomOut.duration(200)}
                    style={styles.animatedContainer}
                    // Accesibilidad
                    accessibilityRole="alert"
                    accessibilityLabel={`${t('common.warning')}, ${message}`}
                >
                    <LinearGradient
                        colors={['rgba(9, 26, 28, 0.98)', 'rgba(13, 68, 68, 0.95)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardGradient}
                    >
                        <View style={styles.decorationCircle} />

                        {/* Contenido Texto */}
                        <View style={styles.contentContainer}>
                            <Text
                                style={styles.title}
                                maxFontSizeMultiplier={1.5}
                                accessibilityRole="header"
                            >
                                {t('common.warning', 'Warning')}
                            </Text>
                            <Text
                                style={styles.message}
                                maxFontSizeMultiplier={1.4}
                            >
                                {message}
                            </Text>
                        </View>

                        {/* Botones */}
                        <View style={styles.buttonRow}>
                            {/* Botón NO */}
                            <TouchableOpacity 
                                onPress={onClose}
                                style={styles.buttonWrapper}
                                activeOpacity={0.8}
                                accessibilityRole="button"
                                accessibilityLabel={t('common.cancel', 'Cancel')}
                            >
                                <LinearGradient
                                    colors={['#10b981', '#34d399']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.buttonGradient}
                                >
                                    <Text
                                        style={styles.buttonText}
                                        maxFontSizeMultiplier={1.2}
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                    >
                                        {t('common.no', 'NO')}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Botón YES */}
                            <TouchableOpacity 
                                onPress={onSubmit}
                                style={styles.buttonWrapper}
                                activeOpacity={0.8}
                                accessibilityRole="button"
                                accessibilityLabel={t('common.confirm', 'Confirm')}
                                accessibilityHint={t('accessibility.warning_confirm_hint', 'This action cannot be undone')}
                            >
                                <LinearGradient
                                    colors={['#ef4444', '#f87171']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.buttonGradient}
                                >
                                    <Text
                                        style={styles.buttonText}
                                        maxFontSizeMultiplier={1.2}
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                    >
                                        {t('common.yes', 'YES')}
                                    </Text>
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
        backgroundColor: 'rgba(0,0,0,0.6)', // Un poco más oscuro para mejor foco
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24, // Margen lateral seguro
    },
    animatedContainer: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 24,
        shadowColor: "#d72323",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 10,
        borderWidth: 2,
        borderColor: 'rgba(239, 68, 68, 0.5)', // Rojo alerta
        overflow: 'hidden',
    },
    cardGradient: {
        padding: 24,
        alignItems: 'center',
        position: 'relative',
    },
    decorationCircle: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        zIndex: 0,
    },
    contentContainer: {
        alignItems: 'center',
        marginBottom: 28,
        zIndex: 1,
        width: '100%',
    },
    title: {
        fontSize: 24, // Ligeramente reducido para móviles pequeños
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 12,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.95)',
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '500',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
        zIndex: 1,
    },
    buttonWrapper: {
        flex: 1,
        borderRadius: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    buttonGradient: {
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 16,
        letterSpacing: 1,
        textTransform: 'uppercase',
    }
});