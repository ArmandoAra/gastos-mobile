import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Modal,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInUp,
    SlideOutUp,
    Layout
} from 'react-native-reanimated';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BudgetCard } from './components/BudgetCard';
import { BudgetFormModal } from './components/BudgetFormModal';
import { useTransactionForm } from '../transactions/constants/hooks/useTransactionForm';
import { useTransactionsLogic } from '../transactions/hooks/useTransactionsLogic';
import { ExpenseBudget } from '../../interfaces/data.interface';
import useBudgetsStore from '../../stores/useBudgetStore';
import { useBudgetForm } from './hooks/useBudgetForm';

// --- MOCKS Y TIPOS (Basado en tu descripción) ---


export  function BudgetScreen() {
    const insets = useSafeAreaInsets();
    const { colors } = useTransactionsLogic();
    
    // 1. Usar el store en lugar de useState
    // Esto se suscribirá a cambios y re-renderizará automáticamente
    const {budgets , addBudget} = useBudgetsStore();
    const {handleSaveForm} = useBudgetForm({ visible: false, onClose: () => {}, initialData: null });
    // Nota: Para editar items completos, podrías necesitar una lógica específica 
    // en tu handleSaveBudget o usar las funciones addItem/updateItem del store

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<ExpenseBudget | null>(null);

     const handleOpenCreate = () => {
        setSelectedBudget(null);
        setModalVisible(true);
    };

    const handleOpenEdit = (budget: ExpenseBudget) => {
        setSelectedBudget(budget);
        setModalVisible(true);
    };

    return (
        <View style={[styles.screenContainer, { backgroundColor: colors.surface, paddingTop: insets.top }]}>

            {/* Lista Grid */}
            <FlatList
                data={budgets}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <BudgetCard 
                        item={item} 
                        colors={colors} 
                        onPress={() => handleOpenEdit(item)} 
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: colors.textSecondary }}>No hay presupuestos activos</Text>
                    </View>
                }
            />

            {/* Floating Action Button (FAB) para agregar */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.text, shadowColor: colors.text }]}
                onPress={handleOpenCreate}
                activeOpacity={0.8}
            >
                <MaterialIcons name="add" size={32} color={colors.primary} />
            </TouchableOpacity>

            {/* Modal Formulario */}
            <BudgetFormModal 
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                initialData={selectedBudget}
                onSave={handleSaveForm}
                colors={colors}
            />
        </View>
    );
}

export const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
    },
    screenHeader: {
        paddingHorizontal: 20,
        paddingBottom: 15,
        paddingTop: 10,
    },
    screenTitle: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 100,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    // FAB
    fab: {
        position: 'absolute',
        bottom: 120,
        right: 25,
        width: 60,
        height: 60,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Card Styles
    cardContainer: {
        width: '48%', // Para 2 columnas con espacio
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    cardTouchable: {
        padding: 12,
        minHeight: 140,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardTitle: {
        fontWeight: '700',
        fontSize: 16,
        flex: 1,
        marginRight: 5,
    },
    cardItemsPreview: {
        marginBottom: 10,
        flex: 1,
    },
    miniItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    bullet: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginRight: 4,
    },
    miniItemText: {
        fontSize: 12,
    },
    moreText: {
        fontSize: 11,
        fontStyle: 'italic',
        marginTop: 2,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 6,
    },
    amountText: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    targetText: {
        fontSize: 12,
        marginLeft: 4,
    },
    progressBarBg: {
        height: 4,
        borderRadius: 2,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
   
});



