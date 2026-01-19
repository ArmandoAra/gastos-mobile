import { create } from 'zustand';
import { persist, createJSONStorage, devtools, StateStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import * as uuid from 'uuid';
import { ExpenseBudget, Item } from '../interfaces/data.interface';
import { getUser } from '../../../Gastos/frontend/app/lib/dal';
import { useAuthStore } from './authStore';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { set } from 'date-fns';

export const budgetsStorage = createMMKV({
    id: 'budgets-storage',
});

const zustandStorage: StateStorage = {
    setItem: (name, value) => budgetsStorage.set(name, value),
    getItem: (name) => {
        const value = budgetsStorage.getString(name);
        return value ?? null;
    },
    removeItem: (name) => budgetsStorage.remove(name),
};

// ============================================
// TIPOS DEL STORE
// ============================================

type PersistedState = {
    budgets: ExpenseBudget[];
};

export interface ToConvertBudget {
    name: string;
    totalAmount: number;
    slug_category_name: string[];
}

type TransientState = {
    toTransactBudget: ToConvertBudget | null;
    isLoading: boolean;
    error: string | null;
    _hasHydrated: boolean;
};

type State = PersistedState & TransientState;

type Actions = {
    // === Budget CRUD ===
    setBudgets: (budgets: ExpenseBudget[]) => void;
    addBudget: (budget: Omit<ExpenseBudget, 'id' | 'created_at' | 'updated_at' | 'spentAmount'>) => void;
    
    // Acción para reemplazar completamente un budget (usada al editar desde el modal)
    replaceBudget: (budget: ExpenseBudget) => void; 

    updateBudget: (id: string, data: Partial<Omit<ExpenseBudget, 'id' | 'items'>>) => void;
    deleteBudget: (id: string) => void;
    
    // === Item Management (Nested Logic) ===
    setItems: (items: Item[]) => void;
    addItemToBudget: (budgetId: string, item: Omit<Item, 'id' | 'expenseBudgetId'>) => void;
    updateItemInBudget: (budgetId: string, itemId: string, itemData: Partial<Item>) => void;
    removeItemFromBudget: (budgetId: string, itemId: string) => void;
    getUserItems: () => Item[];

    setToTransactBudget: (budget: ToConvertBudget | null) => void;

    // === Getters ===
    getBudgetById: (id: string) => ExpenseBudget | undefined;
    getUserBudgets: () => ExpenseBudget[];

    deleteAllItems: () => void;
    deleteAllBudgets: () => void;

    // === System ===
    setHasHydrated: (state: boolean) => void;
    reset: () => void;
};

// ============================================
// HELPER: CALCULAR TOTAL
// ============================================
const calculateSpentAmount = (items: Item[]): number => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

const initialState: State = {
    toTransactBudget: null,
    budgets: [],
    isLoading: false,
    error: null,
    _hasHydrated: false,
};

const useBudgetsStore = create<State & Actions>()(
    devtools(
        persist(
            (set, get) => ({
                ...initialState,

                // ----------------------------------------------------------------
                // BUDGET ACTIONS
                // ----------------------------------------------------------------

                setBudgets: (budgets: ExpenseBudget[]) => {
                    set({ budgets, error: null }, false, 'setBudgets');
                },

                addBudget: (budgetData) => {
                    const now = new Date().toISOString();
                    const items = (budgetData as any).items || []; 
                    const user = useAuthStore.getState().user;
                    if (!user) return;
                    
                    const newBudget: ExpenseBudget = {
                        id: uuid.v4(),
                        created_at: now,
                        updated_at: now,
                        ...budgetData,
                        items,
                        spentAmount: calculateSpentAmount(items), 
                        user_id: user.id
                    };

                    set((state) => ({
                        budgets: [newBudget, ...state.budgets],
                        error: null
                    }), false, 'addBudget');
                },

                // NUEVA ACCIÓN AGREGADA AQUÍ
                replaceBudget: (incomingBudget) => {
                    set((state) => {
                        const index = state.budgets.findIndex((b) => b.id === incomingBudget.id);
                        if (index === -1) return state;

                        const updatedBudgets = [...state.budgets];
                        
                        // Recalculamos el total basado en los items que vienen para asegurar consistencia
                        const calculatedSpent = calculateSpentAmount(incomingBudget.items);

                        updatedBudgets[index] = {
                            ...incomingBudget,
                            spentAmount: calculatedSpent,
                            updated_at: new Date().toISOString()
                        };

                        return { budgets: updatedBudgets, error: null };
                    }, false, 'replaceBudget');
                },

                updateBudget: (id, data) => {
                    set((state) => ({
                        budgets: state.budgets.map((b) => 
                            b.id === id 
                                ? { ...b, ...data, updated_at: new Date().toISOString() } 
                                : b
                        ),
                        error: null
                    }), false, 'updateBudget');
                },

                deleteBudget: (id) => {
                    set((state) => ({
                        budgets: state.budgets.filter((b) => b.id !== id),
                        error: null
                    }), false, 'deleteBudget');
                },

                // ----------------------------------------------------------------
                // ITEM ACTIONS 
                // ----------------------------------------------------------------

                setItems: (items: Item[]) => {
                    set((state) => {
                        const updatedBudgets = state.budgets.map((budget) => {
                            const budgetItems = items.filter(item => item.expenseBudgetId === budget.id);
                            return {
                                ...budget,
                                items: budgetItems,
                                spentAmount: calculateSpentAmount(budgetItems)
                            };
                        });
                        return { budgets: updatedBudgets, error: null };
                    }, false, 'setItems');
                },

                addItemToBudget: (budgetId, itemData) => {
                    set((state) => {
                        const budgetIndex = state.budgets.findIndex(b => b.id === budgetId);
                        if (budgetIndex === -1) return state;

                        const newItem: Item = {
                            id: uuid.v4(),
                            expenseBudgetId: budgetId,
                            ...itemData
                        };

                        const updatedBudgets = [...state.budgets];
                        const currentBudget = updatedBudgets[budgetIndex];
                        const newItems = [...currentBudget.items, newItem];

                        updatedBudgets[budgetIndex] = {
                            ...currentBudget,
                            items: newItems,
                            spentAmount: calculateSpentAmount(newItems),
                            updated_at: new Date().toISOString()
                        };

                        return { budgets: updatedBudgets };
                    }, false, 'addItemToBudget');
                },

                updateItemInBudget: (budgetId, itemId, itemData) => {
                    set((state) => {
                        const budgetIndex = state.budgets.findIndex(b => b.id === budgetId);
                        if (budgetIndex === -1) return state;

                        const updatedBudgets = [...state.budgets];
                        const currentBudget = updatedBudgets[budgetIndex];
                        
                        const newItems = currentBudget.items.map(item => 
                            item.id === itemId ? { ...item, ...itemData } : item
                        );

                        updatedBudgets[budgetIndex] = {
                            ...currentBudget,
                            items: newItems,
                            spentAmount: calculateSpentAmount(newItems),
                            updated_at: new Date().toISOString()
                        };

                        return { budgets: updatedBudgets };
                    }, false, 'updateItemInBudget');
                },

                getUserItems: () => {
                    const currentUser = useAuthStore.getState().user;
                    if (!currentUser) return [];
                    const userBudgets = get().budgets.filter(b => b.user_id === currentUser.id);
                    return userBudgets.flatMap(budget => budget.items);
                },

                removeItemFromBudget: (budgetId, itemId) => {
                    set((state) => {
                        const budgetIndex = state.budgets.findIndex(b => b.id === budgetId);
                        if (budgetIndex === -1) return state;

                        const updatedBudgets = [...state.budgets];
                        const currentBudget = updatedBudgets[budgetIndex];
                        
                        const newItems = currentBudget.items.filter(item => item.id !== itemId);

                        updatedBudgets[budgetIndex] = {
                            ...currentBudget,
                            items: newItems,
                            spentAmount: calculateSpentAmount(newItems),
                            updated_at: new Date().toISOString()
                        };

                        return { budgets: updatedBudgets };
                    }, false, 'removeItemFromBudget');
                },

                setToTransactBudget: (budget) => {
                    set({ toTransactBudget: budget }, false, 'setToTransactBudget');
                },

                // ----------------------------------------------------------------
                // GETTERS
                // ----------------------------------------------------------------

                getBudgetById: (id) => get().budgets.find(b => b.id === id),
                getUserBudgets: () => {
                    const currentUser = useAuthStore.getState().user;
                    if (!currentUser) return [];
                    return get().budgets.filter(b => b.user_id === currentUser.id);
                },
                deleteAllItems: () => {
                    set((state) => ({
                        budgets: state.budgets.map(budget => ({
                            ...budget,
                            items: [],
                            spentAmount: 0,
                            updated_at: new Date().toISOString()
                        }))
                    }), false, 'deleteAllItems');
                },
                deleteAllBudgets: () => {
                    set({ budgets: [] }, false, 'deleteAllBudgets');
                },

                // ----------------------------------------------------------------
                // SYSTEM
                // ----------------------------------------------------------------
                
                setHasHydrated: (state) => set({ _hasHydrated: state }, false, 'setHasHydrated'),
                reset: () => set(initialState, false, 'reset'),
            }),
            {
                name: 'budgets-storage',
                storage: createJSONStorage(() => zustandStorage),
                partialize: (state) => ({ budgets: state.budgets }),
                onRehydrateStorage: () => (state) => {
                    state?.setHasHydrated(true);
                },
            }
        ),
        { name: 'BudgetsStore' }
    )
);

export default useBudgetsStore;