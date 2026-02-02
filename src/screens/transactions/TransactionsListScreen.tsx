import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    TextInput,
    StyleSheet,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";

// Componentes
import AddTransactionsButton from "../../components/buttons/AddTransactionsButton";
import InfoPopUp from "../../components/messages/InfoPopUp";
import { TransactionItemMobile } from "./components/TransactionItem";

// Stores & Interfaces
import { Transaction } from "../../interfaces/data.interface";
import { formatCurrency } from "../../utils/helpers";
import FilterFloatingButton from "./components/FilterFloatingButton";
import { useSettingsStore } from "../../stores/settingsStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import InfoHeader from "../../components/headers/InfoHeader";
import { useTransactionsLogic } from "./hooks/useTransactionsLogic";
import TransactionForm from '../../components/forms/TransactionForm';
import { useScrollDirection } from "../../hooks/useScrollDirection";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ListItem =
    | { type: 'header'; date: string; total: number; id: string }
    | { type: 'transaction'; data: Transaction };

export function TransactionsScreen() {
    const {
        viewMode,
        setViewMode,
        filter,
        setFilter,
        searchQuery,
        setSearchQuery,
        colors,
        t,
        listData,
        accountSelected,
        setAccountSelected,
        allAccounts,
        stickyHeaderIndices,
        handleDelete,
        handleSave,
        isEditModalOpen,
        editingTransaction,
        handleOpenEdit,
        handleCloseEdit,
        getGroupTitle
    } = useTransactionsLogic();

    const { isAddOptionsOpen, setIsAddOptionsOpen } = useSettingsStore();
    const { onScroll } = useScrollDirection();
    const insets = useSafeAreaInsets();

    const renderItem = useCallback(({ item }: { item: ListItem }) => {
        if (item.type === 'header') {
            const title = getGroupTitle(item.date);
            const totalFormatted = formatCurrency(item.total);

            return (
                <View
                    style={[localStyles.dateHeader, { backgroundColor: colors.surfaceSecondary }]}
                    accessibilityRole="header"
                    accessibilityLabel={`${title}, total ${totalFormatted}`}
                >
                    <Text
                        style={[localStyles.dateHeaderText, { color: colors.text }]}
                        maxFontSizeMultiplier={1.5}
                    >
                        {title}
                    </Text>
                    <Text
                        style={[
                            localStyles.dateHeaderTotal,
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
        <View style={[localStyles.container, { backgroundColor: colors.surface, paddingTop: insets.top }]}>
            <InfoPopUp />
            <InfoHeader viewMode={viewMode} />

            {/* --- CONTROLES Y FILTROS --- */}
            <View style={[localStyles.controlsContainer, { borderBottomColor: colors.border }]}>
                {/* Grupo Izquierdo */}
                <View style={localStyles.filterGroup}>
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
                    <View style={localStyles.badgesContainer}>
                        <Text style={[localStyles.modeLabel, { backgroundColor: colors.text, color: colors.surface }]}>
                            {t(`transactions.${viewMode}`)}
                        </Text>
                        <Text style={[localStyles.modeLabel, { backgroundColor: colors.text, color: colors.surface }]}>
                            {t(`transactions.${filter}Plural`)}
                        </Text>
                    </View>
                </View>

                {/* Grupo Derecho: Búsqueda */}
                <View style={[localStyles.searchContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} importantForAccessibility="no" />
                    <TextInput
                        style={[localStyles.searchInput, { color: colors.text }]}
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
            <View style={{ flex: 1 }}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <FlashList
                        data={listData}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        style={{ height: 150 }}
                        onScroll={onScroll}
                        stickyHeaderIndices={stickyHeaderIndices}
                        contentContainerStyle={{ paddingBottom: 160, paddingHorizontal: 8 }}
                        keyboardDismissMode="on-drag"
                        ListEmptyComponent={
                            <View style={localStyles.emptyState} accessible={true}>
                                <MaterialIcons name="receipt-long" size={48} color={colors.textSecondary} importantForAccessibility="no" />
                                <Text style={[localStyles.emptyText, { color: colors.textSecondary }]}>
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
        </View>
    );
}

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    controlsContainer: {
        paddingHorizontal: 8,
        borderBottomWidth: 0.5,
        paddingVertical: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
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
        paddingVertical: 3,
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
        borderWidth: 1,
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
        paddingVertical: 8,
        paddingLeft: 20,
        paddingHorizontal: 12,
        marginBottom: 8,
        marginTop: 0,
        borderRadius: 8,
    },
    dateHeaderText: {
        fontSize: 14,
        fontFamily: 'Tinos-Bold',
        textTransform: 'capitalize',
    },
    dateHeaderTotal: {
        fontSize: 14,
        fontFamily: 'FiraSans-Bold',
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