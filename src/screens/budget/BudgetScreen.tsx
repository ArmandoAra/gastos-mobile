import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Animated from 'react-native-reanimated'; // Importación correcta
import { FlashList } from '@shopify/flash-list';

// Componentes
import { BudgetCard } from './components/BudgetCard';
import { BudgetFormModal } from './components/BudgetFormModal';
import InfoPopUp from '../../components/messages/InfoPopUp';
import TransactionForm from '../../components/forms/TransactionForm';

// Hooks y Stores
import { useTransactionsLogic } from '../transactions/hooks/useTransactionsLogic';
import { ExpenseBudget } from '../../interfaces/data.interface';
import useBudgetsStore from '../../stores/useBudgetStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { AnimatedBudgetFlashList } from '../../components/animatedFlashList/AnimatedFlashList';

export function BudgetScreen() {
    const { colors } = useTransactionsLogic();
    const { t } = useTranslation();
    const { isAddOptionsOpen, setIsAddOptionsOpen } = useSettingsStore();

    // 2. CORRECCIÓN REACTIVIDAD: Traemos la DATA, no la función getter.
    // Asumiendo que tu store tiene una propiedad 'budgets' o 'userBudgets'.
    // Si tu store solo tiene getUserBudgets, debes cambiar el store o usar un selector que devuelva el array.
    const budgets = useBudgetsStore(state => state.budgets); 

    const [filter, setFilter] = useState<'all' | 'favorites'>('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<ExpenseBudget | null>(null);

    const { onScroll } = useScrollDirection();

    // Lógica de filtrado (Ahora depende de 'budgets' que es reactivo)
    const filteredBudgets = useMemo(() => {
        if (!budgets) return []; // Protección
        if (filter === 'favorites') {
            return budgets.filter(b => b.favorite === true);
        }
        return budgets;
    }, [budgets, filter]);

    const handleOpenCreate = () => {
        setSelectedBudget(null);
        setModalVisible(true);
    };

    const handleOpenEdit = (budget: ExpenseBudget) => {
        setSelectedBudget(budget);
        setModalVisible(true);
    };

    return (
        <View style={[styles.screenContainer, { backgroundColor: colors.surface }]}>
            <InfoPopUp />

            {/* --- ZONA SUPERIOR (FILTROS) --- */}
            {/* 3. CORRECCIÓN LAYOUT: Quitamos 'absolute' y 'top: -50' para que se vea normal */}
            <View style={[styles.headerContainer, { backgroundColor: colors.surface }]}>
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        onPress={() => setFilter('all')}
                        style={[
                            styles.filterButton,
                            filter === 'all'
                                ? { backgroundColor: colors.text, borderColor: colors.text }
                                : { backgroundColor: 'transparent', borderColor: colors.border }
                        ]}
                    >
                        <Text style={[
                            styles.filterText,
                            { color: filter === 'all' ? colors.surfaceSecondary : colors.textSecondary }
                        ]}>
                            {t('budget_form.menu.todos') || "Todos"}
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
                            {t('budget_form.menu.favorites') || "Favoritos"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- LISTA DE PRESUPUESTOS --- */}
            <View style={{ flex: 1 }}>
                <AnimatedBudgetFlashList
                    data={filteredBudgets}
                    keyExtractor={(item) => item.id}
                    // 4. CORRECCIÓN PERFORMANCE: Obligatorio en FlashList
                    onScroll={onScroll}
                    scrollEventThrottle={16}

                    contentContainerStyle={{
                        paddingHorizontal: 10, // Un poco más de margen lateral
                        paddingTop: 10,
                        paddingBottom: Platform.OS === 'ios' ? 120 : 140
                    }}

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
                            <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 16 }}>
                                {filter === 'favorites'
                                    ? "No tienes favoritos guardados"
                                    : (t('budget_screen.empty_state') || "No hay presupuestos activos")
                                }
                            </Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* FAB */}
            <TouchableOpacity
                style={[
                    styles.fab,
                    {
                        backgroundColor: colors.text,
                        bottom: Platform.OS === 'ios' ? 100 : 120
                    }
                ]}
                onPress={handleOpenCreate}
            >
                <MaterialIcons name="add" size={32} color={colors.surfaceSecondary} />
            </TouchableOpacity>

            {/* Modales */}
            <BudgetFormModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                initialData={selectedBudget}
                colors={colors}
                onSave={() => { /* La lógica de guardado suele ir dentro del modal o store */ }}
            />

            <TransactionForm isOpen={isAddOptionsOpen} onClose={() => setIsAddOptionsOpen(false)} />
        </View>
    );
}

export const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        paddingHorizontal: 12,
        // paddingTop eliminado aquí, manejado por safe area o header
    },
    // Cambiado de fixedHeader (absolute) a headerContainer (flex)
    headerContainer: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        zIndex: 10, // Para asegurar que esté por encima si hay sombras
    // Si quieres que flote sobre el scroll pero con fondo, añade elevation/shadow
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        alignItems: 'center',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterText: {
        fontFamily: 'FiraSans-Bold',
        fontSize: 13,
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        zIndex: 999,
    },
});