// useAddTransactions.ts
import { useState, useCallback, useEffect } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { useSettingsStore } from '../stores/settingsStore';
import useDataStore from '../stores/useDataStore';
import useBudgetsStore from '../stores/useBudgetStore';
import { InputNameActive } from '../interfaces/settings.interface';


const ANIMATION_DURATION = 250;

export const useAddTransactions = () => {
    // 1. Selectores granulares de Zustand (EVITA RE-RENDERS INNECESARIOS)
    const theme = useSettingsStore(state => state.theme);
    const setIsAddOptionsOpen = useSettingsStore(state => state.setIsAddOptionsOpen);
    const setInputNameActive = useSettingsStore(state => state.setInputNameActive);
    const isDateSelectorOpen = useSettingsStore(state => state.isDateSelectorOpen);
    
    const allAccounts = useDataStore(state => state.allAccounts);
    const selectedAccount = useDataStore(state => state.selectedAccount);
    const setSelectedAccount = useDataStore(state => state.setSelectedAccount);
    
    const setDataToTransact = useBudgetsStore(state => state.setToTransactBudget);

    // 2. Estado local y animación
    const [isOpen, setIsOpen] = useState(false);
    const animationProgress = useSharedValue(0);

    // Idealmente, mueve este useEffect fuera de este componente, pero si debe ir aquí:
    useEffect(() => {
        if (!allAccounts || allAccounts.length === 0) {
            if (selectedAccount) setSelectedAccount('');
            return;
        }
        const currentAccountExists = allAccounts.some(acc => acc.id === selectedAccount);
        if (!currentAccountExists || !selectedAccount) {
            setSelectedAccount(allAccounts[0].id);
        }
    }, [allAccounts, selectedAccount, setSelectedAccount]);

    // 3. Handlers con animación directa
    const toggleMenu = useCallback((forceClose = false) => {
        const newState = forceClose ? false : !isOpen;
        
        if (!isOpen && !forceClose) {
            setDataToTransact(null);
        }
        
        setIsOpen(newState);
        // Disparamos la animación inmediatamente sin esperar al useEffect
        animationProgress.value = withTiming(newState ? 1 : 0, { 
            duration: ANIMATION_DURATION 
        });
    }, [isOpen, setDataToTransact, animationProgress]);

    const handleBackdropPress = useCallback(() => {
        toggleMenu(true);
    }, [toggleMenu]);

    const handleSelectIncome = useCallback(() => {
        toggleMenu(true);
        setInputNameActive(InputNameActive.INCOME);
        setIsAddOptionsOpen(true);
    }, [setInputNameActive, setIsAddOptionsOpen, toggleMenu]);

    const handleSelectExpense = useCallback(() => {
        toggleMenu(true);
        setInputNameActive(InputNameActive.SPEND);
        setIsAddOptionsOpen(true);
    }, [setInputNameActive, setIsAddOptionsOpen, toggleMenu]);

    return {
        theme,
        isDateSelectorOpen,
        isOpen,
        animationProgress,
        handlers: {
            handleToggleOptions: () => toggleMenu(),
            handleBackdropPress,
            handleSelectIncome,
            handleSelectExpense
        }
    };
};