import { create } from 'zustand'
import { persist, createJSONStorage, devtools, StateStorage } from 'zustand/middleware'
import { createMMKV } from 'react-native-mmkv' // 1. Importar MMKV
import { Account, Transaction, TransactionType } from '../interfaces/data.interface'
import { createAccount } from '../../../Gastos/frontend/app/actions/db/Accounts_API';
import * as uuid from 'uuid';
import { se } from 'date-fns/locale';
import { transferTransactionsAccount } from '../../../Gastos/frontend/app/actions/db/Gastos_API';

// ============================================
// CONFIGURACIÓN MMKV
// ============================================

// 2. Crear la instancia de MMKV
export const storage =  createMMKV({
    id: 'data-storage', // Opcional: ID específico para esta instancia
    // encryptionKey: 'clave-secreta' // Opcional: Si necesitas encriptación
})

// 3. Crear el adaptador para Zustand
const zustandStorage: StateStorage = {
    setItem: (name, value) => {
        return storage.set(name, value)
    },
    getItem: (name) => {
        const value = storage.getString(name)
        return value ?? null
    },
    removeItem: (name) => {
        return storage.remove(name)
    },
}

// ============================================
// TIPOS (Sin cambios)
// ============================================

type PersistedState = {
    selectedAccount: string
    allAccounts: Account[]
    transactions: Transaction[] 
}

type TransientState = {
    selectedExpenseOrIncome: TransactionType | null
    fetching: boolean
    _hasHydrated: boolean
    error: string | null
}

type State = PersistedState & TransientState

type Actions = {
    // === Account Management ===
    setSelectedAccount: (accountId: string) => void
    setAllAccounts: (accounts: Account[]) => void
    getAllAccountsByUserId: (userId: string) => Account[]
    addAccount: (account: Account) => void
    createAccount: (accountData: Partial<Account>) => Promise<void>
    updateAccount: (accountId: string, data: Partial<Account>) => void
    updateAccountBalance: (accountId: string, amount: number, transactionType?: TransactionType) => void
    syncAccountsWithTransactions: () => void
    transferAllAccountTransactions: (fromAccountId: string, toAccountId: string) => void
    deleteSomeAmountInAccount: (accountId: string, amount: number, transactionType: TransactionType) => void
    deleteAccountStore: (accountId: string) => void
    getAccountById: (accountId: string) => Account | undefined
    deleteAllAccounts: () => void

    // === Transaction Management ===
    setTransactions: (transactions: Transaction[]) => void
    addTransactionStore: (transaction: Transaction) => void
    updateTransaction: (updatedTransaction: Partial<Transaction>) => void
    deleteTransaction: (transactionId: string) => void
    getAllTransactionsByUserId: (userId: string) => Transaction[]
    getTransactionsByAccount: (accountId: string) => Transaction[]
    clearTransactions: () => void

    // === Filter & UI State ===
    setSelectedExpenseOrIncome: (type: TransactionType | null) => void
    toggleExpenseIncome: () => void

    // === Loading & Error ===
    setFetching: (state: boolean) => void
    setError: (error: string | null) => void

    // === Hydration ===
    setHasHydrated: (state: boolean) => void

    // === Utility ===
    reset: () => void
}

// ============================================
// VALORES INICIALES
// ============================================

const initialState: State = {
    selectedAccount: '',
    allAccounts: [],
    transactions: [],
    selectedExpenseOrIncome: null,
    fetching: false,
    _hasHydrated: false,
    error: null,
}

// ============================================
// STORE
// ============================================

const useDataStore = create<State & Actions>()(
    devtools(
        persist(
            (set, get) => ({
                ...initialState,

                // === ACCOUNT MANAGEMENT ===

                createAccount: async (accountData: Partial<Account>) => {
                    // Lógica para crear una cuenta (simulación)
                    const newAccount: Account = {   
                        id: uuid.v4(), 
                        name: accountData.name || 'New Account',
                        type: accountData.type || 'Checking',
                        balance:  0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        userId: accountData.userId || '',
                    };
                    set(
                        (state) => ({
                            allAccounts: [...state.allAccounts, newAccount],
                            selectedAccount: state.selectedAccount || newAccount.id,
                            error: null,
                        }),
                        false,
                        'createAccount'
                    );
                },

                setSelectedAccount: (accountId: string) => {
                    set({ selectedAccount: accountId, error: null }, false, 'setSelectedAccount')
                },

                getAllAccountsByUserId: (userId: string): Account[] => {
                    return get().allAccounts.filter(account => account.userId === userId);
                },

                setAllAccounts: (accounts: Account[]) => {
                    set({ allAccounts: accounts, error: null }, false, 'setAllAccounts')
                },

                addAccount: (account: Account) => {
                    set(
                        (state) => ({
                            allAccounts: [...state.allAccounts, account],
                            selectedAccount: state.selectedAccount || account.id,
                            error: null,
                        }),
                        false,
                        'addAccount'
                    )
                },

                updateAccount: (accountId: string, data: Partial<Account>) => {
                    set(
                        (state) => ({
                            allAccounts: state.allAccounts.map(acc =>
                                acc.id === accountId ? { ...acc, ...data } : acc
                            ),
                            error: null,
                        }),
                        false,
                        'updateAccount'
                    )
                },

                updateAccountBalance: (accountId: string, amount: number, transactionType?: TransactionType) => {
                    function calculateBalance(currentBalance: number, amount: number, type?: TransactionType): number {
                        const absAmount = Math.abs(amount);
                        if (type === TransactionType.INCOME) return currentBalance + absAmount;
                        if (type === TransactionType.EXPENSE) return currentBalance - absAmount;
                        return currentBalance;
                    }

                    set(
                        (state) => ({
                            allAccounts: state.allAccounts.map(acc =>
                                acc.id === accountId
                                    ? { ...acc, balance: calculateBalance(acc.balance, amount, transactionType) }
                                    : acc
                            ),
                            error: null,
                        }),
                        false,
                        'updateAccountBalance'
                    )
                },

                transferAllAccountTransactions: (fromAccountId: string, toAccountId: string) => {
                    // Esto esta cambiando el id de fromAccountId a toAccountId en todas las transacciones
                    set(
                        (state) => ({
                            transactions: state.transactions.map(t =>
                                t.account_id === fromAccountId
                                    ? { ...t, account_id: toAccountId }
                                    : t
                            ),
                            error: null,
                        }),
                        false,
                        'transferAllAccountTransactions'
                    )
                },

                getAccountById: (accountId: string) => get().allAccounts.find(acc => acc.id === accountId),

                deleteSomeAmountInAccount: (accountId: string, amount: number, transactionType: TransactionType) => {
                    const amountToDelete = transactionType === TransactionType.INCOME ? amount : -amount;
                    set(
                        (state) => ({
                            allAccounts: state.allAccounts.map(acc =>
                                acc.id === accountId
                                    ? { ...acc, balance: acc.balance - amountToDelete }
                                    : acc
                            ),
                            error: null,
                        }),
                        false,
                        'deleteSomeAmountInAccount'
                    )
                },

                deleteAccountStore: (accountId: string) => {
                    set(
                        (state) => {
                            const newAccounts = state.allAccounts.filter(acc => acc.id !== accountId)
                            const needsNewSelection = state.selectedAccount === accountId
                            return {
                                allAccounts: newAccounts,
                                selectedAccount: needsNewSelection ? (newAccounts[0]?.id || '') : state.selectedAccount,
                                transactions: state.transactions.filter(t => t.account_id !== accountId),
                                error: null,
                            }
                        },
                        false,
                        'deleteAccount'
                    )
                },

                deleteAllAccounts: () => {
                    set({
                        allAccounts: [],
                        selectedAccount: '',
                    }, false, 'deleteAllAccounts')
                },

                syncAccountsWithTransactions: () => {
                    const accounts = get().allAccounts;
                    const transactions = get().transactions;
                    const updatedAccounts = accounts.map(account => {
                        const relatedTransactions = transactions.filter(t => t.account_id === account.id);
                        const newBalance = relatedTransactions.reduce((sum, t) => {
                            return t.type === TransactionType.INCOME ? sum + t.amount : sum - t.amount;
                        }, 0);
                        return { ...account, balance: newBalance };
                    });
                    set({ allAccounts: updatedAccounts }, false, 'syncAccountsWithTransactions');
                },


                // === TRANSACTION MANAGEMENT ===

                setTransactions: (transactions: Transaction[]) => {
                    set({ transactions, error: null }, false, 'setTransactions')
                },

                addTransactionStore: (transaction: Transaction) => {
                    set(
                        (state) => ({
                            transactions: [transaction, ...state.transactions],
                            error: null,
                        }),
                        false,
                        'addTransactionStore'
                    )
                },

                updateTransaction: (updatedTransaction: Partial<Transaction>) => {
                    set(
                        (state) => ({
                            transactions: state.transactions.map(t =>
                                t.id === updatedTransaction.id ? { ...t, ...updatedTransaction } : t
                            ),
                            error: null,
                        }),
                        false,
                        'updateTransaction'
                    )
                },

                deleteTransaction: (transactionId: string) => {
                    set(
                        (state) => ({
                            transactions: state.transactions.filter(t => t.id !== transactionId),
                            error: null,
                        }),
                        false,
                        'deleteTransaction'
                    )
                },

                getAllTransactionsByUserId: (userId: string): Transaction[] => {
                    return get().transactions.filter(transaction => transaction.user_id === userId);
                },

                getTransactionsByAccount: (accountId: string) => {
                    return get().transactions.filter(t => t.account_id === accountId)
                },

                clearTransactions: () => set({ transactions: [] }, false, 'clearTransactions'),

                // === FILTERS & UI ===

                setSelectedExpenseOrIncome: (type: TransactionType | null) => {
                    set({ selectedExpenseOrIncome: type }, false, 'setSelectedExpenseOrIncome')
                },

                toggleExpenseIncome: () => {
                    set(
                        (state) => ({
                            selectedExpenseOrIncome:
                                state.selectedExpenseOrIncome === TransactionType.EXPENSE
                                    ? TransactionType.INCOME
                                    : state.selectedExpenseOrIncome === TransactionType.INCOME
                                        ? null
                                        : TransactionType.EXPENSE,
                        }),
                        false,
                        'toggleExpenseIncome'
                    )
                },

                setFetching: (state: boolean) => set({ fetching: state }, false, 'setFetching'),
                setError: (error: string | null) => set({ error }, false, 'setError'),
                setHasHydrated: (state: boolean) => set({ _hasHydrated: state }, false, 'setHasHydrated'),
                reset: () => set(initialState, false, 'reset'),
            }),
            {
                name: 'data-storage',
                // 4. USAR EL STORAGE DE MMKV
                storage: createJSONStorage(() => zustandStorage), 
                version: 1,
                partialize: (state) => ({
                    selectedAccount: state.selectedAccount,
                    allAccounts: state.allAccounts,
                    transactions: state.transactions,
                }),
                onRehydrateStorage: () => (state) => {
                    state?.setHasHydrated(true)
                },
            }
        ),
        { name: 'DataStore' }
    )
)

export default useDataStore;