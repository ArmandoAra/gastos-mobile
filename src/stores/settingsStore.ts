// ============================================
// SETTINGS STORE
// ============================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import { InputNameActive, SettingsState } from '../interfaces/settings.interface';
import { LanguageCode } from '../constants/languages';

const storage = createMMKV();


const mmkvStorage = {
    setItem: (name: string, value: string) => storage.set(name, value),
    getItem: (name: string) => storage.getString(name) ?? null,
    removeItem: (name: string) => storage.remove(name),
};


export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'light',
            iconsOptions: 'material',
            language: LanguageCode.PT,
            isPinEnabled: false,
            isBiometricEnabled: false,
            isUnlocked: true,
            isAddOptionsOpen: false,
            isDateSelectorOpen: false,
            inputNameActive: InputNameActive.NONE,
            setIsAddOptionsOpen: (isOpen) => set({ isAddOptionsOpen: isOpen }),
            setIsDateSelectorOpen: (isOpen) => set({ isDateSelectorOpen: isOpen }),
            setInputNameActive: (inputNameActive) => set({ inputNameActive }),
            setTheme: (theme) => set({ theme }),
            setIconsOptions: (option) => set({ iconsOptions: option }),
            setLanguage: (language) => set({ language }),
            toggleBiometrics: () => set((state) => ({
                isBiometricEnabled: !state.isBiometricEnabled
            })),
            togglePin: () => set((state) => ({
                isPinEnabled: !state.isPinEnabled,
                isUnlocked: !state.isPinEnabled ? false : state.isUnlocked
            })),
            setUnlocked: (isUnlocked) => set({ isUnlocked }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => mmkvStorage),
        }
    )
);