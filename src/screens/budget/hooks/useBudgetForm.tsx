import { useState, useEffect, useMemo, useRef } from "react";
import { Alert, PixelRatio, TextInput } from "react-native";
import { useAuthStore } from "../../../stores/authStore";
import useDataStore from "../../../stores/useDataStore";
import { useTransactionForm } from "../../transactions/constants/hooks/useTransactionForm";
import { defaultCategories } from "../../../constants/categories";
import { ExpenseBudget, Item, Category } from "../../../interfaces/data.interface";
import { CategoryLabel } from "../../../api/interfaces";
import useBudgetsStore from "../../../stores/useBudgetStore";
import { is } from "date-fns/locale";
import { set } from "date-fns";

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
    const [isFavorite, setIsFavorite] = useState(false);
    const addBudget = useBudgetsStore(state => state.addBudget);
    const replaceBudget = useBudgetsStore(state => state.replaceBudget);

    // --- NUEVO: Referencias para Auto-Focus ---
    const itemsInputRefs = useRef<{ [key: string]: TextInput | null }>({});
    const [focusTargetId, setFocusTargetId] = useState<string | null>(null);

    // Lógica de Inicialización
    useEffect(() => {
        if (visible) {
            if (initialData) {
                setName(initialData.name);
                setBudgetedAmount(initialData.budgetedAmount.toString());
                setIsFavorite(initialData.favorite || false);
                // Aseguramos que al abrir, los items estén ordenados por 'done'
                const sortedItems = (initialData.items || []).sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));
                setItems(sortedItems);
            } else {
                setName('');
                setBudgetedAmount('');
                setItems([]);
            }
            itemsInputRefs.current = {}; // Limpiar refs
                
                // Lógica para recuperar la categoría (manteniendo tu lógica original)
            const categoryName = initialData?.slug_category_name[0] as CategoryLabel;
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
            setIsFavorite(false);
        }
        }
        , [visible, initialData?.id]);

    useEffect(() => {
        if (focusTargetId && itemsInputRefs.current[focusTargetId]) {
            // Pequeño timeout para asegurar que la animación de entrada terminó o el componente montó
            setTimeout(() => {
                itemsInputRefs.current[focusTargetId]?.focus();
                setFocusTargetId(null);
            }, 100);
        }
    }, [items, focusTargetId]);

    // Cálculos derivados
    const totalSpent = useMemo(() => {
        return items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    }, [items]);

    const toggleFavorite = () => {
        setIsFavorite(prev => !prev);
    };

    // Manejadores de Items
    const handleAddItem = () => {
        const newId = Date.now().toString();
        const newItem: Item = {
            id: newId,
            name: '',
            price: 0,
            quantity: 1,
            expenseBudgetId: initialData?.id || 'temp',
            done: false, // Inicializamos en false
        };

        setItems(prev => {
            const newList = [newItem, ...prev];
            return newList
        });

        // Configuramos el foco para el nuevo item
        setFocusTargetId(newId);
    };

    // --- NUEVO: Toggle Done y Reordenar ---
    const toggleItemDone = (id: string) => {
        setItems(prev => {
            const newItems = prev.map(item =>
                item.id === id ? { ...item, done: !item.done } : item
            );
            // Ordenar automáticamente: false (arriba) -> true (abajo)
            return newItems.sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));
        });
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

        const commonData = {
            name,
            budgetedAmount: parseFloat(budgetedAmount) || 0,
            items: items,
            updated_at: new Date().toISOString(),
            slug_category_name: selectedCategory ? [selectedCategory.name] : (initialData?.slug_category_name || []),
            category_icon_name: selectedCategory ? selectedCategory.icon : (initialData?.category_icon_name || 'shopping-cart'),
            favorite: initialData?.favorite || false,
            user_id: user?.id || 'current-user-id',
        };

        // Caso A: EDITAR (Usamos replaceBudget)
        if (initialData) {
            const updatedBudget: ExpenseBudget = {
                ...initialData, // Mantiene ID, fechas originales, etc.
                ...commonData,
                favorite: isFavorite,
                spentAmount: totalSpent,
            };

            // AQUÍ AGREGAS EL REPLACE
            replaceBudget(updatedBudget);

        } else {
            // Caso B: CREAR NUEVO (Usamos addBudget)
            // El store generará el ID y las fechas
            addBudget({
                account_id: allAccounts[0]?.id || 'default-account',
                date: new Date().toISOString(),
                ...commonData,
            });
        }
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
        itemsInputRefs,
        isFavorite,
        
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
        toggleItemDone,
        toggleFavorite,
    };
};