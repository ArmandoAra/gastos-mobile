// En el archivo donde tengas esta función (ej: migrateTransactions.ts)
import { Category, Transaction } from '../interfaces/data.interface';
import { defaultCategories } from "../constants/categories";

// Helper para aplanar el objeto de categorías por defecto
const flatDefaultCategories = Object.values(defaultCategories).flat();

export const migrateTransactions = (persistedState: any, userCategories: Category[]): Transaction[] => {
    // Verificamos que existan transacciones antiguas
    if (!persistedState || !persistedState.transactions) return [];

    const oldTransactions = persistedState.transactions;
    console.log(`Migrando ${oldTransactions.length} transacciones...`);
    
    return oldTransactions.map((oldTx: any) => {
        // Obtenemos el nombre antiguo (asumiendo que slug_category_name es un array)
        const legacyName = Array.isArray(oldTx.slug_category_name) 
            ? oldTx.slug_category_name[0] 
            : oldTx.slug_category_name;

        // Buscamos el ID
        const newCategoryId = findCategoryId(legacyName, userCategories, flatDefaultCategories);

        return {
            ...oldTx, // Mantén el resto de propiedades
            // Si no encuentra categoría, asigna una 'unknown' o similar para no romper la app
            categoryId: newCategoryId || 'category_not_found', 
        };
    });
}

function findCategoryId(categoryName: string, userCategories: Category[], flatDefaults: Category[]): string | undefined {
    if (!categoryName) return undefined;

    // 1. Buscar en categorías personalizadas del usuario
    // Nota: Asegúrate si buscas por 'name' o por 'icon'. A veces el slug antiguo coincide con el 'icon' de la nueva.
    const userCategory = userCategories.find(cat => cat.name === categoryName || cat.icon === categoryName);
    if (userCategory) return userCategory.id;

    // 2. Buscar en categorías por defecto (ya aplanadas)
    // En defaultCategories, usualmente el identificador único es el campo 'icon' (ej: 'food', 'salary')
    const defaultCategory = flatDefaults.find(cat => cat.name === categoryName || cat.icon === categoryName);
    if (defaultCategory) return defaultCategory.id;

    return undefined;
}