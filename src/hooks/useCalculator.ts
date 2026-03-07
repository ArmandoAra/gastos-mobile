import { useState, useEffect } from "react";
import { useKeyboardStatus } from "../screens/transactions/constants/hooks/useKeyboardStatus";
import { Keyboard, AccessibilityInfo, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { is } from "date-fns/locale";



export function useCalculator() {
    const {t} = useTranslation();
    const isKeyboardVisible = useKeyboardStatus();
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [calculatorValue, setCalculatorValue] = useState("");
    const openCalculator = () => setIsCalculatorOpen(true);
    const closeCalculator = () => setIsCalculatorOpen(false);
    const handleValueChange = (value: string) => {
        setCalculatorValue(value);
    }

    useEffect(() => {
            if (isKeyboardVisible) setIsCalculatorOpen(false);
        }, [isKeyboardVisible]);


        const handleOpenCalculator = () => {
                Keyboard.dismiss();
                setTimeout(() => {
                    setIsCalculatorOpen(true);
                    if (Platform.OS !== 'web') {
                        AccessibilityInfo.announceForAccessibility(t('accessibility.calculator_opened'));
                    }
                }, 100);
            };

        
    return {
        isCalculatorOpen,
        calculatorValue,
        isKeyboardVisible,
        setIsCalculatorOpen,
        handleOpenCalculator,
        handleValueChange
    }
}