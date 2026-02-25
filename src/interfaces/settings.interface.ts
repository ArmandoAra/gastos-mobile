import { LanguageCode } from "../constants/languages";


export enum InputNameActive {
    INCOME = 'income',
    SPEND = 'spend',
    EDIT = 'edit',
    NONE = 'none',
}

export type themeOptions = 'light' | 'dark';
export type iconsThemeOptions = 'material' | 'painted';

export interface SettingsState {
    theme: themeOptions;
    iconsOptions: iconsThemeOptions;
    language: LanguageCode;
    isPinEnabled: boolean;
    isBiometricEnabled: boolean;
    isUnlocked: boolean;
    isAddOptionsOpen: boolean;
    isDateSelectorOpen: boolean;
    inputNameActive: InputNameActive;
    setIsAddOptionsOpen: (isOpen: boolean) => void;
    setIsDateSelectorOpen: (isOpen: boolean) => void;
    setInputNameActive: (inputName: InputNameActive) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    setIconsOptions: (option: 'material' | 'painted') => void;
    setLanguage: (lang: LanguageCode) => void;
    togglePin: () => void;
    toggleBiometrics: () => void;
    setUnlocked: (unlocked: boolean) => void;
}

