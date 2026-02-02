import React, { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    KeyboardAvoidingView,
    Platform,
    Modal,
    AccessibilityInfo
} from 'react-native';
import Animated, { 
    FadeIn, 
    FadeOut,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { TextInput } from 'react-native-paper';

// Stores & Utils
import useDataStore from '../../../stores/useDataStore';
import { formatCurrency } from '../../../utils/helpers';
import AccountInputMobile from './AccountInput';
import { ThemeColors } from '../../../types/navigation';
import { useAuthStore } from '../../../stores/authStore';
import WarningAccountDeleteMessage from './WarningAccountDeleteMessage';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../../stores/settingsStore';

interface AccountManagementProps {
    colors: ThemeColors;
}

export default function AccountManagementSection({ colors }: AccountManagementProps) {
    const { t } = useTranslation();
    const language = useSettingsStore((state) => state.language);

    const { allAccounts, updateAccount, syncAccountsWithTransactions } = useDataStore();
    const { currencySymbol } = useAuthStore();

    // Estado Local
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState('');
    const [tempType, setTempType] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isSync, setIsSync] = useState(false);
    const [warningOpen, setWarningOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Handlers
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
                setErrorMessage(t('commonWarnings.notEmptyField', "Name cannot be empty"));
                if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility("Name cannot be empty");
                return;
            }

            if (!id) return;

            updateAccount(id, { name: tempName, type: tempType });

            setSelectedAccount(null);
            setErrorMessage(null);
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility("Account updated");

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
        if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility("Syncing accounts");

        syncAccountsWithTransactions();

        // Simulamos fin de sync visualmente o esperamos promesa real si existe
        setTimeout(() => {
            setIsSync(false);
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility("Sync complete");
        }, 1000); 
    }

    return (
        <Animated.View
            entering={FadeIn.duration(300)}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
            {/* --- HEADER SECCIÓN --- */}
            <View style={styles.headerRow} accessibilityRole="header">
                <View style={styles.titleContainer}>
                    <Text
                        style={[styles.headerTitle, { color: colors.text }]}
                        maxFontSizeMultiplier={1.5}
                    >
                        {t('accounts.title')}
                    </Text>
                </View>

                {/* Contenedor de Botones Header */}
                <View style={styles.headerButtonsContainer}>
                    {!isAdding &&
                        <TouchableOpacity
                            onPress={handleSyncAccounts}
                            style={[
                                styles.addButton,
                                { backgroundColor: isSync ? colors.surfaceSecondary : colors.text, borderWidth: isSync ? 1 : 0, borderColor: colors.text }
                            ]}
                            accessibilityRole="button"
                            accessibilityLabel={isSync ? t('accounts.syncing') : t('accounts.syncData')}
                            accessibilityState={{ busy: isSync, disabled: isSync }}
                        >
                            <MaterialIcons
                                name="refresh"
                                size={20}
                                color={isSync ? colors.text : colors.surface}
                                importantForAccessibility="no"
                            />
                            <Text style={[styles.addButtonText, { color: isSync ? colors.text : colors.surface }]}>
                                {isSync ? t('accounts.syncing') : t('accounts.syncData')}
                            </Text>
                        </TouchableOpacity>
                    }

                    <TouchableOpacity
                        onPress={() => setIsAdding(!isAdding)}
                        style={[styles.addButton, { backgroundColor: isAdding ? colors.error : colors.text }]}
                        accessibilityRole="button"
                        accessibilityLabel={isAdding ? t('common.cancel') : t('accounts.addAccount')}
                        accessibilityHint={isAdding ? "Closes the add account form" : "Opens form to add a new account"}
                    >
                        <MaterialIcons
                            name={isAdding ? "close" : "add"}
                            size={20}
                            color={colors.surface}
                            importantForAccessibility="no"
                        />
                        <Text style={[styles.addButtonText, { color: colors.surface }]}>
                            {isAdding ? t('common.cancel') : t('accounts.addAccount')}
                        </Text>
                    </TouchableOpacity>
                </View>
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
            <View style={styles.listContainer} accessibilityRole="list">
                {/* Mensaje de Error Global */}
                {errorMessage && (
                    <Animated.Text 
                        entering={FadeIn} 
                        exiting={FadeOut}
                        style={[styles.errorText, { color: colors.error }]}
                        accessibilityRole="alert"
                        accessibilityLiveRegion="polite"
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
                                backgroundColor: colors.surfaceSecondary || colors.background, 
                                borderColor: colors.border
                            }
                        ]}
                    >
                        {(isEditing && selectedAccount === account.id) ? (
                            // ================= MODO EDICIÓN =================
                            <View style={styles.editModeContainer}>
                                <View style={styles.inputsColumn}>
                                    <TextInput
                                        mode="outlined"
                                        label={t('accounts.accountName', 'Name')}
                                        value={tempName}
                                        onChangeText={setTempName}
                                        style={[styles.input, { backgroundColor: colors.surfaceSecondary || colors.background }]}
                                        textColor={colors.text}
                                        dense
                                        outlineColor={colors.border}
                                        activeOutlineColor={colors.accent}
                                        // Accesibilidad
                                        accessibilityLabel={t('accounts.accountName', 'Account Name')}
                                        autoCapitalize="words"
                                    />
                                    <TextInput
                                        mode="outlined"
                                        label={t('accounts.typePlaceholder', 'Type')}
                                        value={tempType}
                                        onChangeText={setTempType}
                                        style={[styles.input, { backgroundColor: colors.surfaceSecondary || colors.background }]}
                                        textColor={colors.text}
                                        dense
                                        outlineColor={colors.border}
                                        activeOutlineColor={colors.accent}
                                        // Accesibilidad
                                        accessibilityLabel={t('accounts.typePlaceholder', 'Account Type')}
                                    />
                                </View>
                                
                                <View style={styles.actionsRowEdit}>
                                    <TouchableOpacity 
                                        onPress={() => handleSaveEdit(account?.id)}
                                        style={[styles.iconButton, { backgroundColor: colors.income }]}
                                        accessibilityRole="button"
                                        accessibilityLabel={t('common.save')}
                                    >
                                        <MaterialIcons name="check" size={24} color={colors.surface} importantForAccessibility="no" />
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={handleCancelEdit}
                                        style={[styles.iconButton, { backgroundColor: colors.textSecondary }]}
                                        accessibilityRole="button"
                                        accessibilityLabel={t('common.cancel')}
                                    >
                                        <MaterialIcons name="close" size={24} color={colors.surface} importantForAccessibility="no" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                                // ================= MODO VISTA =================

                            <View style={styles.viewModeContainer}>
                                    {/* Agrupamos la info para lectura continua */}
                                    <View
                                        style={styles.infoColumn}
                                        accessible={true}
                                        accessibilityLabel={`${account.name}, ${account.type}, ${t('common.balance')}: ${account.balance} ${currencySymbol}`}
                                        accessibilityHint={t('accessibility.account_actions_hint', 'Swipe to edit or delete')}
                                    >
                                        <Text style={[styles.accountName, { color: colors.text }]}>{account.name}</Text>
                                    <View style={styles.metaRow}>
                                            <View style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                                                <Text style={[styles.chipText, { color: colors.textSecondary }]} importantForAccessibility="no">
                                                    {account.type}
                                                </Text>
                                        </View>
                                            <Text
                                                style={[styles.balanceText, { color: account.balance >= 0 ? colors.income : colors.expense }]}
                                                importantForAccessibility="no"
                                            >
                                                {`${account.balance >= 0 ? '' : '-'}${currencySymbol} ${formatCurrency(Math.abs(account.balance))}`}
                                        </Text>
                                    </View>
                                </View>

                                    {/* Acciones fuera del grupo de lectura */}
                                <View style={styles.actionsRowView}>
                                    <TouchableOpacity 
                                        onPress={() => handleEdit(account.id)}
                                            style={[styles.iconButtonOutline, { borderColor: colors.border, backgroundColor: colors.surface }]}
                                            accessibilityRole="button"
                                            accessibilityLabel={`${t('common.edit')} ${account.name}`}
                                    >
                                            <MaterialIcons name="edit" size={20} color={colors.textSecondary} importantForAccessibility="no" />
                                    </TouchableOpacity>

                                        {allAccounts.length > 1 && (
                                            <TouchableOpacity
                                            onPress={() => handleDeletePress(account.id)}
                                            style={[styles.iconButtonOutline, { borderColor: colors.error + '50', backgroundColor: colors.surface }]}
                                                accessibilityRole="button"
                                                accessibilityLabel={`${t('common.delete')} ${account.name}`}
                                        >
                                                <MaterialIcons name="delete" size={20} color={colors.error} importantForAccessibility="no" />
                                            </TouchableOpacity>
                                        )}
                                </View>
                            </View>
                        )}
                    </Animated.View>
                ))}

                {/* --- MODAL WARNING --- */}
                <Modal
                    visible={warningOpen}
                    transparent={true}
                    animationType="none"
                    onRequestClose={() => setWarningOpen(false)}
                    accessibilityViewIsModal={true}
                >
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity
                            style={StyleSheet.absoluteFill}
                            activeOpacity={1}
                            onPress={() => setWarningOpen(false)}
                            accessibilityLabel={t('common.close')}
                        />
                        <WarningAccountDeleteMessage
                            accountToDelete={selectedAccount!}
                            onClose={() => setWarningOpen(false)}
                            colors={colors}
                        />
                    </View>
                </Modal>

                {/* Empty State */}
                {allAccounts.length === 0 && (
                    <View style={styles.emptyState} accessible={true}>
                        <MaterialIcons name="savings" size={48} color={colors.textSecondary} style={{ opacity: 0.5 }} importantForAccessibility="no" />
                        <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                            {t('accounts.emptyState', "No accounts yet. Create your first one above!")}
                        </Text>
                    </View>
                )}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 0.5,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        flexWrap: 'wrap', // CLAVE: Permite que el título y botones se acomoden si el texto es grande
        gap: 12,
    },
    titleContainer: {
        flex: 1, // Toma el espacio disponible
        minWidth: 150, // Ancho mínimo antes de hacer wrap
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'FiraSans-Regular',
    },
    headerButtonsContainer: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap', // Botones también pueden hacer wrap
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8, // Área táctil mejorada
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
        minHeight: 40, // Altura mínima
    },
    addButtonText: {
        fontSize: 13,
        fontFamily: 'FiraSans-Bold',
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
        fontSize: 14,
        fontFamily: 'FiraSans-Regular',
    },
    accountItem: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    // --- ESTILOS MODO VISTA ---
    viewModeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        flexWrap: 'wrap', // Permite wrap en pantallas muy pequeñas
        gap: 12,
    },
    infoColumn: {
        flex: 1,
        gap: 6,
        minWidth: 150,
    },
    accountName: {
        fontSize: 16,
        fontFamily: 'FiraSans-Bold',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
    },
    chip: {
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    chipText: {
        fontSize: 11,
        fontFamily: 'FiraSans-Regular',
        textTransform: 'uppercase',
    },
    balanceText: {
        fontSize: 14,
        fontFamily: 'FiraSans-Bold',
    },
    actionsRowView: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    iconButtonOutline: {
        padding: 10, // Área táctil generosa
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 44, // Accesibilidad
        minHeight: 44,
    },
    // --- ESTILOS MODO EDICIÓN ---
    editModeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
        flexWrap: 'wrap', // IMPORTANTE: Si los inputs son grandes, los botones bajan
    },
    inputsColumn: {
        flex: 1,
        gap: 12,
        minWidth: 180, // Ancho mínimo para inputs
    },
    input: {
        fontSize: 16,
        minHeight: 50, // Altura accesible
    },
    actionsRowEdit: {
        flexDirection: 'column', // Botones apilados al lado (o abajo si hay wrap)
        gap: 12,
        justifyContent: 'center',
    },
    iconButton: {
        padding: 12,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 48,
        minHeight: 48,
    },
    // --- EMPTY STATE ---
    emptyState: {
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    emptyStateText: {
        fontSize: 16,
        textAlign: 'center',
        maxWidth: 250,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    }
});