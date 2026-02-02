// En el archivo donde tengas esta función (ej: migrateTransactions.ts)
import { Category, Transaction } from '../interfaces/data.interface';
import { defaultCategories } from "../constants/categories";
import { CategoryLabel } from '../interfaces/categories.interface';

// Helper para aplanar el objeto de categorías por defecto
const flatDefaultCategories = Object.values(defaultCategories).flat();

export const migrateTransactions = (persistedState: any, userCategories: Category[]): Transaction[] => {
    // Verificamos que existan transacciones antiguas
    if (!persistedState || !persistedState.transactions) return [];

    const oldTransactions = persistedState.transactions;
    
    return oldTransactions.map((oldTx: any) => {

        // Buscamos el ID
        const newCategoryId = findCategoryId(oldTx.category_icon_name, userCategories, flatDefaultCategories);

        return {
            ...oldTx,
            categoryId: newCategoryId || 'category_not_found', 
        };
    });
}

function findCategoryId(oldTransactionIconName: CategoryLabel, userCategories: Category[], flatDefaults: Category[]): string | undefined {
    if (!userCategories) return undefined;

    // Primero buscamos en las categorias del usuario
    const defaultCategory = userCategories.find(cat => cat.icon === oldTransactionIconName);
    if (defaultCategory) return defaultCategory.id;

    // Luego buscamos en las categorias por defecto
    const userCategory = flatDefaults.find(cat => cat.icon === oldTransactionIconName);
    if (userCategory) return userCategory.id;

    return undefined;
}