import { isDate } from "date-fns";


export enum InputNameActive {
    INCOME = 'income',
    SPEND = 'spend',
    EDIT = 'edit',
    NONE = 'none',
}


export interface SettingsState {
    theme: 'light' | 'dark';
    language: string;
    isDateSelectorOpen: boolean;
    isAddOptionsOpen: boolean;
    inputNameActive: InputNameActive;
    isPinEnabled: boolean;
    isUnlocked: boolean;
    setIsAddOptionsOpen: (isOpen: boolean) => void;
    setIsDateSelectorOpen: (isOpen: boolean) => void;
    setInputNameActive: (inputName: InputNameActive) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    setLanguage: (lang: string) => void;
    togglePin: () => void;
    setUnlocked: (unlocked: boolean) => void;
}