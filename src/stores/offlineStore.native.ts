import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import type { PendingSync } from '../types/schemas';

const storage = new MMKV();

const mmkvStorage = {
    setItem: (name: string, value: string) => storage.set(name, value),
    getItem: (name: string) => storage.getString(name) ?? null,
    removeItem: (name: string) => storage.delete(name),
};

interface OfflineState {
    pendingSync: PendingSync[];
    isOnline: boolean;
    addPendingSync: (item: PendingSync) => void;
    removePendingSync: (id: string) => void;
    clearPendingSync: () => void;
    setOnline: (online: boolean) => void;
}

export const useOfflineStore = create<OfflineState>()(
    persist(
        (set) => ({
            pendingSync: [],
            isOnline: true,
            addPendingSync: (item) =>
                set((state) => ({ pendingSync: [...state.pendingSync, item] })),
            removePendingSync: (id) =>
                set((state) => ({
                    pendingSync: state.pendingSync.filter((item) => item.id !== id),
                })),
            clearPendingSync: () => set({ pendingSync: [] }),
            setOnline: (online) => set({ isOnline: online }),
        }),
        {
            name: 'offline-storage',
            storage: createJSONStorage(() => mmkvStorage),
        }
    )
);