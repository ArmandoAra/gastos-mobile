import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createMMKV } from 'react-native-mmkv';
import { subDays, set } from 'date-fns';

// ─── MMKV Storage adapter for Zustand persist ────────────────────────────────
export const cycleStorage = createMMKV({
  id: 'categories-storage',
});

const mmkvStorage = {
  getItem: (key: string) => cycleStorage.getString(key) ?? null,
  setItem: (key: string, value: string) => cycleStorage.set(key, value),
  removeItem: (key: string) => cycleStorage.remove(key),
};

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type BucketType = 'rollover' | 'savings' | 'emergency' | 'investment' | 'buffer';

export interface SurplusDeposit {
  id: string;
  amount: number;
  fromCycleId: string;
  date: string; // ISO string
  note?: string;
}

export interface Bucket {
  id: BucketType;
  label: string;
  emoji: string;
  color: string;
  totalAccumulated: number;
  deposits: SurplusDeposit[];
}

export type CycleStatus = 'active' | 'closed' | 'pending';

export interface Cycle {
  id: string;
  startDate: string;       // ISO
  endDate: string;         // ISO
  cutoffDate: string;      // ISO
  baseBudget: number;
  rolloverBonus: number;
  effectiveBudget: number; 
  totalSpent: number;
  fixedExpenses: number;   
  status: CycleStatus;
  surplusDestination?: BucketType;
  surplusAmount?: number;
  accountId: string;       // ID de la cuenta a la que pertenece
}

export interface CycleStoreState {
  cycles: Cycle[];

  // ─── ESTRUCTURAS MULTI-CUENTA ───
  activeCycles: Record<string, string | null>; // { accountId: cycleId }
  bucketsByAccount: Record<string, Record<BucketType, Bucket>>; // { accountId: { savings: {...}, rollover: {...} } }
  bufferByAccount: Record<string, number>; // { accountId: balance }
  selectedCycleAccount: string; // Para UI, no es estrictamente necesario pero facilita las cosas
}

export interface CycleStoreActions {
  initAccountDataIfMissing: (accountId: string) => void;

  setSelectedCycleAccount: (accountId: string) => void;

  startNewCycle: (config: {
    baseBudget: number;
    startDate: Date;
    endDate: Date;
    cutoffDate?: Date;
    fixedExpenses?: number;
    accountId: string; 
  }) => Cycle;

  addExpense: (cycleId: string, amount: number) => void;

  closeCycle: (cycleId: string) => {
    surplus: number;
    deficit: number;
    status: 'surplus' | 'deficit' | 'exact';
  };

  allocateSurplus: (
    cycleId: string,
    destination: BucketType,
    amount?: number 
  ) => void;

  applyRolloverToNextCycle: (fromCycleId: string, amount: number) => void;
  absorbDeficitWithBuffer: (cycleId: string) => boolean;

  // Cofres (ahora requieren accountId porque operan fuera de un ciclo)
  withdrawFromBucket: (accountId: string, bucketId: BucketType, amount: number, note?: string) => boolean;
  resetBucket: (accountId: string, bucketId: BucketType) => void;

  clearAllCycleData: () => void;
}

// ─── DEFAULTS ────────────────────────────────────────────────────────────────

const DEFAULT_BUCKETS: Record<BucketType, Bucket> = {
  rollover: { id: 'rollover', label: 'Mes siguiente', emoji: '🔄', color: '#63B3ED', totalAccumulated: 0, deposits: [] },
  savings: { id: 'savings', label: 'Ahorro', emoji: '🐷', color: '#68D391', totalAccumulated: 0, deposits: [] },
  emergency: { id: 'emergency', label: 'Emergencias', emoji: '🛡️', color: '#F6AD55', totalAccumulated: 0, deposits: [] },
  investment: { id: 'investment', label: 'Inversión', emoji: '📈', color: '#B794F4', totalAccumulated: 0, deposits: [] },
  buffer: { id: 'buffer', label: 'Amortiguador', emoji: '🧲', color: '#FC8181', totalAccumulated: 0, deposits: [] },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function computeSurplus(cycle: Cycle): number {
  return cycle.effectiveBudget - cycle.totalSpent;
}

// ─── STORE ───────────────────────────────────────────────────────────────────

export const useCycleStore = create<CycleStoreState & CycleStoreActions>()(
  persist(
    immer((set, get) => ({
      // ── State ──
      cycles: [],
      activeCycles: {},
      bucketsByAccount: {},
      bufferByAccount: {},
      selectedCycleAccount: '',

      // ── Actions ──
      initAccountDataIfMissing: (accountId) => {
        set((state) => {
          if (!state.bucketsByAccount[accountId]) {
            // Se hace un deep copy para que las cuentas no compartan las referencias de los arrays
            state.bucketsByAccount[accountId] = JSON.parse(JSON.stringify(DEFAULT_BUCKETS));
          }
          if (state.bufferByAccount[accountId] === undefined) {
            state.bufferByAccount[accountId] = 0;
          }
        });
      },

      setSelectedCycleAccount: (accountId) => {
        get().initAccountDataIfMissing(accountId);
        set(() => ({ selectedCycleAccount: accountId }));
      },

      startNewCycle: ({ baseBudget, startDate, endDate, cutoffDate, fixedExpenses = 0, accountId }) => {
        get().initAccountDataIfMissing(accountId);

        const id = generateId();
        const pendingRollover = get().bucketsByAccount[accountId].rollover.totalAccumulated;

        const newCycle: Cycle = {
          id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          cutoffDate: (cutoffDate ?? subDays(endDate, 5)).toISOString(),
          baseBudget,
          rolloverBonus: pendingRollover,
          effectiveBudget: baseBudget + pendingRollover,
          totalSpent: 0,
          fixedExpenses,
          status: 'active',
          accountId,
        };

        set((state) => {
          if (pendingRollover > 0) {
            state.bucketsByAccount[accountId].rollover.totalAccumulated = 0;
          }
          state.cycles.push(newCycle);
          state.activeCycles[accountId] = id; // Ciclo activo PARA ESTA CUENTA
        });

        return newCycle;
      },

      addExpense: (cycleId, amount) => {
        set((state) => {
          const cycle = state.cycles.find((c) => c.id === cycleId);
          if (cycle && cycle.status === 'active') {
            cycle.totalSpent += amount;
          }
        });
      },

      closeCycle: (cycleId) => {
        const cycle = get().cycles.find((c) => c.id === cycleId);
        if (!cycle) return { surplus: 0, deficit: 0, status: 'exact' };

        const surplus = computeSurplus(cycle);

        set((state) => {
          const c = state.cycles.find((c) => c.id === cycleId);
          if (c) {
            c.status = 'closed';
            c.surplusAmount = surplus > 0 ? surplus : 0;
            state.activeCycles[c.accountId] = null; // Limpiar el activo de SU cuenta
          }
        });

        if (surplus > 0) return { surplus, deficit: 0, status: 'surplus' };
        if (surplus < 0) return { surplus: 0, deficit: Math.abs(surplus), status: 'deficit' };
        return { surplus: 0, deficit: 0, status: 'exact' };
      },

      allocateSurplus: (cycleId, destination, amount) => {
        const cycle = get().cycles.find((c) => c.id === cycleId);
        if (!cycle || cycle.status !== 'closed') return;

        const available = cycle.surplusAmount ?? 0;
        const alloc = amount ?? available;
        if (alloc <= 0 || alloc > available) return;

        const deposit: SurplusDeposit = {
          id: generateId(),
          amount: alloc,
          fromCycleId: cycleId,
          date: new Date().toISOString(),
        };

        set((state) => {
          const c = state.cycles.find((c) => c.id === cycleId);
          if (c) {
            c.surplusDestination = destination;
            // Se inyecta al bucket correcto de su propia cuenta
            const bucket = state.bucketsByAccount[c.accountId][destination];
            bucket.totalAccumulated += alloc;
            bucket.deposits.push(deposit);
          }
        });
      },

      applyRolloverToNextCycle: (fromCycleId, amount) => {
        get().allocateSurplus(fromCycleId, 'rollover', amount);
      },

      absorbDeficitWithBuffer: (cycleId) => {
        const cycle = get().cycles.find((c) => c.id === cycleId);
        if (!cycle) return false;

        const accountId = cycle.accountId;
        const deficit = cycle.totalSpent - cycle.effectiveBudget;
        const buffer = get().bufferByAccount[accountId] || 0;

        if (deficit <= 0 || buffer <= 0) return false;

        const absorbed = Math.min(deficit, buffer);

        set((state) => {
          state.bufferByAccount[accountId] -= absorbed;
          const c = state.cycles.find((c) => c.id === cycleId);
          if (c) c.totalSpent -= absorbed; // "cubre" la deuda
        });

        return absorbed >= deficit;
      },

      withdrawFromBucket: (accountId, bucketId, amount, note) => {
        // Se asegura de que la cuenta existe en el store
        get().initAccountDataIfMissing(accountId);
        const bucket = get().bucketsByAccount[accountId][bucketId];

        if (!bucket || bucket.totalAccumulated < amount) return false;

        set((state) => {
          state.bucketsByAccount[accountId][bucketId].totalAccumulated -= amount;
        });

        return true;
      },

      resetBucket: (accountId, bucketId) => {
        set((state) => {
          if (state.bucketsByAccount[accountId]?.[bucketId]) {
            state.bucketsByAccount[accountId][bucketId].totalAccumulated = 0;
            state.bucketsByAccount[accountId][bucketId].deposits = [];
          }
        });
      },

      clearAllCycleData: () => {
        set((state) => {
          state.cycles = [];
          state.activeCycles = {};
          state.bucketsByAccount = {};
          state.bufferByAccount = {};
        });

        // 🛠️ FIX: Reinicializamos inmediatamente la cuenta seleccionada 
        // para que la UI tenga sus datos por defecto y no colapse al leer "null".
        const currentAccount = get().selectedCycleAccount;
        if (currentAccount) {
          get().initAccountDataIfMissing(currentAccount);
        }
      },

    })),
    {
      name: 'cycle-store-v2', // IMPORTANTE: Se cambió a v2 para no chocar con tu JSON viejo y evitar crasheos
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        cycles: state.cycles,
        activeCycles: state.activeCycles,
        bucketsByAccount: state.bucketsByAccount,
        bufferByAccount: state.bufferByAccount,
      }),
    }
  )
);

// ─── SELECTORS ───────────────────────────────────────────────────────────────
// Los selectores ahora están currificados.
// Ejemplo de uso: const activeCycle = useCycleStore(selectActiveCycle(accountId));

export const selectActiveCycle = (accountId: string) => (state: CycleStoreState,) => {
  const activeId = state.activeCycles[accountId];
  if (!activeId) return null;
  return state.cycles.find((c) => c.id === activeId && c.accountId === accountId) ?? null;
};

export const selectSafeToSpend = (accountId: string) => (state: CycleStoreState): number => {
  const cycle = selectActiveCycle(accountId)(state);
  if (!cycle) return 0;
  return cycle.effectiveBudget - cycle.totalSpent - cycle.fixedExpenses;
};

export const selectTimeProgress = (accountId: string) => (state: CycleStoreState): number => {
  const cycle = selectActiveCycle(accountId)(state);
  if (!cycle) return 0;
  const total = new Date(cycle.endDate).getTime() - new Date(cycle.startDate).getTime();
  const elapsed = Date.now() - new Date(cycle.startDate).getTime();
  return Math.min(Math.max(elapsed / total, 0), 1);
};

export const selectSpendProgress = (accountId: string) => (state: CycleStoreState): number => {
  const cycle = selectActiveCycle(accountId)(state);
  if (!cycle || cycle.effectiveBudget === 0) return 0;
  return Math.min(cycle.totalSpent / cycle.effectiveBudget, 1);
};

export const selectIsOverpacing = (accountId: string) => (state: CycleStoreState): boolean => {
  return selectSpendProgress(accountId)(state) > selectTimeProgress(accountId)(state);
};

export const selectTotalSaved = (accountId: string) => (state: CycleStoreState): number => {
  if (!state.bucketsByAccount[accountId]) return 0;

  return (['savings', 'emergency', 'investment'] as BucketType[]).reduce(
    (acc, id) => acc + (state.bucketsByAccount[accountId][id]?.totalAccumulated || 0),
    0
  );
};

export const selectCycleHistory = (accountId: string) => (state: CycleStoreState) => {
  return [...state.cycles]
    .filter((c) => c.status === 'closed' && c.accountId === accountId)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
};

// Si necesitas un selector para traer todos los buckets de una cuenta a la vez
export const selectBuckets = (accountId: string) => (state: CycleStoreState) => {
  return state.bucketsByAccount[accountId] || null;
};