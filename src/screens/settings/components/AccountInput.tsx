import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Keyboard,
    ActivityIndicator
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

interface AccountInputMobileProps {
    onClose: () => void;
    colors: ThemeColors;
}

export default function AccountInputMobile({ onClose, colors }: AccountInputMobileProps) {
    const { user } = useAuthStore();
    const { createAccount } = useDataStore();
    
    // 2. Estado Local
    const [name, setName] = useState("");
    const [typeAccount, setTypeAccount] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // 3. Handlers
    const handleSave = async () => {
        Keyboard.dismiss();
        setIsLoading(true);
        setError(null);

        if (!name.trim() || !typeAccount.trim()) {
            setError("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        try {
            if (!user) return;

            // Simulación de delay para UX
            await new Promise(resolve => setTimeout(resolve, 500));

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
            setError(err.message || "Error creating account");
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

            {/* --- MENSAJE DE ERROR (ANIMADO) --- */}
            {error && (
                <Animated.View 
                    entering={SlideInDown} 
                    exiting={SlideOutUp}
                    style={[styles.errorContainer, { backgroundColor: colors.surface, borderColor: colors.error }]}
                >
                    <MaterialIcons name="error-outline" size={16} color={colors.error} style={{ marginRight: 6 }} />
                    <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </Animated.View>
            )}

            {/* --- INPUTS --- */}
            <View style={styles.inputsWrapper}>
                <View style={styles.inputGroup}>
                    <TextInput
                        mode="outlined"
                        label="Account Name"
                        placeholder="e.g. Main Wallet"
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
                        // autoFocus // Opcional, a veces causa saltos en Android con KeyboardAvoidingView
                    />
                </View>

                <View style={styles.inputGroup}>
                    <TextInput
                        mode="outlined"
                        label="Account Type"
                        placeholder="e.g. Bank, Cash, Savings..."
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
                    />
                </View>
            </View>

            {/* --- BOTONES DE ACCIÓN --- */}
            <View style={styles.buttonsRow}>
                {/* Cancelar */}
                <TouchableOpacity
                    onPress={handleCancel}
                    disabled={isLoading}
                    style={[styles.button, styles.cancelButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                >
                    <MaterialIcons name="close" size={18} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>

                {/* Guardar */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isLoading}
                    style={[
                        styles.button, 
                        { backgroundColor: isLoading ? colors.border : colors.income } // Usamos color de Ingreso (Verde) para acciones positivas
                    ]}
                >
                    {isLoading ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <ActivityIndicator size={16} color={colors.surface} />
                            <Text style={[styles.saveButtonText, { color: colors.surface }]}>Saving...</Text>
                        </View>
                    ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <MaterialIcons name="check" size={18} color={colors.surface} />
                                <Text style={[styles.saveButtonText, { color: colors.surface }]}>Save Account</Text>
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
        paddingHorizontal: 8, // Pequeño padding interno
        paddingVertical: 4,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        fontWeight: '500',
        fontSize: 13,
        flex: 1,
    },
    inputsWrapper: {
        gap: 12,
        marginBottom: 20,
    },
    inputGroup: {
        gap: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
        marginLeft: 2,
    },
    input: {
        fontSize: 14,
        height: 40,
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'flex-end', // Botones a la derecha
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    cancelButton: {
        borderWidth: 1,
    },
    cancelButtonText: {
        fontWeight: '600',
        fontSize: 14,
    },
    saveButtonText: {
        fontWeight: '600',
        fontSize: 14,
    },
});