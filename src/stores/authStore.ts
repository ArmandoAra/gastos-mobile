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

    // Acciones
    setupAccount: (name: string, pin: string, enableBiometrics: boolean) => Promise<void>;
    loginWithPin: (pin: string) => Promise<boolean>;
    loginWithBiometrics: () => Promise<boolean>;
    updateUser: (newData: Partial<UserProfile>) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
      (set, get) => ({
          user: null,
          pinHash: null,
          isSetupComplete: false,
          isAuthenticated: false,
          isBiometricEnabled: false,

          setupAccount: async (name, pin, enableBiometrics) => {
              // 1. Hasheamos el PIN para seguridad
              const hashed = await hashPin(pin);

              set({
                  user: { id: uuidv4(), name, currency: 'USD' },
                  pinHash: hashed,
                  isBiometricEnabled: enableBiometrics,
                  isSetupComplete: true,
                  isAuthenticated: true, // Auto-login al crear
              });
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

          loginWithBiometrics: async () => {
              const { isBiometricEnabled } = get();
              if (!isBiometricEnabled) return false;

              const success = await authenticateBiometric();
              if (success) {
                  set({ isAuthenticated: true });
              }
              return success;
          },

            updateUser: (newData: Partial<UserProfile>) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({ user: { ...currentUser, ...newData } });
                }
            },

          logout: () => set({ isAuthenticated: false }),
      }),
      {
        name: 'local-auth-storage',
        storage: createJSONStorage(() => mmkvStorage),
        // IMPORTANTE: No persistir 'isAuthenticated' para que siempre pida PIN al reiniciar app
        partialize: (state) => ({
            user: state.user,
            pinHash: state.pinHash,
            isSetupComplete: state.isSetupComplete,
            isBiometricEnabled: state.isBiometricEnabled,
        }),
      }
  )
);