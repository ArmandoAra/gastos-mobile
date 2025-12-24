// ============================================
// ADD TRANSACTION SCREEN

import { useState } from "react";
import { ScrollView, View, TouchableOpacity, TextInput, Text } from "react-native";
import { styles } from "../../theme/styles2";

// ============================================
export const AddTransactionScreen = ({ navigation }: any) => {
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Alimentación');
    const [account, setAccount] = useState('1');

    const categories = [
        'Alimentación', 'Transporte', 'Entretenimiento',
        'Salud', 'Compras', 'Servicios', 'Salario', 'Extra'
    ];

    const handleSave = () => {
        // Aquí iría la lógica para guardar la transacción
        console.log({ type, amount, description, category, account });
        navigation.goBack();
    };

    return (
        <ScrollView style={styles.container}>
            {/* Type Selector */}
            <View style={styles.typeToggle}>
                <TouchableOpacity
                    style={[styles.typeToggleBtn, type === 'expense' && styles.typeToggleBtnExpense]}
                    onPress={() => setType('expense')}
                >
                    <Text style={[styles.typeToggleText, type === 'expense' && { color: 'white' }]}>
                        💸 Gasto
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.typeToggleBtn, type === 'income' && styles.typeToggleBtnIncome]}
                    onPress={() => setType('income')}
                >
                    <Text style={[styles.typeToggleText, type === 'income' && { color: 'white' }]}>
                        💰 Ingreso
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Descripción</Text>
                <TextInput
                    style={styles.formInput}
                    placeholder="Ej: Compra supermercado"
                    value={description}
                    onChangeText={setDescription}
                />
            </View>

            {/* Category */}
            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Categoría</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryList}>
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.categoryChip,
                                    category === cat && styles.categoryChipActive
                                ]}
                                onPress={() => setCategory(cat)}
                            >
                                <Text style={[
                                    styles.categoryChipText,
                                    category === cat && styles.categoryChipTextActive
                                ]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Account */}
            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Cuenta</Text>
                <TouchableOpacity style={styles.accountSelector}>
                    <Text style={styles.accountSelectorText}>💳 Cuenta Principal</Text>
                </TouchableOpacity>
            </View>

            {/* Save Button */}
            <TouchableOpacity
                style={[
                    styles.saveButton,
                    { backgroundColor: type === 'expense' ? '#EF5350' : '#4CAF50' }
                ]}
                onPress={handleSave}
            >
                <Text style={styles.saveButtonText}>
                    Guardar {type === 'expense' ? 'Gasto' : 'Ingreso'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};