import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Componentes
import { BudgetCard } from './components/BudgetCard';
import { BudgetFormModal } from './components/BudgetFormModal';
import InfoPopUp from '../../components/messages/InfoPopUp';

// Hooks y Stores
import { useTransactionsLogic } from '../transactions/hooks/useTransactionsLogic';
import { ExpenseBudget } from '../../interfaces/data.interface';
import useBudgetsStore from '../../stores/useBudgetStore';
import { useSettingsStore } from '../../stores/settingsStore';
import TransactionForm from '../../components/forms/TransactionForm';

export function BudgetScreen() {
    const { colors } = useTransactionsLogic();
    const { t } = useTranslation();
    const isAddOptionsOpen = useSettingsStore(state => state.isAddOptionsOpen);
    const setIsAddOptionsOpen = useSettingsStore(state => state.setIsAddOptionsOpen);

    // Accedemos a los presupuestos desde el Store
    const getUserBudgets = useBudgetsStore(state => state.getUserBudgets);

    // Estado para el filtro
    const [filter, setFilter] = useState<'all' | 'favorites'>('all');

    // Estado local para el modal
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<ExpenseBudget | null>(null);

    // Lógica de filtrado
    const filteredBudgets = useMemo(() => {
        const budgets = getUserBudgets();
        if (filter === 'favorites') {
            return budgets.filter(b => b.favorite === true);
        }
        return budgets;
    }, [modalVisible, filter]);

    const handleOpenCreate = () => {
        setSelectedBudget(null);
        setModalVisible(true);
    };

    const handleOpenEdit = (budget: ExpenseBudget) => {
        setSelectedBudget(budget);
        setModalVisible(true);
    };

    return (
        <View style={[styles.screenContainer, { backgroundColor: colors.surface, paddingTop: 5 }]}>
            <InfoPopUp />

            {/* --- ZONA FIJA SUPERIOR (FILTROS) --- */}
            <View style={[styles.fixedHeader]}>
                {/* Botones alineados a la derecha */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        onPress={() => setFilter('all')}
                        style={[
                            styles.filterButton,
                            filter === 'all'
                                ? { backgroundColor: colors.text, borderColor: colors.text }
                                : { backgroundColor: 'transparent', borderColor: colors.border }
                        ]}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.filterText,
                            { color: filter === 'all' ? colors.surfaceSecondary : colors.textSecondary }
                        ]}>
                            {t('budget_form.menu.todos') || "All"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setFilter('favorites')}
                        style={[
                            styles.filterButton,
                            filter === 'favorites'
                                ? { backgroundColor: colors.text, borderColor: colors.text }
                                : { backgroundColor: 'transparent', borderColor: colors.border }
                        ]}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons
                            name="star"
                            size={16}
                            color={filter === 'favorites' ? colors.warning : colors.textSecondary}
                            style={{ marginRight: 4 }}
                        />
                        <Text style={[
                            styles.filterText,
                            { color: filter === 'favorites' ? colors.surfaceSecondary : colors.textSecondary }
                        ]}>
                            {t('budget_form.menu.favorites') || "Favorites"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- LISTA DE PRESUPUESTOS (COLUMNA ÚNICA) --- */}
            <FlatList
                data={filteredBudgets}
                keyExtractor={(item) => item.id}

                // Eliminado numColumns y columnWrapperStyle para que sea una columna vertical estándar

                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: Platform.OS === 'ios' ? 120 : 140 }
                ]}

                // Añadimos un separador visual entre tarjetas
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}

                renderItem={({ item }) => (
                    <BudgetCard
                        item={item}
                        colors={colors}
                        onPress={() => handleOpenEdit(item)}
                    />
                )}

                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="account-balance-wallet" size={64} color={colors.textSecondary + "40"} style={{ marginBottom: 10 }} />
                        <Text
                            style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 16 }}
                            accessibilityRole="text"
                        >
                            {filter === 'favorites'
                                ? "No tienes favoritos guardados"
                                : (t('budget_screen.empty_state') || "No hay presupuestos activos")
                            }
                        </Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />

            {/* FAB (Botón Flotante) */}
            <TouchableOpacity
                style={[
                    styles.fab,
                    {
                        backgroundColor: colors.text,
                        shadowColor: "#000",
                        bottom: Platform.OS === 'ios' ? 100 : 120
                    }
                ]}
                onPress={handleOpenCreate}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t('budget_screen.fab_label') || "Crear nuevo presupuesto"}
            >
                <MaterialIcons name="add" size={32} color={colors.surfaceSecondary} />
            </TouchableOpacity>

            {/* Modal de Formulario */}
            <BudgetFormModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                initialData={selectedBudget}
                colors={colors}
                onSave={() => { }}
            />


            <TransactionForm isOpen={isAddOptionsOpen} onClose={() => setIsAddOptionsOpen(false)} />
        </View>
    );
}

export const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        // Eliminamos paddingBottom global para manejarlo en el FlatList
    },
    // Contenedor fijo arriba
    fixedHeader: {
        position: 'absolute',
        top: -50,
        right: 0,
        paddingHorizontal: 5,
        zIndex: 1,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end', // ALINEA A LA DERECHA
        gap: 10,
        alignItems: 'center',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6, // Un poco más compacto
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterText: {
        fontFamily: 'FiraSans-Bold',
        fontSize: 13,
    },
    listContent: {
        paddingHorizontal: 5,
        paddingTop: 5, 
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    fab: {
        position: 'absolute',
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        zIndex: 999,
    },
});