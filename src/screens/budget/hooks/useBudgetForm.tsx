import { useState, useEffect, useMemo } from "react";
import { Alert, PixelRatio } from "react-native";
import { useAuthStore } from "../../../stores/authStore";
import useDataStore from "../../../stores/useDataStore";
import { useTransactionForm } from "../../transactions/constants/hooks/useTransactionForm";
import { defaultCategories } from "../../../constants/categories";
import { ExpenseBudget, Item, Category } from "../../../interfaces/data.interface";
import { CategoryLabel } from "../../../api/interfaces";
import useBudgetsStore from "../../../stores/useBudgetStore";

interface UseBudgetFormProps {
    visible: boolean;
    onClose: () => void;
    initialData: ExpenseBudget | null;
}

export const useBudgetForm = ({ visible, onClose, initialData}: UseBudgetFormProps) => {
    // Stores y Hooks externos
    const { allAccounts } = useDataStore();
    const { user } = useAuthStore();
    const { 
        userCategoriesOptions, 
        handleSelectCategory, 
        selectedCategory, 
        defaultCategoriesOptions, 
        setSelectedCategory // Si necesitas setearla manualmente
    } = useTransactionForm();

    // Estados Locales
    const [name, setName] = useState('');
    const [budgetedAmount, setBudgetedAmount] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [categorySelectorOpen, setCategorySelectorOpen] = useState(false);

    const addBudget = useBudgetsStore(state => state.addBudget);
    const replaceBudget = useBudgetsStore(state => state.replaceBudget);

    // Lógica de Inicialización
    useEffect(() => {
        if (visible) {
            if (initialData) {
                setName(initialData.name);
                setBudgetedAmount(initialData.budgetedAmount.toString());
                setItems(initialData.items || []);
                
                // Lógica para recuperar la categoría (manteniendo tu lógica original)
                const categoryName = initialData.slug_category_name[0] as CategoryLabel;
                const customCategory = userCategoriesOptions.find(
                    cat => cat.name === categoryName && cat.userId === user?.id
                );
                const defaultCategory = defaultCategories.find(
                    cat => cat.name === categoryName && cat.userId === 'default'
                );
                // Aquí deberías usar setSelectedCategory si tu useTransactionForm lo expone
                const found = customCategory || defaultCategory;
                if(found) setSelectedCategory(found); 
            } else {
                setName('');
                setBudgetedAmount('');
                setItems([]);
            }
        }
    }, [visible, initialData?.id]);

    // Cálculos derivados
    const totalSpent = useMemo(() => {
        return items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    }, [items]);

    // Manejadores de Items
    const handleAddItem = () => {
        const newItem: Item = {
            id: Date.now().toString(),
            name: '',
            price: 0,
            quantity: 1,
            expenseBudgetId: initialData?.id || 'temp',
        };
        setItems([newItem, ...items]);
    };

    const updateItem = (id: string, field: keyof Item, value: any) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    // Guardado
    const handleSaveForm = () => {
        if (!name.trim()) {
            Alert.alert("Error", "Por favor ingresa un nombre para el presupuesto");
            return;
        }

        // Caso A: EDITAR (Usamos replaceBudget)
        if (initialData) {
            const updatedBudget: ExpenseBudget = {
                ...initialData, // Mantiene ID, fechas originales, etc.
                name,
                budgetedAmount: parseFloat(budgetedAmount) || 0,
                items: items , 
                updated_at: new Date().toISOString(),
                // Asegúrate de actualizar la categoría si cambió
                slug_category_name: selectedCategory ? [selectedCategory.name] : initialData.slug_category_name,
                category_icon_name: selectedCategory ? selectedCategory.icon : initialData.category_icon_name
            };

            // AQUÍ AGREGAS EL REPLACE
            replaceBudget(updatedBudget);

        } else {
            // Caso B: CREAR NUEVO (Usamos addBudget)
            // El store generará el ID y las fechas
            addBudget({
                account_id: allAccounts[0]?.id || 'default-account',
                user_id: user?.id || 'current-user-id',
                name,
                budgetedAmount: parseFloat(budgetedAmount) || 0,
                items: items,
                slug_category_name: selectedCategory ? [selectedCategory.name] : [],
                category_icon_name: selectedCategory ? selectedCategory.icon : 'shopping-cart',
                date: new Date().toISOString(),
            });
        }

        // onSave(newBudget); <--- ELIMINAMOS ESTO
        onClose();
    };

    // Utilidades de UI que dependen de lógica (opcional, pero útil)
    const fontScale = PixelRatio.getFontScale();
    const dynamicIconSize = 24 * fontScale;

    return {
        // Estado del formulario
        name, setName,
        budgetedAmount, setBudgetedAmount,
        items,
        totalSpent,
        
        // Estado de UI local
        categorySelectorOpen, setCategorySelectorOpen,
        dynamicIconSize,
        fontScale,

        // Datos de Categorías (pasamanos de useTransactionForm)
        userCategoriesOptions,
        defaultCategoriesOptions,
        selectedCategory,
        handleSelectCategory,

        // Acciones
        handleAddItem,
        updateItem,
        removeItem,
        handleSaveForm,
    };
};