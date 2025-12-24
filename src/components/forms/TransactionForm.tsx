// ============================================
// TRANSACTION FORM COMPONENT

import { useState } from "react";
import { View, TouchableOpacity, TextInput, ScrollView, StyleSheet, Text } from "react-native";

// ============================================
interface TransactionFormProps {
    initialValues?: {
        type: 'expense' | 'income';
        amount: string;
        description: string;
        category: string;
        accountId: string;
    };
    onSubmit: (values: {
        type: 'expense' | 'income';
        amount: number;
        description: string;
        category: string;
        accountId: string;
    }) => void;
    onCancel?: () => void;
    submitText?: string;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
    initialValues,
    onSubmit,
    onCancel,
    submitText = 'Guardar',
}) => {
    const [type, setType] = useState<'expense' | 'income'>(
        initialValues?.type || 'expense'
    );
    const [amount, setAmount] = useState(initialValues?.amount || '');
    const [description, setDescription] = useState(initialValues?.description || '');
    const [category, setCategory] = useState(initialValues?.category || 'Alimentación');
    const [accountId, setAccountId] = useState(initialValues?.accountId || '1');

    const categories = [
        'Alimentación',
        'Transporte',
        'Entretenimiento',
        'Salud',
        'Compras',
        'Servicios',
        'Salario',
        'Extra',
    ];

    const [errors, setErrors] = useState({
        amount: '',
        description: '',
    });

    const handleSubmit = () => {
        const newErrors = { amount: '', description: '' };
        let isValid = true;

        if (!amount || parseFloat(amount) <= 0) {
            newErrors.amount = 'Ingresa un monto válido';
            isValid = false;
        }

        if (!description.trim()) {
            newErrors.description = 'La descripción es requerida';
            isValid = false;
        }

        setErrors(newErrors);

        if (isValid) {
            onSubmit({
                type,
                amount: parseFloat(amount),
                description,
                category,
                accountId,
            });
        }
    };

    return (
        <View style={transactionFormStyles.container}>
            {/* Type Toggle */}
            <View style={transactionFormStyles.typeToggle}>
                <TouchableOpacity
                    style={[
                        transactionFormStyles.typeToggleBtn,
                        type === 'expense' && transactionFormStyles.typeToggleBtnExpense,
                    ]}
                    onPress={() => setType('expense')}
                >
                    <Text
                        style={[
                            transactionFormStyles.typeToggleText,
                            type === 'expense' && { color: 'white' },
                        ]}
                    >
                        💸 Gasto
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        transactionFormStyles.typeToggleBtn,
                        type === 'income' && transactionFormStyles.typeToggleBtnIncome,
                    ]}
                    onPress={() => setType('income')}
                >
                    <Text
                        style={[
                            transactionFormStyles.typeToggleText,
                            type === 'income' && { color: 'white' },
                        ]}
                    >
                        💰 Ingreso
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Amount */}
            <View style={transactionFormStyles.amountContainer}>
                <Text style={transactionFormStyles.currencySymbol}>$</Text>
                <TextInput
                    style={transactionFormStyles.amountInput}
                    placeholder="0.00"
                    value={amount}
                    onChangeText={(text) => {
                        setAmount(text);
                        setErrors({ ...errors, amount: '' });
                    }}
                    keyboardType="decimal-pad"
                />
            </View>
            {errors.amount ? (
                <Text style={transactionFormStyles.errorText}>{errors.amount}</Text>
            ) : null}

            {/* Description */}
            <View style={transactionFormStyles.inputGroup}>
                <Text style={transactionFormStyles.label}>Descripción</Text>
                <TextInput
                    style={[
                        transactionFormStyles.input,
                        errors.description && transactionFormStyles.inputError,
                    ]}
                    placeholder="Ej: Compra supermercado"
                    value={description}
                    onChangeText={(text) => {
                        setDescription(text);
                        setErrors({ ...errors, description: '' });
                    }}
                />
                {errors.description ? (
                    <Text style={transactionFormStyles.errorText}>{errors.description}</Text>
                ) : null}
            </View>

            {/* Category */}
            <View style={transactionFormStyles.inputGroup}>
                <Text style={transactionFormStyles.label}>Categoría</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={transactionFormStyles.categoryList}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    transactionFormStyles.categoryChip,
                                    category === cat && transactionFormStyles.categoryChipActive,
                                ]}
                                onPress={() => setCategory(cat)}
                            >
                                <Text
                                    style={[
                                        transactionFormStyles.categoryChipText,
                                        category === cat && transactionFormStyles.categoryChipTextActive,
                                    ]}
                                >
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Buttons */}
            <View style={transactionFormStyles.buttons}>
                {onCancel && (
                    <TouchableOpacity
                        style={[transactionFormStyles.button, transactionFormStyles.buttonCancel]}
                        onPress={onCancel}
                    >
                        <Text style={transactionFormStyles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[
                        transactionFormStyles.button,
                        transactionFormStyles.buttonSubmit,
                        { backgroundColor: type === 'expense' ? '#EF5350' : '#4CAF50' },
                    ]}
                    onPress={handleSubmit}
                >
                    <Text style={[transactionFormStyles.buttonText, { color: 'white' }]}>
                        {submitText}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const transactionFormStyles = StyleSheet.create({
    container: {
        padding: 16,
    },
    typeToggle: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    typeToggleBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
    },
    typeToggleBtnExpense: {
        backgroundColor: '#EF5350',
    },
    typeToggleBtnIncome: {
        backgroundColor: '#4CAF50',
    },
    typeToggleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#424242',
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        marginBottom: 8,
    },
    currencySymbol: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#6200EE',
        marginRight: 8,
    },
    amountInput: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#000',
        minWidth: 120,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#424242',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
    },
    inputError: {
        borderColor: '#EF5350',
    },
    errorText: {
        color: '#EF5350',
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
    categoryList: {
        flexDirection: 'row',
        gap: 8,
    },
    categoryChip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    categoryChipActive: {
        backgroundColor: '#6200EE',
        borderColor: '#6200EE',
    },
    categoryChipText: {
        fontSize: 14,
        color: '#424242',
    },
    categoryChipTextActive: {
        color: 'white',
        fontWeight: '600',
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonCancel: {
        backgroundColor: '#F5F5F5',
    },
    buttonSubmit: {
        backgroundColor: '#6200EE',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#424242',
    },
});