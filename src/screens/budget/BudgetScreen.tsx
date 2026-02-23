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

// Componentes
import { BudgetCard } from './components/BudgetCard';
import { BudgetFormModal } from './components/BudgetFormModal';
import InfoPopUp from '../../components/messages/InfoPopUp';
import TransactionForm from '../../components/forms/TransactionForm';

// Hooks y Stores
import { ExpenseBudget } from '../../interfaces/data.interface';
import useBudgetsStore from '../../stores/useBudgetStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { AnimatedBudgetFlashList } from '../../components/animatedFlashList/AnimatedFlashList';
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles } from '../../theme/global.styles';
import { ThemeColors } from '../../types/navigation';
import { darkTheme, lightTheme } from '../../theme/colors';

export function BudgetScreen() {
    const theme = useSettingsStore((state) => state.theme);
    const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;

    const { t } = useTranslation();
    const { isAddOptionsOpen, setIsAddOptionsOpen } = useSettingsStore();

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
        <LinearGradient
            // 1. Colores del gradiente (de arriba hacia abajo usando tu tema)
            colors={[colors.surfaceSecondary, theme === 'dark' ? colors.primary : colors.accent,]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}

            // 2. Quitamos el backgroundColor sólido para que se vea el gradiente
            style={[
                globalStyles.screenContainer,
            ]}
        >
            <InfoPopUp />

            <View style={[styles.headerContainer, { backgroundColor: 'transparent' }]}>
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
                        paddingHorizontal: 4, // Un poco más de margen lateral
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
        </LinearGradient>
    );
}

export const styles = StyleSheet.create({
    headerContainer: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        zIndex: 10, 
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