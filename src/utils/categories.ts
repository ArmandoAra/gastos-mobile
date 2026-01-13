import { Category } from "../interfaces/data.interface";
import { InputNameActive } from "../interfaces/settings.interface";



export function filterCategoriesByType(categories: Category[], type: InputNameActive): Category[] {
    return categories.filter(cat => cat.type === (type === InputNameActive.INCOME ? 'income' : 'expense' ));
}