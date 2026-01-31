import { Category } from "../interfaces/data.interface";

export const migrateCategories = (persistedState: any): Category[] => {
    // 1. CORRECCIÓN: Validamos userCategories, NO transactions
    if (!persistedState || !persistedState.userCategories) {
        console.warn("No se encontraron categorías previas para migrar.");
        return []; 
    }

    const oldCategories = persistedState.userCategories;
    console.log(`Migrando ${oldCategories.length} categorías...`);

    return oldCategories.map((oldCat: any) => ({
        // Usamos spread operator (...) para mantener todo lo que ya existía
        ...oldCat,
        // Agregamos la propiedad nueva. 
        // Usamos '??' (Nullish coalescing) que es más seguro que verificar undefined
        isActive: oldCat.isActive ?? true, 
    }));
}