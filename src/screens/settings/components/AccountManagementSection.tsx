import React, { useState, useRef, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    Alert, 
    TextInput as RNTextInput, 
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import Animated, { 
    FadeIn, 
    FadeOut, 
    Layout, 
    SlideInDown, 
    SlideOutUp,
    ZoomIn,
    ZoomOut
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { TextInput, Chip, HelperText } from 'react-native-paper';

// Stores & Utils

// Asumimos que tienes un componente similar para el input de nueva cuenta en mobile
// Si no, puedes crear uno simple o incrustarlo. Aquí importo un placeholder.
import useDataStore from '../../../stores/useDataStore';
import { formatCurrency } from '../../../utils/helpers';
import AccountInputMobile from './AccountInput';
import { useAuthStore } from '../../../stores/authStore';

export default function AccountManagementSection() {
    // 1. Hooks & Store
    const { user } = useAuthStore();
    const { allAccounts, updateAccount, deleteAccountStore } = useDataStore(); // Asumiendo que deleteAccount está en el store
    
    // 2. Estado Local
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempName, setTempName] = useState('');
    const [tempType, setTempType] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Ref para focus (opcional en RN, pero útil)
    const nameInputRef = useRef<any>(null);

    // 3. Handlers
    const handleEdit = (id: string) => {
        const account = allAccounts.find(acc => acc.id === id);
        if (account) {
            setEditingId(id);
            setTempName(account.name);
            setTempType(account.type);
        }
    };

    const handleSaveEdit = async (id?: string) => {
        try {
            // Validación simple
            if (!tempName.trim()) {
                setErrorMessage("Name cannot be empty");
                setTimeout(() => setErrorMessage(null), 3000);
                return;
            }

            // Llamada al store/API
            if (!id) return;
            updateAccount(id, { name: tempName, type: tempType });

            
            setEditingId(null);
            setErrorMessage(null);

        } catch (err) {
            setErrorMessage("Failed to update account");
            setTimeout(() => setErrorMessage(null), 3000);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setTempName('');
        setTempType('');
        setErrorMessage(null);
    };

    const handleDeletePress = (id: string) => {
        // En RN usamos Alert nativo para confirmaciones simples
        // O puedes renderizar tu propio Modal WarningAccountDeleteMessage si prefieres
        Alert.alert(
            "Delete Account",
            "If you delete this account, all its associated transactions will be permanently removed. Do you want to proceed?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: () =>  deleteAccountStore(id) 
                }
            ]
        );
    };

    useEffect(() => {
        console.log("All Accounts Updated:", allAccounts);
    }, [allAccounts]);

    return (
        <View
            style={styles.card}
        >
            {/* --- HEADER SECCIÓN --- */}
            <View style={styles.headerRow}>
                <View style={styles.titleContainer}>
                    <MaterialIcons name="account-balance-wallet" size={24} color="#667eea" style={{ marginRight: 8 }} />
                    <Text style={styles.headerTitle}>Account Management</Text>
                </View>

                <TouchableOpacity
                    onPress={() => setIsAdding(!isAdding)}
                    style={styles.addButton}
                >
                    <MaterialIcons name={isAdding ? "remove" : "add"} size={18} color="#FFF" />
                    <Text style={styles.addButtonText}>
                        {isAdding ? "Cancel" : "Add Account"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* --- FORMULARIO AÑADIR CUENTA (Collapsible) --- */}
            {isAdding && (
                <KeyboardAvoidingView
                   behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.addFormContainer}
                >
                     {/* Aquí iría tu componente AccountInput adaptado a móvil */}
                     {/* Pasamos setIsAdding para que pueda cerrarse al terminar */}
                     <AccountInputMobile onClose={() => setIsAdding(false)} />
                </KeyboardAvoidingView>
            )}

            {/* --- LISTA DE CUENTAS --- */}
            <View style={styles.listContainer}>
                {/* Mensaje de Error Global */}
                {errorMessage && (
                    <Animated.Text 
                        entering={FadeIn} 
                        exiting={FadeOut}
                        style={styles.errorText}
                    >
                        {errorMessage}
                    </Animated.Text>
                )}

                {allAccounts.map((account) => (
                    <Animated.View 
                        key={account.id}
                        layout={Layout.springify()}
                        entering={FadeIn}
                        exiting={FadeOut}
                        style={styles.accountItem}
                    >
                        {editingId === account.id ? (
                            // MODO EDICIÓN
                            <View style={styles.editModeContainer}>
                                <View style={styles.inputsColumn}>
                                    <TextInput
                                        ref={nameInputRef}
                                        mode="outlined"
                                        label="Name"
                                        value={tempName}
                                        onChangeText={setTempName}
                                        style={styles.input}
                                        dense
                                        outlineColor="#E0E0E0"
                                        activeOutlineColor="#667eea"
                                    />
                                    <TextInput
                                        mode="outlined"
                                        label="Type"
                                        value={tempType}
                                        onChangeText={setTempType}
                                        style={styles.input}
                                        dense
                                        outlineColor="#E0E0E0"
                                        activeOutlineColor="#667eea"
                                    />
                                </View>
                                
                                <View style={styles.actionsRowEdit}>
                                    <TouchableOpacity 
                                        onPress={() => handleSaveEdit(account?.id)}
                                        style={styles.iconButtonSuccess}
                                    >
                                        <MaterialIcons name="check" size={20} color="#FFF" />
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={handleCancelEdit}
                                        style={styles.iconButtonCancel}
                                    >
                                        <MaterialIcons name="close" size={20} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            // MODO VISTA
                            <View style={styles.viewModeContainer}>
                                <View style={styles.infoColumn}>
                                    <Text style={styles.accountName}>{account.name}</Text>
                                    <View style={styles.metaRow}>
                                        <View style={styles.chip}>
                                            <Text style={styles.chipText}>{account.type}</Text>
                                        </View>
                                        <Text style={[
                                            styles.balanceText, 
                                            { color: account.balance >= 0 ? '#4caf50' : '#f44336' }
                                        ]}>
                                            ${formatCurrency((account.balance))}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.actionsRowView}>
                                    <TouchableOpacity 
                                        onPress={() => handleEdit(account.id)}
                                        style={styles.iconButtonEdit}
                                    >
                                        <MaterialIcons name="edit" size={18} color="#666" />
                                    </TouchableOpacity>
                                    
                                    {allAccounts.length > 1 && (
                                        <TouchableOpacity 
                                            onPress={() => handleDeletePress(account.id)}
                                            style={styles.iconButtonDelete}
                                        >
                                            <MaterialIcons name="delete" size={18} color="#f44336" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        )}
                    </Animated.View>
                ))}

                {/* Empty State */}
                {allAccounts.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                            No accounts yet. Create your first account!
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        // Sombras
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#667eea',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 4,
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    addFormContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        overflow: 'hidden', // Importante para animaciones de altura
    },
    listContainer: {
        gap: 12,
    },
    errorText: {
        color: '#f44336',
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 12,
    },
    accountItem: {
        backgroundColor: '#F8F9FA', // background.default
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0', // divider
        overflow: 'hidden',
    },
    // --- ESTILOS MODO VISTA ---
    viewModeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    infoColumn: {
        flex: 1,
        gap: 6,
    },
    accountName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    chip: {
        backgroundColor: 'rgba(102, 126, 234, 0.1)', // primary.light
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    chipText: {
        fontSize: 12,
        color: '#667eea', // primary.main
        fontWeight: '500',
    },
    balanceText: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionsRowView: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButtonEdit: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    iconButtonDelete: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#ffcdd2',
    },
    // --- ESTILOS MODO EDICIÓN ---
    editModeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
    },
    inputsColumn: {
        flex: 1,
        gap: 8,
    },
    input: {
        backgroundColor: '#FFF',
        height: 40,
        fontSize: 14,
    },
    actionsRowEdit: {
        flexDirection: 'column', // En móvil se ve mejor vertical si hay poco espacio
        gap: 8,
        justifyContent: 'center',
    },
    iconButtonSuccess: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#4caf50', // success
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconButtonCancel: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#9e9e9e', // grey
        alignItems: 'center',
        justifyContent: 'center',
    },
    // --- EMPTY STATE ---
    emptyState: {
        padding: 20,
        alignItems: 'center',
    },
    emptyStateText: {
        color: '#888',
        fontSize: 14,
    },
});