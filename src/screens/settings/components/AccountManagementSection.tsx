import React, { useState, useRef, useMemo } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Alert, 
    KeyboardAvoidingView,
    Platform,
    Modal
} from 'react-native';
import Animated, { 
    FadeIn, 
    FadeOut, 
    Layout,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { TextInput } from 'react-native-paper';

// Stores & Utils
import useDataStore from '../../../stores/useDataStore';
import { formatCurrency } from '../../../utils/helpers';
import AccountInputMobile from './AccountInput'; // Asumimos que este componente maneja sus propios estilos o recibe theme
import { ThemeColors } from '../../../types/navigation';
import { set } from 'date-fns';
import { useAuthStore } from '../../../stores/authStore';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { getCurrencySymbol } from '../../../constants/currency';
import WarningAccountDeleteMessage from './WarningAccountDeleteMessage';

interface AccountManagementProps {
    colors: ThemeColors;
}


export default function AccountManagementSection({ colors }: AccountManagementProps) {
    const { allAccounts, updateAccount, deleteAccountStore, syncAccountsWithTransactions } = useDataStore();
    const { user, currencySymbol } = useAuthStore();
    
    // 2. Estado Local
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState('');
    const [tempType, setTempType] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isSync, setIsSync] = useState(false);
    const [warningOpen, setWarningOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Ref para focus
    const nameInputRef = useRef<any>(null);


    // 3. Handlers
    const handleEdit = (id: string) => {
        const account = allAccounts.find(acc => acc.id === id);
        if (account) {
            setIsEditing(true);
            setSelectedAccount(id);
            setTempName(account.name);
            setTempType(account.type);
        }
    };

    const handleSaveEdit = async (id?: string) => {
        try {
            if (!tempName.trim()) {
                setErrorMessage("Name cannot be empty");
                return;
            }

            if (!id) return;

            updateAccount(id, { name: tempName, type: tempType });

            setSelectedAccount(null);
            setErrorMessage(null);

        } catch (err) {
            setErrorMessage("Failed to update account");
        }
        setIsEditing(false)
    };

    const handleCancelEdit = () => {
        setSelectedAccount(null);
        setTempName('');
        setTempType('');
        setErrorMessage(null);
        setIsEditing(false);
    };

    const handleDeletePress = (id: string) => {
        setSelectedAccount(id);
        setWarningOpen(true);
    };

    const handleSyncAccounts = () => {
        setIsSync(true);
        syncAccountsWithTransactions();
        setIsSync(false);
    }

    return (
        <Animated.View
            entering={FadeIn.duration(300)}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
            {/* --- HEADER SECCIÓN --- */}
            <View style={styles.headerRow}>
                <View style={styles.titleContainer}>
                    {/* Icono del título usando el color de texto primario o secundario */}
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Accounts</Text>
                </View>
                {!isAdding &&
                    <TouchableOpacity
                        onPress={handleSyncAccounts}
                        style={[styles.addButton, { backgroundColor: isAdding ? colors.error : colors.text }]}
                    >
                        <MaterialIcons name={"refresh"} size={18} color={colors.surface} />
                        <Text style={[styles.addButtonText, { color: colors.surface }]}>
                            {isSync ? "Sync..." : "Sync Data"}
                        </Text>
                    </TouchableOpacity>
                }

                <TouchableOpacity
                    onPress={() => setIsAdding(!isAdding)}
                    style={[styles.addButton, { backgroundColor: isAdding ? colors.error : colors.text }]}
                >
                    <MaterialIcons name={isAdding ? "close" : "add"} size={18} color={colors.surface} />
                    <Text style={[styles.addButtonText, { color: colors.surface }]}>
                        {isAdding ? "Cancel" : "Add New"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* --- FORMULARIO AÑADIR CUENTA (Collapsible) --- */}
            {isAdding && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={[styles.addFormContainer, { borderBottomColor: colors.border }]}
                >
                    <AccountInputMobile onClose={() => setIsAdding(false)} colors={colors} />
                </KeyboardAvoidingView>
            )}



            {/* --- LISTA DE CUENTAS --- */}
            <View style={styles.listContainer}>
                {/* Mensaje de Error Global */}
                {errorMessage && (
                    <Animated.Text 
                        entering={FadeIn} 
                        exiting={FadeOut}
                        style={[styles.errorText, { color: colors.error }]}
                    >
                        {errorMessage}
                    </Animated.Text>
                )}

                {allAccounts.map((account) => (
                    <Animated.View 
                        key={account.id}
                        entering={FadeIn}
                        exiting={FadeOut}
                        style={[
                            styles.accountItem,
                            {
                                backgroundColor: colors.surfaceSecondary || colors.background, // Fallback si no tienes surfaceSecondary
                                borderColor: colors.border
                            }
                        ]}
                    >
                        {(isEditing && selectedAccount === account.id) ? (
                            // MODO EDICIÓN
                            <View style={styles.editModeContainer}>
                                <View style={styles.inputsColumn}>
                                    <TextInput
                                        ref={nameInputRef}
                                        mode="outlined"
                                        label="Name"
                                        value={tempName}
                                        onChangeText={setTempName}
                                        style={[styles.input, { backgroundColor: colors.surfaceSecondary || colors.background }]}
                                        textColor={colors.text}
                                        dense
                                        outlineColor={colors.border}
                                        activeOutlineColor={colors.accent}
                                    />
                                    <TextInput
                                        mode="outlined"
                                        label="Type (e.g., Bank, Cash)"
                                        value={tempType}
                                        onChangeText={setTempType}
                                        style={[styles.input, { backgroundColor: colors.surfaceSecondary || colors.background }]}
                                        textColor={colors.text}
                                        dense
                                        outlineColor={colors.border}
                                        activeOutlineColor={colors.accent}
                                    />
                                </View>
                                
                                <View style={styles.actionsRowEdit}>
                                    <TouchableOpacity 
                                        onPress={() => handleSaveEdit(account?.id)}
                                        style={[styles.iconButton, { backgroundColor: colors.income }]}
                                    >
                                        <MaterialIcons name="check" size={20} color={colors.text} />
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={handleCancelEdit}
                                        style={[styles.iconButton, { backgroundColor: colors.textSecondary }]}
                                    >
                                        <MaterialIcons name="close" size={20} color={colors.text} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            // MODO VISTA
                            <View style={styles.viewModeContainer}>
                                <View style={styles.infoColumn}>
                                        <Text style={[styles.accountName, { color: colors.text }]}>{account.name}</Text>
                                    <View style={styles.metaRow}>
                                            <View style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                                                <Text style={[styles.chipText, { color: colors.textSecondary }]}>{account.type}</Text>
                                        </View>
                                        <Text style={[
                                            styles.balanceText, 
                                                { color: account.balance >= 0 ? colors.income : colors.expense }
                                        ]}>
                                                {currencySymbol} {formatCurrency((account.balance))}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.actionsRowView}>
                                    <TouchableOpacity 
                                        onPress={() => handleEdit(account.id)}
                                            style={[styles.iconButtonOutline, { borderColor: colors.border, backgroundColor: colors.surface }]}
                                    >
                                            <MaterialIcons name="edit" size={18} color={colors.textSecondary} />
                                    </TouchableOpacity>

                                        {allAccounts.length > 1 && <TouchableOpacity
                                            onPress={() => handleDeletePress(account.id)}
                                            style={[styles.iconButtonOutline, { borderColor: colors.error + '50', backgroundColor: colors.surface }]}
                                        >
                                            <MaterialIcons name="delete" size={18} color={colors.error} />
                                        </TouchableOpacity>}
                                </View>
                            </View>
                        )}
                    </Animated.View>
                ))}

                <Modal
                    visible={warningOpen}
                    transparent={true}
                    animationType="none" // Usamos Reanimated para el control total
                    onRequestClose={() => setWarningOpen(false)}
                >
                    <View style={styles.modalOverlay}>
                        {/* Backdrop para cerrar al tocar fuera si lo deseas */}
                        <TouchableOpacity
                            style={StyleSheet.absoluteFill}
                            activeOpacity={1}
                            onPress={() => setWarningOpen(false)}
                        >
                            <View style={styles.backdropBlur} />
                        </TouchableOpacity>

                        {/* El componente ahora sí aparecerá arriba de TODO */}
                        <WarningAccountDeleteMessage
                            accountToDelete={selectedAccount!}
                            message="Are you sure you want to delete this account?"
                            onClose={() => setWarningOpen(false)}
                            colors={colors}
                        />
                    </View>
                </Modal>


                {/* Empty State */}
                {allAccounts.length === 0 && (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="savings" size={40} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                        <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                            No accounts yet. Create your first one above!
                        </Text>
                    </View>
                )}
            </View>


        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginTop: 10,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        // Sombras consistentes con UserProfile
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 0.5,
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
        fontSize: 24, // Ajustado para jerarquía visual
        fontWeight: '300',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 4,
    },
    addButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    addFormContainer: {
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderStyle: 'dashed',
    },
    listContainer: {
        gap: 12,
    },
    errorText: {
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 12,
    },
    accountItem: {
        borderRadius: 10,
        borderWidth: 1,
        overflow: 'hidden',
    },
    // --- ESTILOS MODO VISTA ---
    viewModeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    infoColumn: {
        flex: 1,
        gap: 6,
    },
    accountName: {
        fontSize: 16,
        fontWeight: '600',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    chip: {
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    chipText: {
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    balanceText: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionsRowView: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: 10,
    },
    iconButtonOutline: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
        fontSize: 14,
        height: 40,
    },
    actionsRowEdit: {
        flexDirection: 'column',
        gap: 8,
        justifyContent: 'center',
    },
    iconButton: {
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    // --- EMPTY STATE ---
    emptyState: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    emptyStateText: {
        fontSize: 14,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // Fondo oscuro traslúcido
        justifyContent: 'flex-start', // Empuja el contenido hacia arriba
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 30, // Margen superior para el Notch
    },
    backdropBlur: {
        flex: 1,
    }
});