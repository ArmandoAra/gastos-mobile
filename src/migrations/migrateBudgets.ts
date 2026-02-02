import { Category, ExpenseBudget,  } from '../interfaces/data.interface';
import { defaultCategories } from "../constants/categories";

// Helper para aplanar el objeto de categorías por defecto
const flatDefaultCategories = Object.values(defaultCategories).flat();

export const migrateBudgets = (persistedState: any, userCategories: Category[]): ExpenseBudget[] => {
    
    // Verificamos que existan presupuestos antiguos
    if (!persistedState || !persistedState.budgets) return [];

    const oldBudgets = persistedState.budgets;
    
    return oldBudgets.map((oldBud: ExpenseBudget) => {
        // 1. Intentamos obtener el término de búsqueda principal (slug)
        const searchKey1 = oldBud.slug_category_name && oldBud.slug_category_name.length > 0 
            ? oldBud.slug_category_name[0] 
            : null;
        
        // 2. Intentamos obtener el término secundario (icono)
        const searchKey2 = oldBud.category_icon_name;

        // Buscamos el ID usando ambos términos
        const newCategoryId = findCategoryId(searchKey1, searchKey2, userCategories, flatDefaultCategories);
        

        return {
            ...oldBud,
            categoryId: newCategoryId || 'category_not_found', 
        };
    });
}

/**
 * Busca el ID de la categoría comparando nombre e icono.
 * @param key1 - Primer término de búsqueda (ej. slug name)
 * @param key2 - Segundo término de búsqueda (ej. icon name)
 */
function findCategoryId(
    key1: string | null, 
    key2: string | null, 
    userCategories: Category[], 
    flatDefaults: Category[]
): string | undefined {
    
    // Función auxiliar para chequear una lista
    const checkList = (list: Category[]) => {
        return list.find(cat => {
            // Comparamos Key1 (si existe) contra nombre o icono
            const match1 = key1 && (cat.name === key1 || cat.icon === key1);
            // Comparamos Key2 (si existe) contra nombre o icono
            const match2 = key2 && (cat.name === key2 || cat.icon === key2);
            
            return match1 || match2;
        });
    };

    // 1. Buscar en categorías personalizadas del usuario
    if (userCategories && userCategories.length > 0) {
        const foundUserCat = checkList(userCategories);
        if (foundUserCat) return foundUserCat.id;
    }

    // 2. Buscar en categorías por defecto
    const foundDefaultCat = checkList(flatDefaults);
    if (foundDefaultCat) return foundDefaultCat.id;

    return undefined;
}