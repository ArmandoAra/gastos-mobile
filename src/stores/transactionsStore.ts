import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv'; // API Nueva
import type { Transaction } from '../types/schemas';

// 1. Crear la instancia única según la documentación v4.x
export const storage = createMMKV({
    id: 'transactions-storage-id',
    // encryptionKey: 'tu-clave-aqui' // Opcional, para apps financieras
});

// 2. Adaptador para Zustand (State Storage)
const mmkvStorage = {
    setItem: (name: string, value: string) => storage.set(name, value),
    getItem: (name: string) => storage.getString(name) ?? null,
    removeItem: (name: string) => storage.remove(name),
};

interface TransactionsState {
    transactions: Transaction[];
    setTransactions: (transactions: Transaction[]) => void;
    addTransaction: (transaction: Transaction) => void;
    updateTransaction: (id: string, updates: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;
    getByAccount: (accountId: string) => Transaction[];
    getByDateRange: (start: Date, end: Date) => Transaction[];
}

export const useTransactionsStore = create<TransactionsState>()(
    persist(
        (set, get) => ({
            transactions: [],

            setTransactions: (transactions) => set({ transactions }),

            addTransaction: (transaction) =>
                set((state) => ({
                    transactions: [transaction, ...state.transactions]
                })),

            updateTransaction: (id, updates) =>
                set((state) => ({
                    transactions: state.transactions.map((t) =>
                        t.id === id ? { ...t, ...updates } : t
                    ),
                })),

            deleteTransaction: (id) =>
                set((state) => ({
                    transactions: state.transactions.filter((t) => t.id !== id),
                })),

            getByAccount: (accountId) =>
                get().transactions.filter((t) => t.account_id === accountId),

            getByDateRange: (start, end) => {
                const startTime = start.getTime();
                const endTime = end.getTime();
                return get().transactions.filter((t) => {
                    const txDate = new Date(t.date).getTime();
                    return txDate >= startTime && txDate <= endTime;
                });
            },
        }),
        {
            name: 'transactions-storage', // Nombre de la clave dentro de MMKV
            storage: createJSONStorage(() => mmkvStorage),
        }
    )
);