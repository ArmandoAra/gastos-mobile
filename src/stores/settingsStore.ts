// ============================================
// SETTINGS STORE
// ============================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();

const mmkvStorage = {
    setItem: (name: string, value: string) => storage.set(name, value),
    getItem: (name: string) => storage.getString(name) ?? null,
    removeItem: (name: string) => storage.remove(name),
};

interface SettingsState {
    theme: 'light' | 'dark';
    language: string;
    isPinEnabled: boolean;
    isUnlocked: boolean;
    setTheme: (theme: 'light' | 'dark') => void;
    setLanguage: (lang: string) => void;
    togglePin: () => void;
    setUnlocked: (unlocked: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'light',
            language: 'es',
            isPinEnabled: false,
            isUnlocked: true,
            setTheme: (theme) => set({ theme }),
            setLanguage: (language) => set({ language }),
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