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
import { getInitials } from '../../../utils/helpers';
import { Theme } from '@react-navigation/native';
import { ThemeColors } from '../../../types/navigation';
import { currencyOptions } from '../../../constants/currency';
import CurrencySelector from './CurrencySelector';

// Stores

// Interfaces
interface LocalUser {
    name: string;
    email: string;
    currency: string;
}

const INITIAL_USER_STATE: LocalUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    currency: 'USD'
};

export default function UserProfileSection({ colors }: { colors: ThemeColors }) {
    // 1. Hooks y Estado
    const { user: sessionUser, updateUser } = useAuthStore(); // Asumiendo que updateUser existe en tu authStore
    
    const [user, setUser] = useState<LocalUser>(INITIAL_USER_STATE);
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState('');
    const [tempEmail, setTempEmail] = useState('');
    const [tempCurrency, setTempCurrency] = useState('USD');
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // 2. Sincronizar sesión con estado local
    useEffect(() => {
        if (sessionUser) {
            const userData: LocalUser = {
                name: sessionUser.name || '',
                email: sessionUser.email || '',
                currency: sessionUser.currency || 'USD',
            };
            setUser(userData);
            setTempName(userData.name);
            setTempEmail(userData.email);
            setTempCurrency(userData.currency);
        }
    }, [sessionUser]);

    const hasChanges = tempName !== user.name || tempEmail !== user.email || tempCurrency !== user.currency;

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
            updateUser({ name: tempName, email: tempEmail, currency: tempCurrency });
            setUser({ name: tempName, email: tempEmail, currency: tempCurrency });
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
        setTempCurrency(user.currency);
        setApiError(null);
        setIsEditing(false);
    };

    return (
        <Animated.View 
            entering={FadeIn.duration(300)}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
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
                        style={[styles.editIconButton, { shadowColor: colors.text, backgroundColor: colors.text }]}
                    >
                        <MaterialIcons name="edit" size={20} color={colors.accent} />
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* --- HEADER TÍTULO --- */}
            <View style={styles.headerRow}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Profile Information</Text>
            </View>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <View style={styles.contentRow}>
                
                {/* AVATAR */}
                <Animated.View style={[styles.avatarContainer, { backgroundColor: colors.surfaceSecondary, shadowColor: colors.text }]}>
                    <Text style={[styles.avatarText, { color: colors.text }]}>{getInitials(user.name)}</Text>
                </Animated.View>

                {/* FORMULARIO / VISTA DE DETALLES */}
                <View style={styles.detailsContainer}>
                    
                    {/* MENSAJE DE ERROR */}
                    {apiError && (
                        <Animated.View 
                            entering={FadeIn} 
                            exiting={FadeOut}
                            style={[styles.errorBox, { backgroundColor: colors.surface, borderColor: colors.error }]}
                        >
                            <Text style={[styles.errorText, { color: colors.error }]}>{apiError}</Text>
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
                                style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
                                outlineColor={colors.border}
                                activeOutlineColor={colors.accent}
                                dense
                            />
                            <TextInput
                                mode="outlined"
                                label="Email"
                                value={tempEmail}
                                onChangeText={setTempEmail}
                                disabled={isLoading}
                                style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
                                outlineColor={colors.border}
                                activeOutlineColor={colors.accent}
                                keyboardType="email-address"
                                dense
                            />

                            <CurrencySelector
                                label="Select Currency"
                                currencySelected={tempCurrency}
                                setCurrencySelected={setTempCurrency}
                                currencies={currencyOptions}
                                colors={colors} // Tus colores del tema
                            />

                            <View style={styles.actionButtonsRow}>
                                {/* Cancelar */}
                                <TouchableOpacity
                                    onPress={handleCancel}
                                    disabled={isLoading}
                                    style={[styles.cancelButton, { backgroundColor: colors.expense }]}
                                >
                                    <MaterialIcons name="close" size={18} color={colors.text} style={{ marginRight: 4 }} />
                                    <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                                </TouchableOpacity>

                                {/* Guardar */}
                                <TouchableOpacity
                                    onPress={handleSave}
                                    disabled={isLoading || !hasChanges}
                                    style={[
                                        styles.saveButton,
                                        { backgroundColor: colors.income },
                                        (isLoading || !hasChanges) && styles.disabledButton
                                    ]}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size={16} color={colors.text} style={{ marginRight: 6 }} />
                                    ) : (
                                            <MaterialIcons name="check" size={18} color={colors.text} style={{ marginRight: 4 }} />
                                    )}
                                    <Text style={[styles.saveButtonText, { color: colors.text }]}>
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    ) : (
                        // MODO VISTA
                        <Animated.View entering={FadeIn}>
                            <View style={styles.infoBlock}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
                                    <Text style={[styles.value, { color: colors.text }]}>{user.name}</Text>
                            </View>
                            <View style={styles.infoBlock}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
                                    <Text style={[styles.value, { color: colors.text }]}>{user.email}</Text>
                                </View>
                                <View style={styles.infoBlock}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Preferred Currency</Text>
                                    <Text style={[styles.value, { color: colors.text }]}>
                                        {currencyOptions.find(c => c.code === user.currency)?.name || user.currency}
                                    </Text>
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
        marginTop: 10,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 0.5,
        position: 'relative',
    },
    editIconWrapper: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 10,
    },
    editIconButton: {
        padding: 8,
        borderRadius: 20,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '300',
    },
    contentRow: {
        flexDirection: 'row',
        gap: 20,
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '400',
    },
    detailsContainer: {
        flex: 1,
    },
    errorBox: {
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
        fontSize: 14,
        height: 40, 
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 20,
        justifyContent: 'flex-end',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    saveButtonText: {
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