import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    Modal, 
    TouchableOpacity, 
    StyleSheet, 
    Platform, 
    KeyboardAvoidingView, 
    ScrollView,
    Alert
} from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; // Opcional para efecto glass

// Stores & Utils
import { calculateDaysInMonth, getNormalizedDateParts } from '../../utils/helpers';
import { ICON_OPTIONS, IconKey, IconOption } from '../../constants/icons';

// Componentes Hijos (Debes adaptarlos también a RN)
// Aquí asumo que ya tienes o crearás versiones móviles de estos inputs
import CategoryAndAmountInput from './Inputs/CategoryAndAmountInput'; 
import DescriptionInput from './Inputs/DescriptionInput';
import DaySelectorInput from './Inputs/DaySelectorInput';
import AccountSelector from './Inputs/AccoutSelector';
import IconsSelectorModal from './Inputs/IconsSelector'; // Reemplazo de Popover
import { Transaction } from '../../interfaces/data.interface';
import { MessageType } from '../../interfaces/message.interface';
import IconsSelector from './Inputs/IconsSelector';
import useDataStore from '../../stores/useDataStore';
import useMessage from '../../stores/useMessage';
import useDateStore from '../../stores/useDateStore';

interface EditTransactionFormProps {
    open: boolean;
    transaction: Transaction | null;
    iconOptions: IconOption[];
    onClose: (isOpen: boolean) => void;
    onSave: (
        updatedTransaction: Transaction,
        fromAccount: string | null,
        toAccount: string | null,
    ) => Promise<Transaction | null | undefined>;
}

export default function EditTransactionFormMobile({
    open,
    transaction,
    iconOptions,
    onClose,
    onSave,
}: EditTransactionFormProps) {
    // 1. Stores
    const { allAccounts, selectedAccount } = useDataStore();
    const { selectedMonth, selectedYear } = useDateStore();
    const { showMessage } = useMessage();

    // 2. Variables derivadas
    const daysInMonth = calculateDaysInMonth(selectedMonth, selectedYear);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // 3. Estados Locales
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [selectedDay, setSelectedDay] = useState<number>(1);
    const [selectedIcon, setSelectedIcon] = useState<IconOption | null>(null);
    const [newAccount, setNewAccount] = useState<string>(selectedAccount);
    const [isLoading, setIsLoading] = useState(false);
    
    // Estado para controlar el modal de selección de iconos (reemplaza anchorEl)
    const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);

    // Refs
    // En RN los refs de inputs son diferentes, pero útiles para focus
    const amountInputRef = useRef<any>(null); 

    // 4. Efecto de Inicialización
    useEffect(() => {
        if (transaction && open) {
            setAmount(Math.abs(transaction.amount).toString());
            setDescription(transaction.description || "");
            setNewAccount(transaction.account_id || selectedAccount);

            const { day } = getNormalizedDateParts(transaction.date);
            setSelectedDay(day);

            const matchingIcon = iconOptions.find(
                (icon) => icon.label === transaction.category_name
            );
            setSelectedIcon(matchingIcon || iconOptions[0]);
        }
    }, [transaction, open, iconOptions]);

    // 5. Handlers
    const handleIconPress = () => {
        setIsIconSelectorOpen(true);
    };

    const handleSelectIcon = (icon: IconOption) => {
        setSelectedIcon(icon);
        setIsIconSelectorOpen(false);
    };

    const handleUpdate = async () => {
        if (!transaction || !selectedIcon) return;

        // Validaciones
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) === 0) {
            Alert.alert("Invalid Amount", "Please enter a valid amount.");
            if (amountInputRef.current) {
                amountInputRef.current.focus();
            }
            return;
        }

        setIsLoading(true);

        // Construcción de Fecha (Misma lógica que web)
        const local = new Date(
            selectedYear,
            selectedMonth - 1,
            selectedDay || 1,
            new Date().getHours(),
            new Date().getMinutes(),
            new Date().getSeconds()
        );

        try {
            const updatedTransaction: Transaction = {
                ...transaction,
                amount: transaction.amount < 0
                    ? -Math.abs(parseFloat(amount))
                    : Math.abs(parseFloat(amount)),
                description,
                date: new Date(local.getTime()).toISOString(),
                category_name: selectedIcon.label,
                account_id: newAccount,
            };

            onSave(updatedTransaction, transaction.account_id || null, newAccount || null);
            
            showMessage(MessageType.UPDATED, "Transaction updated successfully.");
            onClose(false);

        } catch (error) {
            showMessage(MessageType.ERROR, "Error updating transaction.");
            console.error("Error updating transaction:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!transaction) return null;

    // Determinar si es gasto o ingreso para colores/textos
    const isExpense = transaction.amount < 0;
    const typeLabel = isExpense ? 'Expense' : 'Income';
    const accentColor = isExpense ? '#f43f5e' : '#10b981'; // Rojo o Verde

    return (
        <Modal
            visible={open}
            transparent
            animationType="none"
            onRequestClose={() => onClose(false)}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalOverlay}
            >
                {/* Backdrop borroso/oscuro */}
                <TouchableOpacity 
                    style={StyleSheet.absoluteFill} 
                    activeOpacity={1} 
                    onPress={() => onClose(false)}
                >
                    <View style={styles.backdrop} />
                </TouchableOpacity>

                {/* Contenido del Modal */}
                <Animated.View 
                    entering={ZoomIn.duration(300)}
                    exiting={ZoomOut.duration(200)}
                    style={styles.modalContent}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: '#667eea' }]}>
                            Edit {typeLabel}
                        </Text>
                        <TouchableOpacity onPress={() => onClose(false)} style={styles.closeButton}>
                            <MaterialIcons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        
                        {/* 1. Category & Amount Input */}
                        <CategoryAndAmountInput
                            selectedIcon={selectedIcon ?? ICON_OPTIONS[isExpense ? IconKey.spend : IconKey.income][0]}
                            amount={amount}
                            amountInputRef={amountInputRef}
                            handleIconClick={handleIconPress}
                            setAmount={setAmount}
                        />

                        {/* 2. Description Input */}
                        <DescriptionInput
                            description={description}
                            setDescription={setDescription}
                        />

                        {/* 3. Day Selector */}
                        <DaySelectorInput
                            label="Select Day"
                            selectedDay={selectedDay || 1}
                            setSelectedDay={setSelectedDay}
                            days={days}
                        />

                        {/* 4. Account Selector */}
                        <AccountSelector
                            label="Select Account"
                            accountSelected={newAccount}
                            setAccountSelected={setNewAccount}
                            accounts={allAccounts}
                        />

                        {/* Botones de Acción */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity 
                                onPress={() => onClose(false)} 
                                style={styles.cancelButton}
                                disabled={isLoading}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                onPress={handleUpdate} 
                                style={[styles.saveButton, { backgroundColor: '#667eea' }]}
                                disabled={isLoading}
                            >
                                <Text style={styles.saveButtonText}>
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </Animated.View>
            </KeyboardAvoidingView>

            {/* Modal Selector de Iconos (Anidado o separado) */}
            <IconsSelector
                popoverOpen={isIconSelectorOpen}
                handleClosePopover={() => setIsIconSelectorOpen(false)}
                iconOptions={iconOptions}
                handleSelectIcon={handleSelectIcon}
                selectedIcon={selectedIcon}
            />

        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#FFF', // O un color semitransparente si usas BlurView
        borderRadius: 20,
        padding: 20,
        maxHeight: '80%', // Evita que sea muy alto
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    scrollContent: {
        gap: 16, // Espaciado vertical entre inputs
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: '600',
        fontSize: 16,
    },
    saveButton: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
});