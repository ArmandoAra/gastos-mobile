import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Modal, 
    TextInput, 
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    AccessibilityInfo
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
import { useTranslation } from 'react-i18next';
import useMessage from '../../../stores/useMessage';
import { MessageType } from '../../../interfaces/message.interface';
import { t } from 'i18next';
import useCategoriesStore from '../../../stores/useCategoriesStore';
import useBudgetStore from '../../../stores/useBudgetStore';

interface DangerZoneSectionProps {
    colors: ThemeColors;
}


export default function DangerZoneSection({ colors }: DangerZoneSectionProps) {
    const { t } = useTranslation();
    const { clearTransactions, deleteAllAccounts, createAccount } = useDataStore();
    const { deleteAllItems, deleteAllBudgets } = useBudgetStore();
    const { deleteAllCategories } = useCategoriesStore();
    const { logout, deleteUser, user } = useAuthStore();
    const { showMessage } = useMessage();

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

    // De implementar con varios usuarios en el futuro debo borrar solo los datos del usuario actual
    const handleDeleteAllData = async () => {
        if (confirmText !== (user?.name.toLocaleUpperCase())) return;
        setIsDeleting(true);
        if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility("Deleting all data, please wait");

        await new Promise(resolve => setTimeout(resolve, 2000));
        deleteAllItems();
        deleteAllBudgets();
        deleteAllCategories();
        clearTransactions();
        deleteAllAccounts();
        createAccount({ userId: user?.id });

        setIsDeleting(false);
        closeModals();
        showMessage(MessageType.SUCCESS, t('dangerZone.allDataWiped'));
    };

    const handleDeleteAccount = async () => {
        if (confirmText !== user?.name.toLocaleUpperCase()) return;
        setIsDeleting(true);
        if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility("Deleting account, please wait");
        
        try {
            deleteAllItems();
            deleteAllBudgets();
            deleteAllCategories();
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
            style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
            <View style={styles.header} accessibilityRole="header">
                <Text
                    style={[styles.headerTitle, { color: colors.error }]}
                    maxFontSizeMultiplier={1.5}
                >
                    {t('dangerZone.tileHeader')}
                </Text>
            </View>

            <View style={styles.optionsWrapper}>
                {/* --- OPCIÓN: BORRAR DATOS --- */}
                <DangerOption
                    colors={colors}
                    title={t('dangerZone.resetData')}
                    subtitle={t('dangerZone.resetDataSubtitle')}
                    buttonText={t('dangerZone.resetData')}
                    onPress={() => { setConfirmText(''); setDeleteDataModal(true); }}
                    variant="outline"
                />

                {/* --- OPCIÓN: BORRAR CUENTA --- */}
                <DangerOption
                    colors={colors}
                    title={t('dangerZone.deleteAccount')}
                    subtitle={t('dangerZone.deleteAccountSubtitle')}
                    buttonText={t('dangerZone.deleteAccount')}
                    onPress={() => { setConfirmText(''); setDeleteAccountModal(true); }}
                    variant="solid"
                />
            </View>

            {/* MODALES */}
            <ConfirmationModal
                visible={deleteDataModal}
                title={t('dangerZone.resetData')}
                description={t('dangerZone.resetDataSubtitle')}
                type={t('common.write')}
                placeholder={t('dangerZone.placeholderWrite', "Type here...")}
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
                title={t('dangerZone.deleteAccount')}
                description={t('dangerZone.confirmDeleteAccount')}
                type={t('common.write')}
                placeholder={t('dangerZone.placeholderWrite', "Type here...")}
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

// --- SUBCOMPONENTE PARA FILAS ---
const DangerOption = ({ colors, title, subtitle, buttonText, onPress, variant }: any) => (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <View style={styles.textContainer}>
            <Text
                style={[styles.optionTitle, { color: variant === 'solid' ? colors.error : colors.text }]}
                maxFontSizeMultiplier={1.5}
            >
                {title}
            </Text>
            <Text
                style={[styles.optionSubtitle, { color: colors.textSecondary }]}
                maxFontSizeMultiplier={1.5}
            >
                {subtitle}
            </Text>
        </View>
        <TouchableOpacity
            onPress={onPress}
            style={[
                variant === 'outline' ? styles.outlineBtn : styles.solidBtn,
                {
                    borderColor: colors.error,
                    backgroundColor: variant === 'solid' ? colors.error : 'transparent'
                }
            ]}
            accessibilityRole="button"
            accessibilityLabel={title}
            accessibilityHint={subtitle}
        >
            <Text
                style={{
                    color: variant === 'solid' ? '#FFF' : colors.error,
                    fontFamily: 'FiraSans-Bold',
                    fontSize: 13,
                    textAlign: 'center'
                }}
                maxFontSizeMultiplier={1.5}
            >
                {buttonText}
            </Text>
        </TouchableOpacity>
    </View>
);

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    description: string;
    type: string;
    placeholder: string;
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
const ConfirmationModal = ({
    visible,
    title,
    description,
    type,
    placeholder,
    matchText,
    onConfirm,
    iconName,
    closeModals,
    colors,
    confirmText,
    setConfirmText,
    isDeleting
}: ConfirmationModalProps) => (
    <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={closeModals}
    >
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
        >
            <TouchableOpacity
                style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                onPress={closeModals}
                activeOpacity={1}
                accessibilityLabel="Close modal"
                accessibilityRole="button"
            />

            <Animated.View
                entering={ZoomIn.duration(300)}
                exiting={ZoomOut.duration(200)}
                style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}
                accessibilityViewIsModal={true}
                accessibilityRole="alert"
            >
                {/* ScrollView CRÍTICO para pantallas pequeñas + teclado */}
                <ScrollView
                    contentContainerStyle={styles.modalScrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.modalHeader}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.error + '15' }]}>
                            <MaterialIcons name={iconName} size={32} color={colors.error} importantForAccessibility="no" />
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.error }]}>{title}</Text>
                    </View>

                    <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>{description}</Text>

                    <View style={[styles.instructionBox, { backgroundColor: colors.surfaceSecondary }]}>
                        <Text style={[styles.instructionText, { color: colors.text }]}>
                            {type}: <Text style={{ fontFamily: 'Tinos-Bold', color: colors.error }}>{matchText}</Text>
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
                        placeholder={placeholder}
                        placeholderTextColor={colors.textSecondary}
                        value={confirmText}
                        onChangeText={setConfirmText}
                        autoCapitalize="characters"
                        editable={!isDeleting}
                        // Accesibilidad
                        accessibilityLabel={`Type ${matchText} to confirm`}
                        accessibilityHint="Input must match exactly to enable the delete button"
                    />

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            onPress={closeModals}
                            disabled={isDeleting}
                            style={styles.modalCancelBtn}
                            accessibilityRole="button"
                            accessibilityLabel="Cancel"
                        >
                            <Text style={{ color: colors.textSecondary, fontFamily: 'FiraSans-Bold' }}>{t('common.cancel')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={onConfirm}
                            disabled={confirmText !== matchText || isDeleting}
                            accessibilityRole="button"
                            accessibilityLabel={`Confirm ${title}`}
                            accessibilityState={{ disabled: confirmText !== matchText || isDeleting }}
                            style={[
                                styles.modalDeleteBtn,
                                { backgroundColor: colors.error },
                                (confirmText !== matchText || isDeleting) && { opacity: 0.5 }
                            ]}
                        >
                            {isDeleting ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <Text style={styles.modalDeleteBtnText}>{t('common.confirm')}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Animated.View>
        </KeyboardAvoidingView>
    </Modal>
);

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 0.5,
        marginBottom: 130,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'FiraSans-Regular',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    optionsWrapper: {
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        // Wrap importante para accesibilidad (texto grande)
        flexWrap: 'wrap',
        gap: 16,
    },
    textContainer: {
        flex: 1,
        minWidth: 300, // Ancho mínimo antes de hacer wrap
    },
    optionTitle: {
        fontSize: 16,
        fontFamily: 'Tinos-Bold',
        marginBottom: 4,
    },
    optionSubtitle: {
        fontSize: 13,
    },
    outlineBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        minHeight: 44, // Accesibilidad
        justifyContent: 'center',
        alignItems: 'center',
    },
    solidBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        minHeight: 44, // Accesibilidad
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        borderRadius: 24,
        elevation: 20,
        borderWidth: 0.5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        maxHeight: '80%', // Limita la altura para el teclado
        overflow: 'hidden',
    },
    modalScrollContent: {
        padding: 24,
        paddingBottom: 60,
    },
    modalHeader: {
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Tinos-Bold',
        textAlign: 'center',
    },
    modalDescription: {
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 20,
    },
    instructionBox: {
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 16,
    },
    instructionText: {
        fontSize: 14,
        textAlign: 'center',
    },
    input: {
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        textAlign: 'center',
        borderWidth: 1.5,
        marginBottom: 24,
        fontWeight: 'bold',
        minHeight: 56, // Altura táctil
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap', // Permite que los botones se acomoden si el texto es muy grande
    },
    modalCancelBtn: {
        flex: 1,
        minWidth: 100,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    modalDeleteBtn: {
        flex: 2,
        minWidth: 140,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
        maxHeight: 70
    },
    modalDeleteBtnText: {
        color: '#FFF',
        fontFamily: 'Tinos-Bold',
        fontSize: 15,
    }
});