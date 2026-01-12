import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import { hashPin, authenticateBiometric } from '../utils/security';
import { v4 as uuidv4 } from 'uuid';

// 1. Storage seguro para auth
const storage = createMMKV({ id: 'local-auth-storage' });

const mmkvStorage = {
    setItem: (name: string, value: string) => storage.set(name, value),
    getItem: (name: string) => storage.getString(name) ?? null,
    removeItem: (name: string) => storage.remove(name),
};

interface UserProfile {
    id: string;
    name: string;
    email?: string;
    currency: string;
}

interface AuthState {
    user: UserProfile | null;
    pinHash: string | null;      // Guardamos el hash, NO el PIN real
    isSetupComplete: boolean;    // ¿Ya creó usuario?
    isAuthenticated: boolean;    // ¿Ya ingresó el PIN hoy?
    isBiometricEnabled: boolean;
    isPinEnabled: boolean;
    currencySymbol: string;
    setCurrencySymbol: (symbol: string) => void;

    // Acciones
    setupAccount: (name: string, pin: string, enableBiometrics: boolean) => Promise<UserProfile>;
    loginWithPin: (pin: string) => Promise<boolean>;
    loginWithBiometrics: () => Promise<boolean>;
    changePin: (oldPin: string, newPin: string) => Promise<{ success: boolean; message: string }>;
    togglePin: () => void;
    toggleBiometrics: () => void;
    updateUser: (newData: Partial<UserProfile>) => void;
    deleteUser: () => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
      (set, get) => ({
          user: null,
          pinHash: null,
            isPinEnabled: false,
          isSetupComplete: false,
          isAuthenticated: false,
          isBiometricEnabled: false,
            currencySymbol: '$',

            setupAccount: async (name, pin, enableBiometrics) => {
              const hashed = await hashPin(pin);
                const newUser: UserProfile = {
                    id: uuidv4(),
                    name,
                    currency: 'USD'
                };

                // IMPORTANTE: Asegúrate de que el set se haga antes de cualquier redirección
              set({
                  user: newUser,
                  pinHash: hashed,
                  isPinEnabled: true,
                  isBiometricEnabled: enableBiometrics,
                  isSetupComplete: true,
                  isAuthenticated: true, 
              });
                return Promise.resolve(newUser); 
          },

          loginWithPin: async (inputPin) => {
              const storedHash = get().pinHash;
              if (!storedHash) return false;

              // 1. Hasheamos lo que escribió el usuario
              const inputHash = await hashPin(inputPin);

              // 2. Comparamos los hashes
              if (inputHash === storedHash) {
                  set({ isAuthenticated: true });
                  return true;
              }
              return false;
          },
            changePin: async (oldPin, newPin): Promise<{ success: boolean; message: string }> => {
                const storedHash = get().pinHash;
                if (!storedHash) return { success: false, message: 'No PIN is set.' };

                // 1. Validar el PIN antiguo
                const oldPinHash = await hashPin(oldPin);
                if (oldPinHash !== storedHash) {
                    return { success: false, message: 'Current PIN is incorrect.' };
                }

                // 2. Hashear y guardar el nuevo PIN
                try {
                    const newPinHash = await hashPin(newPin);
                    set({ pinHash: newPinHash });
                    return { success: true, message: 'PIN updated successfully.' };
                } catch (error) {
                    return { success: false, message: 'Error updating PIN.' };
                }
            },

            togglePin: () => {
                set((state) => ({ isPinEnabled: !state.isPinEnabled }));
            },

          loginWithBiometrics: async () => {
              const { isBiometricEnabled } = get();
              if (!isBiometricEnabled) return false;

              const success = await authenticateBiometric();
              if (success) {
                  set({ isAuthenticated: true });
              }
              return success;
          },

            toggleBiometrics: () => {
                set((state) => ({ isBiometricEnabled: !state.isBiometricEnabled }));
            },

            setCurrencySymbol: (symbol: string) => {
                set({ currencySymbol: symbol });
            },

            updateUser: (newData: Partial<UserProfile>) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({ user: { ...currentUser, ...newData } });
                }
            },

            deleteUser: () => {
                set({ user: null, pinHash: null, isSetupComplete: false, isAuthenticated: false, isBiometricEnabled: false });
            },

          logout: () => set({ isAuthenticated: false }),
      }),
        {
        name: 'local-auth-storage',
            storage: createJSONStorage(() => mmkvStorage),
        partialize: (state) => ({
            user: state.user,
            isPinEnabled: state.isPinEnabled,
            pinHash: state.pinHash,
            isSetupComplete: state.isSetupComplete,
            isBiometricEnabled: state.isBiometricEnabled,
            currencySymbol: state.currencySymbol,
        }),
      }
  )
);