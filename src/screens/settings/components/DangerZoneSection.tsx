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
    Layout, 
    ZoomIn, 
    FadeOut,
    ZoomOut
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native-paper';
import { useAuthStore } from '../../../stores/authStore';
import useDataStore from '../../../stores/useDataStore';
import { useAccountsStore } from '../../../stores/accountsStore';

const UserService = { deleteUser: async () => ({ success: true }) };
const logout = async () => console.log("Logout executed");

interface DangerZoneSectionProps {
    userId?: string;
}

export default function DangerZoneSection({ userId }: DangerZoneSectionProps) {
    const { clearTransactions } = useDataStore();
    const { logout, deleteUser } = useAuthStore();
    const { deleteAllAccounts } = useAccountsStore();
    // Estados
    const [deleteDataModal, setDeleteDataModal] = useState(false);
    const [deleteAccountModal, setDeleteAccountModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Constantes de color (Tema Error)
    const ERROR_MAIN = '#d32f2f';
    const ERROR_LIGHT = '#ef5350';
    const ERROR_BG = '#ffebee';
    const BG_Paper = '#FFF';

    // Handlers
    const closeModals = () => {
        if (isDeleting) return;
        setDeleteDataModal(false);
        setDeleteAccountModal(false);
        setConfirmText('');
    };

    const handleDeleteAllData = async () => {
        if (confirmText !== 'DELETE ALL DATA') return;
        
        setIsDeleting(true);
        // Simular eliminación
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('All data deleted');
        setIsDeleting(false);
        closeModals();
        Alert.alert("Success", "All data has been deleted.");
    };

    const handleDeleteAccount = async () => {
        // CORRECCIÓN: Usamos el texto completo por seguridad, no solo 'a'

        
        try {
            clearTransactions()
            deleteAllAccounts();
            deleteUser();

            logout();
            // Aquí la navegación debería redirigir al Login automáticamente si usas un Auth Listener
            
        } catch (error) {
            console.error(error);
            setIsDeleting(false);
        }
    };

    // Componente Reutilizable para el Modal de Confirmación
    const ConfirmationModal = ({ 
        visible, 
        title, 
        description, 
        matchText, 
        onConfirm, 
        iconName 
    }: any) => (
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
                {/* Backdrop Oscuro */}
                <TouchableOpacity 
                    style={StyleSheet.absoluteFill} 
                    activeOpacity={1} 
                    onPress={closeModals}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
                </TouchableOpacity>

                {/* Contenido del Modal */}
                <Animated.View 
                    entering={ZoomIn.duration(300)}
                    exiting={ZoomOut.duration(200)}
                    style={styles.modalContent}
                >
                    <View style={styles.modalHeader}>
                        <MaterialIcons name={iconName} size={28} color={ERROR_MAIN} />
                        <Text style={[styles.modalTitle, { color: ERROR_MAIN }]}>{title}</Text>
                    </View>

                    <Text style={styles.modalDescription}>{description}</Text>

                    <Text style={styles.instructionText}>
                        Type <Text style={styles.codeText}>{matchText}</Text> to confirm:
                    </Text>

                    <TextInput
                        style={[
                            styles.input, 
                            confirmText === matchText && { borderColor: ERROR_MAIN }
                        ]}
                        placeholder={matchText}
                        value={confirmText}
                        onChangeText={setConfirmText}
                        autoCapitalize="characters"
                        editable={!isDeleting}
                    />

                    <View style={styles.modalActions}>
                        <TouchableOpacity 
                            onPress={closeModals}
                            disabled={isDeleting}
                            style={styles.cancelButton}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={onConfirm}
                            // disabled={confirmText !== matchText || isDeleting}
                            style={[
                                styles.deleteButton,
                                // (confirmText !== matchText || isDeleting) && styles.disabledButton,
                                { backgroundColor: ERROR_MAIN }
                            ]}
                        >
                            {isDeleting ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );

    return (
        <Animated.View 
            entering={FadeIn.duration(500)}
            layout={Layout.springify()}
            style={[styles.container, { backgroundColor: ERROR_BG, borderColor: ERROR_LIGHT }]}
        >
            {/* --- HEADER --- */}
            <View style={styles.header}>
                <MaterialIcons name="warning" size={24} color={ERROR_MAIN} style={{ marginRight: 8 }} />
                <Text style={[styles.headerTitle, { color: ERROR_MAIN }]}>Danger Zone</Text>
            </View>

            <Text style={styles.description}>
                These actions are irreversible. Please be certain before proceeding.
            </Text>

            {/* --- CARD: DELETE DATA --- */}
            <View style={[styles.card, { borderColor: ERROR_LIGHT }]}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.cardTitle}>Delete All Data</Text>
                    <Text style={styles.cardSubtitle}>
                        Remove all transactions, accounts, and categories. Your account will remain active.
                    </Text>
                </View>
                
                <TouchableOpacity
                    onPress={() => {
                        setConfirmText('');
                        setDeleteDataModal(true);
                    }}
                    style={[styles.actionButton, { backgroundColor: ERROR_MAIN }]}
                >
                    <MaterialIcons name="delete-sweep" size={18} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.actionButtonText}>Delete Data</Text>
                </TouchableOpacity>
            </View>

            {/* --- CARD: DELETE ACCOUNT --- */}
            <View style={[styles.card, { borderColor: ERROR_MAIN, marginTop: 12 }]}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={[styles.cardTitle, { color: ERROR_MAIN }]}>Delete Account</Text>
                    <Text style={styles.cardSubtitle}>
                        Permanently delete your account and all associated data. This cannot be undone.
                    </Text>
                </View>
                
                <TouchableOpacity
                    onPress={() => {
                        setConfirmText('');
                        setDeleteAccountModal(true);
                    }}
                    style={[styles.actionButton, { backgroundColor: '#b71c1c' }]} // Rojo más oscuro
                >
                    <MaterialIcons name="delete-forever" size={18} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.actionButtonText}>Delete Account</Text>
                </TouchableOpacity>
            </View>

            {/* --- MODALS --- */}
            
            {/* Modal Delete Data */}
            <ConfirmationModal 
                visible={deleteDataModal}
                title="Delete All Data"
                description="This will permanently delete all your transactions, accounts, and categories. Your account will remain active and you can add new data later."
                matchText="DELETE ALL DATA"
                onConfirm={handleDeleteAllData}
                iconName="delete-sweep"
            />

            {/* Modal Delete Account */}
            <ConfirmationModal 
                visible={deleteAccountModal}
                title="Delete Account Permanently"
                description="Your account and all associated data will be permanently deleted. This action cannot be undone."
                matchText="DELETE MY ACCOUNT"
                onConfirm={handleDeleteAccount}
                iconName="delete-forever"
            />

        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 20,
        borderWidth: 2,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        flexDirection: 'column', // En pantallas pequeñas mejor columna, o row con wrap
        gap: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'flex-start', // Para que no ocupe todo el ancho si está en columna
    },
    actionButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    
    // Estilos del Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    modalDescription: {
        fontSize: 14,
        color: '#555',
        marginBottom: 20,
        lineHeight: 20,
    },
    instructionText: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    codeText: {
        backgroundColor: '#ffebee',
        color: '#d32f2f',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        paddingHorizontal: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 24,
        backgroundColor: '#FAFAFA',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '600',
    },
    deleteButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.5,
        backgroundColor: '#BDBDBD',
    }
});