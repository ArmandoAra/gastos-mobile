import { Category } from "../interfaces/data.interface";
import { InputNameActive } from "../interfaces/settings.interface";



export function filterCategoriesByType(categories: Category[], type: InputNameActive, userId?: string): Category[] {
    if (userId) {
        return categories.filter(cat => cat.userId === userId && cat.type === (type === InputNameActive.INCOME ? 'income' : 'expense'));
    }

    return categories.filter(cat => cat.type === (type === InputNameActive.INCOME ? 'income' : 'expense' ));
}