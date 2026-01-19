import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Modal, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    Platform,
    TextInput,
    ScrollView,
    AccessibilityInfo
} from 'react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeColors } from '../../../types/navigation';
import { useTranslation } from 'react-i18next';

interface ChangePinModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (oldPin: string, newPin: string) => void;
    colors: ThemeColors;
}

export default function ChangePinModal({ visible, onClose, onSave, colors }: ChangePinModalProps) {
    const { t } = useTranslation();
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        if (oldPin.length === 0 || newPin.length === 0) {
            const msg = t('commonWarnings.fillAllFields');
            setError(msg);
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(msg);
            return;
        }
        if (oldPin.length < 4 || newPin.length < 4) {
            const msg = t('security.pinInfo');
            setError(msg);
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(msg);
            return;
        }
        if (oldPin === newPin) {
            const msg = t('security.newPinMustBeDifferent');
            setError(msg);
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(msg);
            return;
        }

        onSave(oldPin, newPin);

        // Limpieza y cierre
        setOldPin('');
        setNewPin('');
        setError(null);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                {/* Backdrop Clickeable */}
                <TouchableOpacity 
                    style={StyleSheet.absoluteFill} 
                    activeOpacity={1} 
                    onPress={onClose}
                    accessibilityLabel={t('common.close')}
                    accessibilityRole="button"
                >
                    <View style={styles.backdrop} />
                </TouchableOpacity>

                <Animated.View 
                    entering={ZoomIn.duration(300)}
                    exiting={ZoomOut.duration(200)}
                    style={[
                        styles.modalContainer, // Contenedor con max-height
                        { backgroundColor: colors.surface, borderColor: colors.border }
                    ]}
                    accessibilityViewIsModal={true}
                >
                    {/* ScrollView es CRÍTICO para Accesibilidad de Texto Grande + Teclado */}
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Header */}
                        <View style={styles.header} accessibilityRole="header">
                            <View
                                style={[styles.iconContainer, { backgroundColor: colors.accent + '15' }]}
                                importantForAccessibility="no" // Decorativo
                            >
                                <MaterialIcons name="lock-reset" size={32} color={colors.accent} />
                            </View>
                            <Text style={[styles.title, { color: colors.text }]}>
                                {t('security.changePin')}
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                {t('security.subtitle')}
                            </Text>
                        </View>

                        {/* Formulario */}
                        <View style={styles.form}>
                            {/* Región de Error Viva */}
                            {error && (
                                <View
                                    style={styles.errorContainer}
                                    accessibilityRole="alert"
                                    accessibilityLiveRegion="polite"
                                >
                                    <MaterialIcons name="error-outline" size={20} color={colors.error} />
                                    <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                                </View>
                            )}

                            <View style={styles.inputGroup}>
                                <Text
                                    style={[styles.label, { color: colors.textSecondary }]}
                                    importantForAccessibility="no" // El input ya tendrá el label
                                >
                                    {t('security.enterCurrentPin')}
                                </Text>
                                <TextInput
                                    style={[styles.pinInput, {
                                        backgroundColor: colors.surfaceSecondary,
                                        color: colors.text,
                                        borderColor: colors.border
                                    }]}
                                    value={oldPin}
                                    onChangeText={(val) => {
                                        setOldPin(val.replace(/[^0-9]/g, ''));
                                        if (error) setError(null);
                                    }}
                                    maxLength={4}
                                    keyboardType="number-pad"
                                    secureTextEntry
                                    placeholder="****"
                                    placeholderTextColor={colors.textSecondary}

                                    // Accesibilidad Input
                                    accessibilityLabel={t('security.enterCurrentPin')}
                                    accessibilityHint="Enter your old 4-digit PIN"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text
                                    style={[styles.label, { color: colors.textSecondary }]}
                                    importantForAccessibility="no"
                                >
                                    {t('security.enterNewPin')}
                                </Text>
                                <TextInput
                                    style={[styles.pinInput, {
                                        backgroundColor: colors.surfaceSecondary,
                                        color: colors.text,
                                        borderColor: colors.border
                                    }]}
                                    value={newPin}
                                    onChangeText={(val) => {
                                        setNewPin(val.replace(/[^0-9]/g, ''));
                                        if (error) setError(null);
                                    }}
                                    maxLength={4}
                                    keyboardType="number-pad"
                                    secureTextEntry
                                    placeholder="****"
                                    placeholderTextColor={colors.textSecondary}

                                    // Accesibilidad Input
                                    accessibilityLabel={t('security.enterNewPin')}
                                    accessibilityHint="Enter a new 4-digit PIN"
                                />
                            </View>
                        </View>

                        {/* Acciones */}
                        <View style={styles.actions}>
                            <TouchableOpacity
                                onPress={onClose}
                                style={styles.cancelBtn}
                                accessibilityRole="button"
                                accessibilityLabel={t('common.cancel')}
                            >
                                <Text
                                    style={{ color: colors.textSecondary, fontFamily: 'FiraSans-Bold', fontSize: 16 }}
                                    maxFontSizeMultiplier={1.5}
                                >
                                    {t('common.cancel')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSave}
                                style={[styles.saveBtn, { backgroundColor: colors.accent }]}
                                accessibilityRole="button"
                                accessibilityLabel={t('common.save')}
                                accessibilityHint="Updates your PIN"
                            >
                                <Text
                                    style={styles.saveBtnText}
                                    maxFontSizeMultiplier={1.5}
                                >
                                    {t('common.save')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalContainer: {
        width: '100%',
        maxHeight: '85%', // Deja espacio para teclado
        borderRadius: 24,
        borderWidth: 1,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        overflow: 'hidden', // Necesario para el border radius con scroll
    },
    scrollContent: {
        padding: 24, // El padding se mueve aquí dentro del scroll
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 64, // Un poco más grande para iconos grandes
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontFamily: 'Tinos-Bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
    form: {
        gap: 20,
        marginBottom: 24,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 8,
        padding: 8,
        backgroundColor: 'rgba(255,0,0,0.05)',
        borderRadius: 8,
    },
    errorText: {
        fontSize: 14,
        fontFamily: 'FiraSans-Bold',
        flex: 1,
        textAlign: 'center',
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 12,
        fontFamily: 'Tinos-Bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 4,
    },
    pinInput: {
        // CLAVE: minHeight en lugar de height fijo
        minHeight: 60,
        paddingVertical: 12, // Espacio para que el texto grande no toque bordes
        borderRadius: 12,
        borderWidth: 1,
        textAlign: 'center',
        fontSize: 24,
        letterSpacing: 10,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
        flexWrap: 'wrap', // Permite que los botones bajen si el texto es muy grande
    },
    cancelBtn: {
        flex: 1,
        minWidth: 100,
        minHeight: 50,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtn: {
        flex: 2,
        minWidth: 140,
        minHeight: 50,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: {
        color: '#FFF',
        fontFamily: 'Tinos-Bold',
        fontSize: 16,
    }
});