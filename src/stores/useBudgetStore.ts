import { create } from 'zustand';
import { persist, createJSONStorage, devtools, StateStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import * as uuid from 'uuid';

// ============================================
// INTERFACES
// ============================================

export interface Item {
    id: string;
    name: string;
    price: number;
    quantity: number;
    expenseBudgetId: string;
}

export interface ExpenseBudget {
    id: string;
    account_id: string;
    user_id: string;
    name: string;
    slug_category_name: string[];
    category_icon_name: string;
    spentAmount: number;    // Calculado: sum(item.price * item.quantity)
    budgetedAmount: number; // Target
    date: string;
    created_at: string;
    updated_at: string;
    items: Item[];
}

// ============================================
// CONFIGURACIÓN MMKV
// ============================================

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

type TransientState = {
    isLoading: boolean;
    error: string | null;
    _hasHydrated: boolean;
};

type State = PersistedState & TransientState;

type Actions = {
    // === Budget CRUD ===
    addBudget: (budget: Omit<ExpenseBudget, 'id' | 'created_at' | 'updated_at' | 'spentAmount'>) => void;
    
    // Acción para reemplazar completamente un budget (usada al editar desde el modal)
    replaceBudget: (budget: ExpenseBudget) => void; 

    updateBudget: (id: string, data: Partial<Omit<ExpenseBudget, 'id' | 'items'>>) => void;
    deleteBudget: (id: string) => void;
    
    // === Item Management (Nested Logic) ===
    addItemToBudget: (budgetId: string, item: Omit<Item, 'id' | 'expenseBudgetId'>) => void;
    updateItemInBudget: (budgetId: string, itemId: string, itemData: Partial<Item>) => void;
    removeItemFromBudget: (budgetId: string, itemId: string) => void;

    // === Getters ===
    getBudgetById: (id: string) => ExpenseBudget | undefined;
    getBudgetsByUserId: (userId: string) => ExpenseBudget[];

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

                addBudget: (budgetData) => {
                    const now = new Date().toISOString();
                    const items = (budgetData as any).items || []; 
                    
                    const newBudget: ExpenseBudget = {
                        id: uuid.v4(),
                        created_at: now,
                        updated_at: now,
                        ...budgetData,
                        items,
                        spentAmount: calculateSpentAmount(items), 
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

                // ----------------------------------------------------------------
                // GETTERS
                // ----------------------------------------------------------------

                getBudgetById: (id) => get().budgets.find(b => b.id === id),
                getBudgetsByUserId: (userId) => get().budgets.filter(b => b.user_id === userId),

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