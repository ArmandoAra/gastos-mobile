import React, { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Keyboard,
    ActivityIndicator,
    TextInput as RNTextInput // Importamos para tipos
} from 'react-native';
import Animated, { 
    SlideInDown, 
    SlideOutUp 
} from 'react-native-reanimated';
import { TextInput } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import useDataStore from '../../../stores/useDataStore';
import { useAuthStore } from '../../../stores/authStore';
import { ThemeColors } from '../../../types/navigation';
import { useTranslation } from 'react-i18next';

interface AccountInputMobileProps {
    onClose: () => void;
    colors: ThemeColors;
}

export default function AccountInputMobile({ onClose, colors }: AccountInputMobileProps) {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const { createAccount } = useDataStore();
    
    // Referencias para manejo de foco
    const typeInputRef = useRef<any>(null);

    // Estado Local
    const [name, setName] = useState("");
    const [typeAccount, setTypeAccount] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Handlers
    const handleSave = async () => {
        Keyboard.dismiss();
        setIsLoading(true);
        setError(null);

        if (!name.trim() || !typeAccount.trim()) {
            setError(t("commonWarnings.fillAllFields"));
            setIsLoading(false);
            return;
        }

        try {
            if (!user) return;

            // Simulación de delay para UX
            await new Promise(resolve => setTimeout(resolve, 300));

            createAccount({
                name: name.trim(),
                type: typeAccount.trim(),
                createdAt: new Date(),
                balance: 0,
                userId: user.id,
            });

            setName("");
            setTypeAccount("");
            onClose(); 

        } catch (err: any) {
            setError(err.message || t("commonWarnings.someErrorOccurred"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        Keyboard.dismiss();
        onClose();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>

            {/* --- MENSAJE DE ERROR (ACCESIBLE) --- */}
            {error && (
                <Animated.View 
                    entering={SlideInDown} 
                    exiting={SlideOutUp}
                    style={[styles.errorContainer, { backgroundColor: colors.surface, borderColor: colors.error }]}
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                >
                    <MaterialIcons
                        name="error-outline"
                        size={20} // Tamaño un poco más grande para mejor visibilidad
                        color={colors.error}
                        style={styles.iconSpacing}
                        importantForAccessibility="no"
                    />
                    <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </Animated.View>
            )}

            {/* --- INPUTS --- */}
            <View style={styles.inputsWrapper}>
                <View style={styles.inputGroup}>
                    <TextInput
                        mode="outlined"
                        label={t("accounts.accountName")}
                        placeholder={t("accounts.accountNamePlaceholder")}
                        placeholderTextColor={colors.textSecondary}
                        value={name}
                        onChangeText={(text) => {
                            setName(text);
                            if (error) setError(null);
                        }}
                        disabled={isLoading}
                        style={[styles.input, { backgroundColor: colors.surfaceSecondary || colors.background }]}
                        textColor={colors.text}
                        outlineColor={colors.border}
                        activeOutlineColor={colors.accent}
                        dense

                        // Accesibilidad y UX
                        accessibilityLabel={t("accounts.accountName")}
                        accessibilityHint={t("accessibility.account_name_hint")}
                        returnKeyType="next"
                        onSubmitEditing={() => typeInputRef.current?.focus()}
                        autoCapitalize="words"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <TextInput
                        ref={typeInputRef}
                        mode="outlined"
                        label={t("accounts.typePlaceholder")}
                        placeholder={t("accounts.typeExample")}
                        placeholderTextColor={colors.textSecondary}
                        value={typeAccount}
                        onChangeText={(text) => {
                            setTypeAccount(text);
                            if (error) setError(null);
                        }}
                        disabled={isLoading}
                        style={[styles.input, { backgroundColor: colors.surfaceSecondary || colors.background }]}
                        textColor={colors.text}
                        outlineColor={colors.border}
                        activeOutlineColor={colors.accent}
                        dense

                        // Accesibilidad y UX
                        accessibilityLabel={t("accounts.typePlaceholder")}
                        accessibilityHint={t("accessibility.account_type_hint")}
                        returnKeyType="done"
                        onSubmitEditing={handleSave}
                        autoCapitalize="words"
                    />
                </View>
            </View>

            {/* --- BOTONES DE ACCIÓN (WRAP PARA TEXTO GRANDE) --- */}
            <View style={styles.buttonsRow}>
                {/* Cancelar */}
                <TouchableOpacity
                    onPress={handleCancel}
                    disabled={isLoading}
                    style={[styles.button, styles.cancelButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                    accessibilityRole="button"
                    accessibilityLabel={t("common.cancel")}
                    accessibilityHint={t("accessibility.cancel_action_hint")}
                >
                    <MaterialIcons
                        name="close"
                        size={20}
                        color={colors.textSecondary}
                        style={styles.iconSpacing}
                        importantForAccessibility="no"
                    />
                    <Text
                        style={[styles.cancelButtonText, { color: colors.textSecondary }]}
                        maxFontSizeMultiplier={1.5} // Limita crecimiento extremo
                    >
                        {t("common.cancel")}
                    </Text>
                </TouchableOpacity>

                {/* Guardar */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isLoading}
                    style={[
                        styles.button, 
                        { backgroundColor: isLoading ? colors.border : colors.income } 
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={isLoading ? t("common.saving") : t("profile.save")}
                    accessibilityState={{ disabled: isLoading, busy: isLoading }}
                >
                    {isLoading ? (
                        <View style={styles.buttonContent}>
                            <ActivityIndicator size="small" color={colors.surface} style={styles.iconSpacing} />
                            <Text
                                style={[styles.saveButtonText, { color: colors.surface }]}
                                maxFontSizeMultiplier={1.5}
                            >
                                {t("common.saving")}
                            </Text>
                        </View>
                    ) : (
                            <View style={styles.buttonContent}>
                                <MaterialIcons
                                    name="check"
                                    size={20}
                                    color={colors.surface}
                                    style={styles.iconSpacing}
                                    importantForAccessibility="no"
                                />
                                <Text
                                    style={[styles.saveButtonText, { color: colors.surface }]}
                                    maxFontSizeMultiplier={1.5}
                                >
                                    {t("profile.save")}
                                </Text>
                            </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        padding: 12, // Más espacio interno para texto grande
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        fontFamily: 'FiraSans-Regular',
        fontSize: 14, // Base un poco más grande
        flex: 1, // Permite que el texto fluya y haga wrap
        flexWrap: 'wrap',
    },
    inputsWrapper: {
        gap: 16, // Más espacio entre inputs
        marginBottom: 24,
    },
    inputGroup: {
        gap: 4,
    },
    input: {
        fontSize: 16,
        minHeight: 50, 
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'flex-end',
        flexWrap: 'wrap', // CLAVE: Permite que los botones bajen si el texto es enorme
    },
    button: {
        flex: 1,
        minWidth: 120, // Ancho mínimo para que no se aplasten
        minHeight: 48, // Altura mínima táctil accesible
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        borderWidth: 1, // Borde más visible (antes 0.5)
    },
    cancelButtonText: {
        fontFamily: 'FiraSans-Bold',
        fontSize: 16, // Texto base legible
        textAlign: 'center',
    },
    saveButtonText: {
        fontFamily: 'FiraSans-Bold',
        fontSize: 16,
        textAlign: 'center',
    },
    iconSpacing: {
        marginRight: 8, // Espaciado consistente
    }
});