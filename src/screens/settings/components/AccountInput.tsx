import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Keyboard 
} from 'react-native';
import Animated, { 
    FadeIn, 
    FadeOut, 
    Layout, 
    SlideInDown, 
    SlideOutUp 
} from 'react-native-reanimated';
import { TextInput, ActivityIndicator } from 'react-native-paper';
import useDataStore from '../../../stores/useDataStore';
import { useAuthStore } from '../../../stores/authStore';

// Stores

interface AccountInputMobileProps {
    onClose: () => void; // Prop para cerrar el formulario desde el padre
}

export default function AccountInputMobile({ onClose }: AccountInputMobileProps) {
    const { user } = useAuthStore(); // Obtener usuario actual desde el store
    // 1. Store & Hooks
    const { createAccount, allAccounts } = useDataStore(); // Asumiendo que createAccount está en el store
    
    // 2. Estado Local
    const [name, setName] = useState("");
    const [typeAccount, setTypeAccount] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        console.log("Current user:", user?.id);
    }, [user]);

    // 3. Handlers
    const handleSave = async () => {
        // Ocultar teclado
        Keyboard.dismiss();
        setIsLoading(true);
        setError(null);
        
        // Validación básica
        if (!name.trim() || !typeAccount.trim()) {
            setError("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        try {
            // Simulando llamada a API/Store
            if (user === null) return;
            createAccount({
                name: name.trim(),
                type: typeAccount.trim(),
                createdAt: new Date(),
                balance: 0,
                userId: user?.id || '',
            });
            
            // Éxito: Limpiar y cerrar
            // Pequeño delay para UX (feedback visual de éxito si lo hubiera)
            setTimeout(() => {
                setName("");
                setTypeAccount("");
                onClose(); 
            }, 300);

        } catch (err: any) {
            // Manejo de error genérico o específico si viene del backend
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
        <View 
            style={styles.container}
        >
            {/* --- MENSAJE DE ERROR (ANIMADO) --- */}
            {error && (
                <Animated.View 
                    entering={SlideInDown} 
                    exiting={SlideOutUp}
                    style={styles.errorContainer}
                >
                    <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
            )}

            {/* --- INPUTS --- */}
            <View style={styles.inputsWrapper}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        mode="outlined"
                        placeholder="Enter account name"
                        value={name}
                        onChangeText={(text) => {
                            setName(text);
                            if (error) setError(null);
                        }}
                        disabled={isLoading}
                        style={styles.input}
                        outlineColor="#E0E0E0"
                        activeOutlineColor="#667eea"
                        dense
                        autoFocus // Opcional: enfocar al abrir
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Account type</Text>
                    <TextInput
                        mode="outlined"
                        placeholder="E.g: Savings, Credit, Cash..."
                        value={typeAccount}
                        onChangeText={(text) => {
                            setTypeAccount(text);
                            if (error) setError(null);
                        }}
                        disabled={isLoading}
                        style={styles.input}
                        outlineColor="#E0E0E0"
                        activeOutlineColor="#667eea"
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
                    style={[styles.button, styles.cancelButton]}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                {/* Guardar */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isLoading}
                    style={[
                        styles.button, 
                        isLoading ? styles.saveButtonDisabled : styles.saveButton
                    ]}
                >
                    {isLoading ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                             <ActivityIndicator size={16} color="#FFF" />
                             <Text style={styles.saveButtonText}>Saving...</Text>
                        </View>
                    ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 16,
        // Sombra suave
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    errorContainer: {
        width: '100%',
        padding: 12,
        backgroundColor: '#fee',
        borderWidth: 1,
        borderColor: '#fcc',
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: '#c33',
        fontWeight: '500',
        fontSize: 13,
    },
    inputsWrapper: {
        gap: 16,
        marginBottom: 20,
    },
    inputGroup: {
        gap: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#888', // text.secondary
        marginBottom: 2,
    },
    input: {
        backgroundColor: '#FFF',
        fontSize: 14,
        height: 40,
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: '500',
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: '#4caf50', // Success green
    },
    saveButtonDisabled: {
        backgroundColor: '#81c784', // Disabled green
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
});