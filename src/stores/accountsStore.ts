// ============================================
// ACCOUNTS STORE (src/stores/accountsStore.ts)
// ============================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();

const mmkvStorage = {
    setItem: (name: string, value: string) => storage.set(name, value),
    getItem: (name: string) => storage.getString(name) ?? null,
    removeItem: (name: string) => storage.remove(name),
};

export interface Account {
    id: string;
    user_id: string;
    name: string;
    type: 'checking' | 'savings' | 'cash';
    balance: number;
    created_at: string;
    updated_at: string;
}

interface AccountsState {
    accounts: Account[];
    selectedAccountId: string | null;
    setAccounts: (accounts: Account[]) => void;
    addAccount: (account: Account) => void;
    updateAccount: (id: string, updates: Partial<Account>) => void;
    deleteAccount: (id: string) => void;
    selectAccount: (id: string) => void;
    getAccountById: (id: string) => Account | undefined;
    getTotalBalance: () => number;
    updateBalance: (id: string, amount: number) => void;
    deleteAllAccounts: () => void;
}

export const useAccountsStore = create<AccountsState>()(
    persist(
        (set, get) => ({
            accounts: [],
            selectedAccountId: null,

            setAccounts: (accounts) => set({ accounts }),

            addAccount: (account) =>
                set((state) => ({
                    accounts: [...state.accounts, account]
                })),

            updateAccount: (id, updates) =>
                set((state) => ({
                    accounts: state.accounts.map((acc) =>
                        acc.id === id ? { ...acc, ...updates, updated_at: new Date().toISOString() } : acc
                    ),
                })),

            deleteAccount: (id) =>
                set((state) => ({
                    accounts: state.accounts.filter((acc) => acc.id !== id),
                    selectedAccountId: state.selectedAccountId === id ? null : state.selectedAccountId,
                })),

            selectAccount: (id) => set({ selectedAccountId: id }),

            getAccountById: (id) => get().accounts.find((acc) => acc.id === id),

            getTotalBalance: () =>
                get().accounts.reduce((sum, acc) => sum + acc.balance, 0),

            updateBalance: (id, amount) =>
                set((state) => ({
                    accounts: state.accounts.map((acc) =>
                        acc.id === id
                            ? { ...acc, balance: acc.balance + amount, updated_at: new Date().toISOString() }
                            : acc
                    ),
                })),

            deleteAllAccounts: () => set({ accounts: [], selectedAccountId: null }),
        }),
        {
            name: 'accounts-storage',
            storage: createJSONStorage(() => mmkvStorage),
        }
    )
);
