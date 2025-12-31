import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PendingSync } from '../types/schemas';

const localStorageForWeb = {
    setItem: (name: string, value: string) => localStorage.setItem(name, value),
    getItem: (name: string) => localStorage.getItem(name) ?? null,
    removeItem: (name: string) => localStorage.removeItem(name),
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
            storage: createJSONStorage(() => localStorageForWeb),
        }
    )
);