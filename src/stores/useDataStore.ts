import { create } from 'zustand'
import { persist, createJSONStorage, devtools, StateStorage } from 'zustand/middleware'
import { createMMKV } from 'react-native-mmkv' // 1. Importar MMKV
import { Account, Category, Transaction, TransactionType } from '../interfaces/data.interface'
import * as uuid from 'uuid';
import { useAuthStore } from './authStore';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { migrateTransactions } from '../migrations/migrateTransactions';

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

export type PersistedState = {
    balance: number | undefined
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
    getAccountNameById: (accountId: string) => string
    getUserAccounts: () => Account[]
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
    // getAllTransactionsByUserId: (userId: string) => Transaction[]
    getUserTransactions: () => Transaction[]
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
    balance: 0,
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
                    set({ fetching: true }); // Indicar carga
                    try {
                        const newAccount: Account = {
                            id: uuid.v4(),
                            name: accountData?.name || 'New Account',
                            type: accountData?.type || 'Checking',
                            balance: 0,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            userId: accountData.userId || '',
                        };

                        // AQUÍ podrías llamar a tu API si fuera necesario:
                        // await api.createAccount(newAccount);

                        set((state) => ({
                            allAccounts: [...state.allAccounts, newAccount],
                            selectedAccount: state.selectedAccount || newAccount.id,
                            error: null,
                            fetching: false
                        }));
                    } catch (e) {
                        set({ error: 'Error creating account', fetching: false });
                    }
                },

                setSelectedAccount: (accountId: string) => {
                    set({ selectedAccount: accountId, error: null }, false, 'setSelectedAccount')
                },

                getAccountNameById: (accountId: string): string => {
                    const account = get().allAccounts.find(acc => acc.id === accountId);
                    return account ? account.name : 'Unknown Account';
                },

                getUserAccounts: (): Account[] => {
                    const currentUser = useAuthStore.getState().user;
                    if (!currentUser) return [];
                    return get().allAccounts.filter(account => account.userId === currentUser.id);
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

                updateAccountBalance: (accountId, amount, transactionType) => {
                    const cleanAmount = Math.abs(amount);

                    set((state) => ({
                        allAccounts: state.allAccounts.map(acc => {
                            if (acc.id !== accountId) return acc;

                            const newBalance = transactionType === 'income'
                                ? acc.balance + cleanAmount
                                : acc.balance - cleanAmount;

                            return { ...acc, balance: newBalance };
                        })
                    }), false, 'updateAccountBalance');
                },
                transferAllAccountTransactions: (fromAccountId: string, toAccountId: string) => {
                    set((state) => {
                        const transactionsToMove = state.transactions.filter(t => t.account_id === fromAccountId);


                        const totalImpact = transactionsToMove.reduce((acc, t) => {

                            return t.type === 'income'
                                ? acc + t.amount
                                : acc - Math.abs(t.amount);
                        }, 0);

                        // Actualizamos las transacciones y las cuentas
                        return {
                            transactions: state.transactions.map(t =>
                                t.account_id === fromAccountId
                                    ? { ...t, account_id: toAccountId } // Movemos la transacción
                                    : t
                            ),
                            allAccounts: state.allAccounts.map(acc => {
                                // Cuenta Origen: Se queda en 0
                                if (acc.id === fromAccountId) {
                                    return { ...acc, balance: 0 };
                                }
                                // Cuenta Destino: Sumamos el impacto calculado
                                if (acc.id === toAccountId) {
                                    return { ...acc, balance: acc.balance + totalImpact };
                                }
                                return acc;
                            }),
                            error: null,
                        };
                    });


                },
                getAccountById: (accountId: string) => get().allAccounts.find(acc => acc.id === accountId),

                deleteSomeAmountInAccount: (accountId: string, amount: number, transactionType: TransactionType) => {
                    const cleanAmount = Math.abs(amount);
                    const amountToDelete = transactionType === TransactionType.INCOME ? cleanAmount : -cleanAmount;
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
                    const balances: Record<string, number> = {};
                    accounts.forEach(acc => {
                        balances[acc.id] = 0;
                    });

                    // 2. Recorrer las transacciones una sola vez
                    transactions.forEach(t => {
                        // Solo sumamos si la cuenta existe en nuestro mapa
                        if (balances.hasOwnProperty(t.account_id)) {
                            if (t.type === TransactionType.INCOME) {
                                balances[t.account_id] += t.amount;
                            } else {
                                balances[t.account_id] -= Math.abs(t.amount);
                            }
                        }
                    });

                    // 3. Mapear las cuentas con sus nuevos saldos calculados
                    const updatedAccounts = accounts.map(account => ({
                        ...account,
                        balance: balances[account.id] || 0
                    }));

                    set({ allAccounts: updatedAccounts }, false, 'syncAccountsWithTransactions');
                },


                // === TRANSACTION MANAGEMENT ===

                setTransactions: (transactions: Transaction[]) => {
                    set({ transactions, error: null }, false, 'setTransactions')
                },

                addTransactionStore: (transaction: Transaction) => {
                    const currentUserId = useAuthStore.getState().user?.id;

                    if (!currentUserId) return;
                    const transactionWithId = { ...transaction, user_id: currentUserId };    
                    set(
                        (state) => ({
                            transactions: [...state.transactions, transactionWithId],
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

                getUserTransactions: () => {
                    const allTransactions = get().transactions;
                    const currentUser = useAuthStore.getState().user; 

                    if (!currentUser) return [];

                    return allTransactions.filter(t => t.user_id === currentUser.id);
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
                version: 2,

                migrate: (persistedState: any, version: number) => {
                    console.log(`Intentando migrar desde versión ${version} a 2...`);

                    // Ejecutar si la versión guardada es menor a la actual (2)
                    if (version < 2) {
                        try {
                            // Intento sucio de obtener el otro store. 
                            // ADVERTENCIA: Esto puede devolver [] si el otro store no ha cargado.
                            let userCategories: Category[] = [];
                            try {
                                const catStore = require('../stores/useCategoriesStore').useCategoriesStore.getState();
                                userCategories = catStore.userCategories || [];
                            } catch (e) {
                                console.warn("No se pudo cargar CategoriesStore durante la migración", e);
                            }

                            const newTransactions = migrateTransactions(persistedState, userCategories);

                            return {
                                ...persistedState,
                                transactions: newTransactions,
                                // Asegúrate de migrar otros campos si cambiaron
                            };
                        } catch (error) {
                            console.error("Error fatal en migración:", error);
                            return persistedState; // En caso de error, devolver estado sin tocar para no perder datos
                        }
                    }

                    return persistedState;
                },


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