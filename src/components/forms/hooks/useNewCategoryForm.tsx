import { useState, useEffect, useMemo, useCallback } from "react";
import { Keyboard } from "react-native";
import { COLOR_PICKER_PALETTE, defaultCategories } from "../../../constants/categories";
import { Category, TransactionType } from "../../../interfaces/data.interface";
import * as uuid from 'uuid';

export const useFormLogic = (
    categoryToEdit: Category | null | undefined,
    type: TransactionType,
    user: any,
    addCategory: (category: Category) => void,
    updateCategory: (id: string, category: Category) => void,
    closeInput: () => void,
    setSelectingMyCategories: (value: boolean) => void,
) => {
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLOR_PICKER_PALETTE[0]);
    const [selectedIconItem, setSelectedIconItem] = useState<Category | null>(null);
    const [isNameTouched, setIsNameTouched] = useState(false);

    const isEditMode = !!categoryToEdit;

    // Cargar datos en modo edición
    useEffect(() => {
        if (categoryToEdit) {
            setName(categoryToEdit.name);
            setSelectedColor(categoryToEdit.color || COLOR_PICKER_PALETTE[0]);
            setIsNameTouched(true);

            const allDefaultIcons = Object.values(defaultCategories).flat();
            const foundIconItem = allDefaultIcons.find(
                cat => cat.icon === categoryToEdit.icon
            );

            setSelectedIconItem(
                foundIconItem || { ...categoryToEdit, id: 'temp' }
            );
        }
    }, [categoryToEdit]);

    // Validaciones memoizadas
    const isNameValid = useMemo(() => name.trim().length > 0, [name]);
    const isIconValid = useMemo(() => selectedIconItem !== null, [selectedIconItem]);
    const isFormValid = useMemo(
        () => isNameValid && isIconValid,
        [isNameValid, isIconValid]
    );

    // Handler de submit optimizado
    const handleSubmit = useCallback(({handleSelectCategory}: { handleSelectCategory: (category: Category) => void }) => {
        if (!isFormValid || !user) return;

        if (isEditMode && categoryToEdit) {
            const updatedCat: Category = {
                ...categoryToEdit, 
                name: name.trim(),
                icon: selectedIconItem?.icon || categoryToEdit.icon,
                color: selectedColor,
            };
            updateCategory(categoryToEdit.id, updatedCat);
            handleSelectCategory(updatedCat);
        } else {
            const newCategory: Category = {
                id: uuid.v4(),
                name: name.trim(),
                icon: selectedIconItem?.icon || defaultCategories[0].icon,
                color: selectedColor,
                type: type,
                isActive: true,
                userId: user.id,
            };
            addCategory(newCategory);
            handleSelectCategory(newCategory);
        }
        
        // Reset
        setName('');
        setSelectedIconItem(null);
        setSelectedColor(COLOR_PICKER_PALETTE[0]);
        setIsNameTouched(false);
        Keyboard.dismiss();

        closeInput();
        // setSelectingMyCategories(true);
    }, [
        isFormValid,
        user,
        isEditMode,
        categoryToEdit,
        name,
        selectedIconItem,
        selectedColor,
        type,
        addCategory,
        updateCategory,
        closeInput,
        setSelectingMyCategories,
    ]);

    return {
        name,
        setName,
        selectedColor,
        setSelectedColor,
        selectedIconItem,
        setSelectedIconItem,
        isNameTouched,
        setIsNameTouched,
        isEditMode,
        isNameValid,
        isIconValid,
        isFormValid,
        handleSubmit,
    };
};