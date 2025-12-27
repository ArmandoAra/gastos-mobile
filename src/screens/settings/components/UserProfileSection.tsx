import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Platform 
} from 'react-native';
import Animated, { 
    FadeIn, 
    FadeOut, 
    Layout, 
    ZoomIn, 
    ZoomOut 
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { TextInput, ActivityIndicator } from 'react-native-paper';
import { useAuthStore } from '../../../stores/authStore';

// Stores

// Interfaces
interface LocalUser {
    name: string;
    email: string;
}

const INITIAL_USER_STATE: LocalUser = { name: '', email: '' };

export default function UserProfileSection() {
    // 1. Hooks y Estado
    const { user: sessionUser, updateUser } = useAuthStore(); // Asumiendo que updateUser existe en tu authStore
    
    const [user, setUser] = useState<LocalUser>(INITIAL_USER_STATE);
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState('');
    const [tempEmail, setTempEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // 2. Sincronizar sesión con estado local
    useEffect(() => {
        if (sessionUser) {
            const userData: LocalUser = {
                name: sessionUser.name || '',
                email: sessionUser.email || '',
            };
            setUser(userData);
            setTempName(userData.name);
            setTempEmail(userData.email);
        }
    }, [sessionUser]);

    // 3. Temporizador de error
    useEffect(() => {
        if (apiError) {
            const timer = setTimeout(() => {
                setApiError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [apiError]);

    // 4. Loading State Inicial
    if (!user.name) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color="#667eea" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    // 5. Helpers
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const hasChanges = tempName !== user.name || tempEmail !== user.email;

    // 6. Handlers
    const handleSave = async () => {
        if (!tempName.trim() || !tempEmail.trim()) {
            setApiError("Name and Email cannot be empty.");
            return;
        }

        if (!hasChanges) {
            setIsEditing(false);
            return;
        }

        setIsLoading(true);
        setApiError(null);

        try {
            updateUser({ name: tempName, email: tempEmail });
            setUser({ name: tempName, email: tempEmail });
            setIsEditing(false);

        } catch (err) {
            setApiError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setTempName(user.name);
        setTempEmail(user.email);
        setApiError(null);
        setIsEditing(false);
    };

    return (
        <Animated.View 
            entering={FadeIn.duration(500)} 
            style={styles.card}
        >
            {/* --- BOTÓN DE EDICIÓN FLOTANTE --- */}
            {!isEditing && (
                <Animated.View 
                    entering={ZoomIn} 
                    exiting={ZoomOut}
                    style={styles.editIconWrapper}
                >
                    <TouchableOpacity 
                        onPress={() => setIsEditing(true)}
                        style={styles.editIconButton}
                    >
                        <MaterialIcons name="edit" size={20} color="#667eea" />
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* --- HEADER TÍTULO --- */}
            <View style={styles.headerRow}>
                <MaterialIcons name="person" size={24} color="#667eea" style={{ marginRight: 8 }} />
                <Text style={styles.headerTitle}>Profile Information</Text>
            </View>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <View style={styles.contentRow}>
                
                {/* AVATAR */}
                <Animated.View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
                </Animated.View>

                {/* FORMULARIO / VISTA DE DETALLES */}
                <View style={styles.detailsContainer}>
                    
                    {/* MENSAJE DE ERROR */}
                    {apiError && (
                        <Animated.View 
                            entering={FadeIn} 
                            exiting={FadeOut}
                            style={styles.errorBox}
                        >
                            <Text style={styles.errorText}>{apiError}</Text>
                        </Animated.View>
                    )}

                    {isEditing ? (
                        // MODO EDICIÓN
                        <Animated.View entering={FadeIn}>
                            <TextInput
                                mode="outlined"
                                label="Name"
                                value={tempName}
                                onChangeText={setTempName}
                                disabled={isLoading}
                                style={styles.input}
                                outlineColor="#E0E0E0"
                                activeOutlineColor="#667eea"
                                dense
                            />
                            <TextInput
                                mode="outlined"
                                label="Email"
                                value={tempEmail}
                                onChangeText={setTempEmail}
                                disabled={isLoading}
                                style={styles.input}
                                outlineColor="#E0E0E0"
                                activeOutlineColor="#667eea"
                                keyboardType="email-address"
                                dense
                            />

                            <View style={styles.actionButtonsRow}>
                                {/* Guardar */}
                                <TouchableOpacity
                                    onPress={handleSave}
                                    disabled={isLoading || !hasChanges}
                                    style={[
                                        styles.saveButton,
                                        (isLoading || !hasChanges) && styles.disabledButton
                                    ]}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size={16} color="#FFF" style={{ marginRight: 6 }} />
                                    ) : (
                                        <MaterialIcons name="check" size={18} color="#FFF" style={{ marginRight: 4 }} />
                                    )}
                                    <Text style={styles.saveButtonText}>
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </Text>
                                </TouchableOpacity>

                                {/* Cancelar */}
                                <TouchableOpacity
                                    onPress={handleCancel}
                                    disabled={isLoading}
                                    style={styles.cancelButton}
                                >
                                    <MaterialIcons name="close" size={18} color="#333" style={{ marginRight: 4 }} />
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    ) : (
                        // MODO VISTA
                        <Animated.View entering={FadeIn}>
                            <View style={styles.infoBlock}>
                                <Text style={styles.label}>Name</Text>
                                <Text style={styles.value}>{user.name}</Text>
                            </View>
                            <View style={styles.infoBlock}>
                                <Text style={styles.label}>Email</Text>
                                <Text style={styles.value}>{user.email}</Text>
                            </View>
                        </Animated.View>
                    )}
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        // Sombra suave estilo Material
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        position: 'relative',
    },
    editIconWrapper: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
    },
    editIconButton: {
        backgroundColor: '#FFF',
        padding: 8,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    contentRow: {
        flexDirection: 'row',
        gap: 20,
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
        // Sombra en el avatar
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '700',
    },
    detailsContainer: {
        flex: 1,
    },
    errorBox: {
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
        borderColor: '#d32f2f',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    errorText: {
        color: '#d32f2f',
        fontSize: 12,
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#FFF',
        fontSize: 14,
        height: 40, 
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 5,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#667eea',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 14,
    },
    disabledButton: {
        opacity: 0.6,
    },
    infoBlock: {
        marginBottom: 15,
    },
    label: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    value: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
});