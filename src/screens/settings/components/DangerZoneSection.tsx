import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Modal, 
    TextInput, 
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import Animated, { 
    FadeIn, 
    ZoomIn, 
    ZoomOut
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native-paper';
import { useAuthStore } from '../../../stores/authStore';
import useDataStore from '../../../stores/useDataStore';
import { ThemeColors } from '../../../types/navigation';

interface DangerZoneSectionProps {
    colors: ThemeColors;
}

export default function DangerZoneSection({ colors }: DangerZoneSectionProps) {
    const { clearTransactions, deleteAllAccounts, createAccount } = useDataStore();
    const { logout, deleteUser, user } = useAuthStore();

    const [deleteDataModal, setDeleteDataModal] = useState(false);
    const [deleteAccountModal, setDeleteAccountModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Handlers
    const closeModals = () => {
        if (isDeleting) return;
        setDeleteDataModal(false);
        setDeleteAccountModal(false);
        setConfirmText('');
    };

    const handleDeleteAllData = async () => {
        if (confirmText !== (user?.name.toLocaleUpperCase())) return;
        setIsDeleting(true);

        await new Promise(resolve => setTimeout(resolve, 2000));
        clearTransactions();
        deleteAllAccounts();
        createAccount({ userId: user?.id });

        setIsDeleting(false);
        closeModals();
        Alert.alert("Success", "All your data has been wiped.");
    };

    const handleDeleteAccount = async () => {
        if (confirmText !== user?.name.toLocaleUpperCase()) return;
        setIsDeleting(true);
        
        try {
            clearTransactions();
            deleteAllAccounts();
            deleteUser();
            logout();
        } catch (error) {
            setIsDeleting(false);
        }
    };



    return (
        <Animated.View
            entering={FadeIn.duration(500)}
            style={[styles.container, { backgroundColor: colors.error + '08', borderColor: colors.error + '30' }]}
        >
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.error }]}>Danger Zone</Text>
            </View>

            <View style={styles.optionsWrapper}>
                {/* --- OPCIÓN: BORRAR DATOS --- */}
                <View style={[styles.row, { borderBottomColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.optionTitle, { color: colors.text }]}>Reset All Data</Text>
                        <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>Wipe transactions and accounts.</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => { setConfirmText(''); setDeleteDataModal(true); }}
                        style={[styles.outlineBtn, { borderColor: colors.error }]}
                    >
                        <Text style={{ color: colors.error, fontWeight: '600', fontSize: 13 }}>Reset</Text>
                    </TouchableOpacity>
                </View>

                {/* --- OPCIÓN: BORRAR CUENTA --- */}
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.optionTitle, { color: colors.error }]}>Delete Account</Text>
                        <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>Permanently remove everything.</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => { setConfirmText(''); setDeleteAccountModal(true); }}
                        style={[styles.solidBtn, { backgroundColor: colors.error }]}
                    >
                        <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ConfirmationModal
                visible={deleteDataModal}
                title="Wipe All Data?"
                description="This action will delete every transaction and account. Your profile remains, but your history will be gone forever."
                matchText={user?.name.toLocaleUpperCase() as string}
                onConfirm={handleDeleteAllData}
                iconName="delete-sweep"
                isDeleting={isDeleting}
                closeModals={closeModals}
                colors={colors}
                confirmText={confirmText}
                setConfirmText={setConfirmText}
            />

            <ConfirmationModal
                visible={deleteAccountModal}
                title="Delete Forever?"
                description="This will destroy your account and all data. There is no 'undo' button for this action."
                matchText={user?.name.toLocaleUpperCase() as string}
                onConfirm={handleDeleteAccount}
                iconName="no-accounts"
                isDeleting={isDeleting}
                closeModals={closeModals}
                colors={colors}
                confirmText={confirmText}
                setConfirmText={setConfirmText}
            />
        </Animated.View>
    );
}

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    description: string;
    matchText: string;
    onConfirm: () => void;
    iconName: "no-accounts" | "delete-sweep" | "warning" | "error";
    closeModals: () => void;
    colors: ThemeColors;
    confirmText: string;
    setConfirmText: React.Dispatch<React.SetStateAction<string>>;
    isDeleting: boolean;
}

// --- Componente de Modal de Confirmación Interno ---
const ConfirmationModal = ({ visible, title, description, matchText, onConfirm, iconName, closeModals, colors, confirmText, setConfirmText, isDeleting }: ConfirmationModalProps) => (
        <Modal transparent visible={visible} animationType="none" onRequestClose={closeModals}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalOverlay}
            >
                <TouchableOpacity 
                    style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                    onPress={closeModals} 
                    activeOpacity={1}
                />

                <Animated.View 
                    entering={ZoomIn.duration(300)} 
                    exiting={ZoomOut.duration(200)}
                    style={[styles.modalContent, { backgroundColor: colors.surface }]}
                >
                    <View style={styles.modalHeader}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.error + '15' }]}>
                            <MaterialIcons name={iconName} size={28} color={colors.error} />
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.error }]}>{title}</Text>
                    </View>

                    <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>{description}</Text>

                    <View style={[styles.instructionBox, { backgroundColor: colors.surfaceSecondary }]}>
                        <Text style={[styles.instructionText, { color: colors.text }]}>
                            Type <Text style={{ fontWeight: '800', color: colors.error }}>{matchText}</Text>
                        </Text>
                    </View>

                    <TextInput
                        style={[
                            styles.input, 
                            {
                                color: colors.text,
                                backgroundColor: colors.surfaceSecondary,
                                borderColor: confirmText === matchText ? colors.error : colors.border
                            }
                        ]}
                        placeholder="Type here..."
                        placeholderTextColor={colors.textSecondary}
                        value={confirmText}
                        onChangeText={setConfirmText}
                        autoCapitalize="characters"
                        editable={!isDeleting}
                    />

                    <View style={styles.modalActions}>
                        <TouchableOpacity onPress={closeModals} disabled={isDeleting} style={styles.modalCancelBtn}>
                            <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={onConfirm}
                            disabled={confirmText !== matchText || isDeleting}
                            style={[
                                styles.modalDeleteBtn,
                                { backgroundColor: colors.error },
                                (confirmText !== matchText || isDeleting) && { opacity: 0.4 }
                            ]}
                        >
                            {isDeleting ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.modalDeleteBtnText}>Confirm Delete</Text>}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1.5,
        marginBottom: 130,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    optionsWrapper: {
        gap: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    optionSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    outlineBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    solidBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        borderRadius: 24,
        padding: 24,
        elevation: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    modalHeader: {
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
    },
    modalDescription: {
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    instructionBox: {
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 12,
    },
    instructionText: {
        fontSize: 13,
    },
    input: {
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        textAlign: 'center',
        borderWidth: 1.5,
        marginBottom: 24,
        fontWeight: 'bold',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
    },
    modalDeleteBtn: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalDeleteBtnText: {
        color: '#FFF',
        fontWeight: '700',
    }
});