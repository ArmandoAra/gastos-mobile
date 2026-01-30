import { create } from 'zustand';
import { persist, createJSONStorage, devtools, StateStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import * as uuid from 'uuid';

// Importa tus interfaces y enums aquí
import { Category, TransactionType } from '../interfaces/data.interface';
import { useAuthStore } from './authStore';

// ============================================
// CONFIGURACIÓN MMKV
// ============================================

// Creamos una instancia separada para categorías (o podrías reusar la misma storage id si prefieres todo en un solo archivo)
export const categoriesStorage = createMMKV({
    id: 'categories-storage',
});

// Adaptador para Zustand
const zustandStorage: StateStorage = {
    setItem: (name, value) => {
        return categoriesStorage.set(name, value);
    },
    getItem: (name) => {
        const value = categoriesStorage.getString(name);
        return value ?? null;
    },
    removeItem: (name) => {
        return categoriesStorage.remove(name);
    },
};

// ============================================
// TIPOS
// ============================================

type PersistedState = {
    userCategories: Category[];
};

type TransientState = {
    fetching: boolean;
    _hasHydrated: boolean;
    error: string | null;
};

type State = PersistedState & TransientState;

type Actions = {
    // === CRUD Operations ===
    setCategories: (categories: Category[]) => void;
    
    // Create
    addCategory: (category: Category) => void;
    createCategory: (categoryData: Omit<Category, 'id'>) => Promise<void>;
    
    // Read / Getters
    getCategoryById: (id: string) => Category | undefined;
    getUserCategories: () => Category[];
    getCategoriesByType: (type: TransactionType) => Category[];
    getCategoriesByUserIdAndType: (userId: string, type: TransactionType) => Category[];
    
    // Update
    updateCategory: (id: string, data: Partial<Category>) => void;
    
    // Delete
    deleteCategory: (id: string) => void;
    deleteAllCategories: () => void;

    // === Loading & Error ===
    setFetching: (state: boolean) => void;
    setError: (error: string | null) => void;

    // === Hydration ===
    setHasHydrated: (state: boolean) => void;

    // === Utility ===
    reset: () => void;
    // Función opcional para cargar categorías por defecto si está vacío
    initializeDefaultCategories: (userId: string) => void; 
};

// ============================================
// VALORES INICIALES
// ============================================

const initialState: State = {
    userCategories: [],
    fetching: false,
    _hasHydrated: false,
    error: null,
};

// ============================================
// STORE
// ============================================

const useCategoriesStore = create<State & Actions>()(
    devtools(
        persist(
            (set, get) => ({
                ...initialState,
                // === CRUD OPERATIONS ===

                setCategories: (userCategories: Category[]) => {
                    set({ userCategories, error: null }, false, 'setCategories');
                },

                // Agrega una categoría ya construida
                addCategory: (category: Category) => {
                    set(
                        (state) => ({
                            userCategories: [...state.userCategories, category],
                            error: null,
                        }),
                        false,
                        'addCategory'
                    );
                },

                // Crea una categoría generando el ID automáticamente
                createCategory: async (categoryData: Omit<Category, 'id'>) => {
                    set({ fetching: true });
                    try {
                        const newCategory: Category = {
                            id: uuid.v4(), // Generación de ID único
                            ...categoryData
                        };

                        set((state) => ({
                            userCategories: [...state.userCategories, newCategory],
                            error: null,
                            fetching: false
                        }), false, 'createCategory');
                        
                    } catch (e) {
                        set({ error: 'Error creating category', fetching: false });
                    }
                },

                updateCategory: (id: string, data: Partial<Category>) => {
                    set(
                        (state) => ({
                            userCategories: state.userCategories.map((cat) =>
                                cat.id === id ? { ...cat, ...data } : cat
                            ),
                            error: null,
                        }),
                        false,
                        'updateCategory'
                    );
                },

                deleteCategory: (id: string) => {
                    set(
                        (state) => ({
                            userCategories: state.userCategories.filter((cat) => cat.id !== id),
                            error: null,
                        }),
                        false,
                        'deleteCategory'
                    );
                },

                deleteAllCategories: () => {
                    set({ userCategories: [] }, false, 'deleteAllCategories');
                },

                // === GETTERS ===

                getCategoryById: (id: string) => {
                    return get().userCategories.find((cat) => cat.id === id);
                },

                getUserCategories: () => {
                    const userId = useAuthStore.getState().user?.id;
                    if (!userId) return [];
                    return get().userCategories.filter((cat) => cat.userId === userId);
                },

                getCategoriesByType: (type: TransactionType) => {
                    return get().userCategories.filter((cat) => cat.type === type);
                },

                getCategoriesByUserIdAndType: (userId: string, type: TransactionType) => {
                    return get().userCategories.filter(
                        (cat) => cat.userId === userId && cat.type === type
                    );
                },

                // === UTILS ===

                // Utilidad opcional para inicializar categorías por defecto si el usuario es nuevo
                initializeDefaultCategories: (userId: string) => {
                    const currentCategories = get().userCategories;
                    const hasUserCategories = currentCategories.some(c => c.userId === userId);

                    if (!hasUserCategories) {
                        // Aquí podrías definir un array de categorías predeterminadas
                        // y agregarlas. Por ahora solo imprimimos.
                        console.log('No categories found for user, initializing defaults...');
                        // Lógica para añadir defaults...
                    }
                },

                // === STATE MANAGEMENT ===

                setFetching: (state: boolean) => set({ fetching: state }, false, 'setFetching'),
                setError: (error: string | null) => set({ error }, false, 'setError'),
                setHasHydrated: (state: boolean) => set({ _hasHydrated: state }, false, 'setHasHydrated'),
                reset: () => set(initialState, false, 'reset'),
            }),
            {
                name: 'categories-storage',
                // Usamos el adaptador MMKV
                storage: createJSONStorage(() => zustandStorage),
                version: 1,
                // Solo persistimos el array de categorías
                partialize: (state) => ({
                    userCategories: state.userCategories,
                }),
                onRehydrateStorage: () => (state) => {
                    state?.setHasHydrated(true);
                },
            }
        ),
        { name: 'CategoriesStore' }
    )
);

export default useCategoriesStore;