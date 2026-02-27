import React, { useCallback } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    TextInput,
    StyleSheet,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

// Componentes
import AddTransactionsButton from "../../components/buttons/AddTransactionsButton";
import InfoPopUp from "../../components/messages/InfoPopUp";
import { TransactionItemMobile } from "./components/TransactionItem";
import { formatCurrency } from "../../utils/helpers";
import FilterFloatingButton from "./components/FilterFloatingButton";
import { useSettingsStore } from "../../stores/settingsStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import InfoHeader from "../../components/headers/InfoHeader";
import { useTransactionsLogic } from "./hooks/useTransactionsLogic";
import TransactionForm from '../../components/forms/TransactionForm';
import { useScrollDirection } from "../../hooks/useScrollDirection";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ListItem } from "../../interfaces/items.interface";
import { AnimatedFlashList } from "../../components/animatedFlashList/AnimatedFlashList";
import { globalStyles } from "../../theme/global.styles";
import { darkTheme, lightTheme } from "../../theme/colors";
import { ThemeColors } from "../../types/navigation";
import { LinearGradient } from 'expo-linear-gradient';




export function TransactionsScreen() {
    const {
        viewMode,
        filter,
        searchQuery,
        t,
        listData,
        accountSelected,
        allAccounts,
        stickyHeaderIndices,
        isEditModalOpen,
        editingTransaction,
        setViewMode,
        setFilter,
        setSearchQuery,
        setAccountSelected,
        handleDelete,
        handleSave,
        handleOpenEdit,
        handleCloseEdit,
        getGroupTitle
    } = useTransactionsLogic();
    const theme = useSettingsStore((state) => state.theme);
    const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;
    const language = useSettingsStore((state) => state.language);

    const { isAddOptionsOpen, setIsAddOptionsOpen } = useSettingsStore();
    const { onScroll } = useScrollDirection();
    const insets = useSafeAreaInsets();

    const renderItem = useCallback(({ item }: { item: ListItem }) => {
        if (item.type === 'header') {
            const title = getGroupTitle(item.date);
            const totalFormatted = formatCurrency(item.total);

            return (
                <View
                    style={[styles.dateHeader, { backgroundColor: colors.text }]}
                    accessibilityRole="header"
                    accessibilityLabel={`${title}, total ${totalFormatted}`}
                >
                    <Text
                        style={[globalStyles.headerTitleSm, { color: colors.surface }]}
                        maxFontSizeMultiplier={1.5}
                    >
                        {title.toLocaleUpperCase()}
                    </Text>
                    <Text
                        style={[
                            globalStyles.amountSm,
                            { color: item.total < 0 ? colors.error : colors.success }
                        ]}
                        maxFontSizeMultiplier={1.5}
                    >
                        {totalFormatted}
                    </Text>
                </View>
            );
        }

        return (
            <TransactionItemMobile
                transaction={item.data}
                onDelete={handleDelete}
                colors={colors}
                onEditPress={handleOpenEdit} 
            />
        );
    }, [colors, handleDelete, handleSave, viewMode, handleOpenEdit, getGroupTitle]);

    const keyExtractor = useCallback((item: ListItem) => {
        return item.type === 'header' ? item.id : item.data.id;
    }, []);

    return (
        <LinearGradient
            // 1. Colores del gradiente (de arriba hacia abajo usando tu tema)
            colors={[colors.surfaceSecondary, theme === 'dark' ? colors.primary : colors.accent,]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}

            // 2. Quitamos el backgroundColor sólido para que se vea el gradiente
            style={[
                globalStyles.screenContainer,
                { paddingTop: insets.top }
            ]}
        >
            <InfoPopUp />

            <InfoHeader viewMode={viewMode} colors={colors} language={language} />

            {/* --- CONTROLES Y FILTROS --- */}
            <View style={[
                styles.controlsContainer,
                { borderBottomColor: colors.border }
            ]}>
                {/* Grupo Izquierdo */}
                <View style={styles.filterGroup}>
                    <FilterFloatingButton
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        filter={filter}
                        setFilter={setFilter}
                        colors={colors}
                        accountSelected={accountSelected}
                        setAccountSelected={setAccountSelected}
                        allAccounts={allAccounts}
                    />
                    <View style={styles.badgesContainer}>
                        <Text style={[styles.modeLabel, { backgroundColor: colors.text, color: colors.surface }]}>
                            {t(`transactions.${viewMode}`)}
                        </Text>
                        <Text style={[styles.modeLabel, { backgroundColor: colors.text, color: colors.surface }]}>
                            {t(`transactions.${filter}Plural`)}
                        </Text>
                    </View>
                </View>

                {/* Grupo Derecho: Búsqueda */}
                <View style={[styles.searchContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} importantForAccessibility="no" />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder={`${t('transactions.searchPlaceholder')} ${t(`transactions.${viewMode}`).toLowerCase()}`}
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCorrect={false}
                        accessibilityLabel={t('transactions.searchPlaceholder', 'Search transactions')}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setSearchQuery('')}
                            accessibilityRole="button"
                            accessibilityLabel={t('common.clear', 'Clear search')}
                            style={{ padding: 4 }}
                        >
                            <Ionicons name="close-circle" size={20} color={colors.text} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={{ height: 1 }} />

            {/* --- LISTA --- */}
            <View style={{ flex: 1, paddingHorizontal: 4 }}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <AnimatedFlashList
                        data={listData}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        style={{ height: 150 }}
                        // 3. Conectamos el handler
                        onScroll={onScroll}
                        scrollEventThrottle={16} // Importante para suavidad
                        stickyHeaderIndices={stickyHeaderIndices}
                        contentContainerStyle={{ paddingBottom: 160 }}
                        keyboardDismissMode="on-drag"
                        ListEmptyComponent={
                            <View style={styles.emptyState} accessible={true}>
                                <MaterialIcons name="receipt-long" size={48} color={colors.textSecondary} importantForAccessibility="no" />
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                    {`${t('transactions.notFound')} ${t(`transactions.${viewMode}`).toLowerCase()}.`}
                                </Text>
                            </View>
                        }
                    />
                </GestureHandlerRootView>
            </View>

            {/* --- MODALES --- */}

            {/* 1. Modal para CREAR (Botón Flotante) */}
            <TransactionForm
                isOpen={isAddOptionsOpen}
                onClose={() => setIsAddOptionsOpen(false)}
            />

            {/* 2. Modal para EDITAR (Controlado por este componente) */}
            <TransactionForm
                isOpen={isEditModalOpen}
                onClose={handleCloseEdit}
                transactionToEdit={editingTransaction}
            />

            <AddTransactionsButton />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    controlsContainer: {
        borderBottomWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 4,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 8,
    },
    filterGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
    },
    badgesContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 4,
        maxWidth: 100,
    },
    modeLabel: {
        fontFamily: 'FiraSans-Bold',
        paddingHorizontal: 8,
        paddingVertical: 1,
        borderRadius: 14,
        textTransform: 'capitalize',
        fontSize: 11,
        overflow: 'hidden',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 100,
        minHeight: 44,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 0.5,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 8,
        height: '100%',
        fontFamily: 'FiraSans-Regular',
    },
    dateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 2,
        paddingLeft: 20,
        paddingHorizontal: 12,
        marginBottom: 8,
        marginTop: 2,
        borderRadius: 25,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        opacity: 0.7,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'FiraSans-Regular',
    }
});