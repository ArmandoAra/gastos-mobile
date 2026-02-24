import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createMMKV, MMKV } from 'react-native-mmkv';
import { addDays, subDays, isAfter, isBefore, format } from 'date-fns';

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
  cutoffDate: string;      // ISO — fecha de corte de tarjeta (suele ser ~5 días antes del end)
  baseBudget: number;      // Presupuesto base del usuario
  rolloverBonus: number;   // Sobrante del ciclo anterior que se sumó como rollover
  effectiveBudget: number; // baseBudget + rolloverBonus
  totalSpent: number;
  fixedExpenses: number;   // Gastos fijos futuros ya comprometidos en el ciclo
  status: CycleStatus;
  surplusDestination?: BucketType;
  surplusAmount?: number;
}

export interface CycleStoreState {
  // Ciclos
  cycles: Cycle[];
  activeCycleId: string | null;

  // Cofres
  buckets: Record<BucketType, Bucket>;

  // Buffer de amortiguación
  bufferBalance: number;

  // Computed (se calculan con selectores, no guardados)
  // — ver selectors abajo
}

export interface CycleStoreActions {
  // Ciclos
  startNewCycle: (config: {
    baseBudget: number;
    startDate: Date;
    endDate: Date;
    cutoffDate?: Date;
    fixedExpenses?: number;
  }) => Cycle;

  addExpense: (cycleId: string, amount: number) => void;

  closeCycle: (cycleId: string) => {
    surplus: number;
    deficit: number;
    status: 'surplus' | 'deficit' | 'exact';
  };

  // Destino del sobrante
  allocateSurplus: (
    cycleId: string,
    destination: BucketType,
    amount?: number  // Si no se pasa, usa el 100% del sobrante
  ) => void;

  // Rollover manual
  applyRolloverToNextCycle: (fromCycleId: string, amount: number) => void;

  // Buffer automático
  absorbDeficitWithBuffer: (cycleId: string) => boolean; // true si el buffer cubrió el déficit

  // Cofres
  withdrawFromBucket: (bucketId: BucketType, amount: number, note?: string) => boolean;
  resetBucket: (bucketId: BucketType) => void;
}

// ─── DEFAULTS ────────────────────────────────────────────────────────────────

const DEFAULT_BUCKETS: Record<BucketType, Bucket> = {
  rollover: {
    id: 'rollover',
    label: 'Mes siguiente',
    emoji: '🔄',
    color: '#63B3ED',
    totalAccumulated: 0,
    deposits: [],
  },
  savings: {
    id: 'savings',
    label: 'Ahorro',
    emoji: '🐷',
    color: '#68D391',
    totalAccumulated: 0,
    deposits: [],
  },
  emergency: {
    id: 'emergency',
    label: 'Emergencias',
    emoji: '🛡️',
    color: '#F6AD55',
    totalAccumulated: 0,
    deposits: [],
  },
  investment: {
    id: 'investment',
    label: 'Inversión',
    emoji: '📈',
    color: '#B794F4',
    totalAccumulated: 0,
    deposits: [],
  },
  buffer: {
    id: 'buffer',
    label: 'Amortiguador',
    emoji: '🧲',
    color: '#FC8181',
    totalAccumulated: 0,
    deposits: [],
  },
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
      // ── State ──────────────────────────────────────────────────────────────
      cycles: [],
      activeCycleId: null,
      buckets: DEFAULT_BUCKETS,
      bufferBalance: 0,

      // ── Actions ────────────────────────────────────────────────────────────

      startNewCycle: ({ baseBudget, startDate, endDate, cutoffDate, fixedExpenses = 0 }) => {
        const id = generateId();
        const pendingRollover = get().buckets.rollover.totalAccumulated;

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
        };

        set((state) => {
          // Si había rollover pendiente, limpiarlo del cofre
          if (pendingRollover > 0) {
            state.buckets.rollover.totalAccumulated = 0;
          }
          state.cycles.push(newCycle);
          state.activeCycleId = id;
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
          const c = state.cycles.find((c: Cycle) => c.id === cycleId);
          if (c) {
            c.status = 'closed';
            c.surplusAmount = surplus > 0 ? surplus : 0;
          }
          state.activeCycleId = null;
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
          const c = state.cycles.find((c: Cycle) => c.id === cycleId);
          if (c) {
            c.surplusDestination = destination;
          }

          const bucket = state.buckets[destination];
          bucket.totalAccumulated += alloc;
          bucket.deposits.push(deposit);
        });
      },

      applyRolloverToNextCycle: (fromCycleId, amount) => {
        // El rollover vive en el cofre hasta que se inicia el próximo ciclo
        get().allocateSurplus(fromCycleId, 'rollover', amount);
      },

      absorbDeficitWithBuffer: (cycleId) => {
        const cycle = get().cycles.find((c) => c.id === cycleId);
        if (!cycle) return false;

        const deficit = cycle.totalSpent - cycle.effectiveBudget;
        const buffer = get().bufferBalance;

        if (deficit <= 0 || buffer <= 0) return false;

        const absorbed = Math.min(deficit, buffer);

        set((state) => {
          state.bufferBalance -= absorbed;
          const c = state.cycles.find((c: Cycle) => c.id === cycleId);
          if (c) {
            c.totalSpent -= absorbed; // "cubre" la deuda contablemente
          }
        });

        return absorbed >= deficit; // true si el buffer cubrió TODO el déficit
      },

      withdrawFromBucket: (bucketId, amount, note) => {
        const bucket = get().buckets[bucketId];
        if (!bucket || bucket.totalAccumulated < amount) return false;

        set((state) => {
          state.buckets[bucketId].totalAccumulated -= amount;
        });

        return true;
      },

      resetBucket: (bucketId) => {
        set((state) => {
          state.buckets[bucketId].totalAccumulated = 0;
          state.buckets[bucketId].deposits = [];
        });
      },
    })),
    {
      name: 'cycle-store-v1',
      storage: createJSONStorage(() => mmkvStorage),
      // Solo persistir lo esencial
      partialize: (state) => ({
        cycles: state.cycles,
        activeCycleId: state.activeCycleId,
        buckets: state.buckets,
        bufferBalance: state.bufferBalance,
      }),
    }
  )
);

// ─── SELECTORS (usar fuera del store para evitar re-renders innecesarios) ────

export const selectActiveCycle = (state: CycleStoreState) =>
  state.cycles.find((c) => c.id === state.activeCycleId) ?? null;

export const selectSafeToSpend = (state: CycleStoreState): number => {
  const cycle = selectActiveCycle(state);
  if (!cycle) return 0;
  return cycle.effectiveBudget - cycle.totalSpent - cycle.fixedExpenses;
};

export const selectTimeProgress = (state: CycleStoreState): number => {
  const cycle = selectActiveCycle(state);
  if (!cycle) return 0;
  const total = new Date(cycle.endDate).getTime() - new Date(cycle.startDate).getTime();
  const elapsed = Date.now() - new Date(cycle.startDate).getTime();
  return Math.min(Math.max(elapsed / total, 0), 1);
};

export const selectSpendProgress = (state: CycleStoreState): number => {
  const cycle = selectActiveCycle(state);
  if (!cycle || cycle.effectiveBudget === 0) return 0;
  return Math.min(cycle.totalSpent / cycle.effectiveBudget, 1);
};

export const selectIsOverpacing = (state: CycleStoreState): boolean =>
  selectSpendProgress(state) > selectTimeProgress(state);

export const selectTotalSaved = (state: CycleStoreState): number =>
  (['savings', 'emergency', 'investment'] as BucketType[]).reduce(
    (acc, id) => acc + state.buckets[id].totalAccumulated,
    0
  );

export const selectCycleHistory = (state: CycleStoreState) =>
  [...state.cycles]
    .filter((c) => c.status === 'closed')
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());