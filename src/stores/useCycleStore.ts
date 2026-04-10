import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createMMKV } from "react-native-mmkv";
import { subDays } from "date-fns";
import { DEFAULT_BUCKETS } from "../constants/cycle";
import {
  Bucket,
  BucketTransaction,
  BucketType,
  CategoryLimit,
  Cycle,
  FixedTransaction,
  SurplusDestination,
} from "../interfaces/cycle.interface";
import useDataStore from "./useDataStore";
import {
  CategoryLabelPortuguese,
  CategoryLabelSpanish,
} from "../interfaces/categories.interface";

// ─── MMKV ────────────────────────────────────────────────────────────────────
export const cycleStorage = createMMKV({ id: "categories-storage" });

const mmkvStorage = {
  getItem: (key: string) => cycleStorage.getString(key) ?? null,
  setItem: (key: string, value: string) => cycleStorage.set(key, value),
  removeItem: (key: string) => cycleStorage.remove(key),
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
function nowISO(): string {
  return new Date().toISOString();
}

// ─── STATE ───────────────────────────────────────────────────────────────────
export interface CycleStoreState {
  cycles: Cycle[];
  activeCycles: Record<string, string | null>; // { accountId: cycleId }
  bucketsByAccount: Record<string, Bucket[]>; // { accountId: Bucket[] }
  bucketTransactions: BucketTransaction[];
  surplusDestinations: SurplusDestination[];
  fixedTransactions: FixedTransaction[];
  categoryLimits: CategoryLimit[];
  selectedCycleAccount: string;
}

// ─── ACTIONS ─────────────────────────────────────────────────────────────────
export interface CycleStoreActions {
  // Setup
  initAccountDataIfMissing: (accountId: string, userId: string) => void;
  setSelectedCycleAccount: (accountId: string, userId?: string) => void;

  // Cycles
  startNewCycle: (config: {
    accountId: string;
    userId: string;
    name?: string;
    baseBudget: number;
    startDate: Date;
    endDate: Date;
    cutoffDate?: Date;
    fixedExpenses?: number;
  }) => Cycle;
  addExpense: (cycleId: string, amount: number) => void;
  updateCycleBudget: (cycleId: string, newBudget: number) => void;
  updateCycleFixedExpenses: (cycleId: string, amount: number) => void;
  closeCycle: (
    cycleId: string,
    finalTotalSpent?: number,
  ) => {
    surplus: number;
    deficit: number;
      status: "surplus" | "deficit" | "exact";
  };

  // Surplus
  allocateToBucket: (cycleId: string, bucketId: string, amount: number) => void;
  allocateSurplus: (cycleId: string, bucketId: string, amount?: number) => void;
  applyRolloverToNextCycle: (fromCycleId: string, amount: number) => void;
  absorbDeficitWithBuffer: (cycleId: string) => boolean;

  // Buckets
  getBucketsByAccount: (accountId: string) => Bucket[];
  createBucket: (params: {
    userId: string;
    accountId: string;
    type: BucketType;
    name: string;
    iconName: string;
    color: string;
  }) => Bucket;
  updateBucket: (
    bucketId: string,
    accountId: string,
    updates: Partial<Pick<Bucket, "name" | "iconName">>,
  ) => void;
  depositToBucket: (params: {
    bucketId: string;
    accountId: string;
    userId: string;
    amount: number;
    cycleId?: string;
    note?: string;
  }) => boolean;
  withdrawFromBucket: (params: {
    bucketId: string;
    accountId: string;
    userId: string;
    amount: number;
    note?: string;
  }) => boolean;
  resetBucket: (bucketId: string, accountId: string) => void;

  // Fixed Transactions
  addFixedTransaction: (
    tx: Omit<FixedTransaction, "id" | "createdAt">,
  ) => FixedTransaction;
  updateFixedTransaction: (
    id: string,
    updates: Partial<Omit<FixedTransaction, "id" | "createdAt">>,
  ) => void;
  getFixedTransactionById: (id: string) => FixedTransaction | null;
  getFixedTransactionsByAccount: (accountId: string) => FixedTransaction[];
  toggleFixedTransactionPaid: (id: string, toNotPaid?: boolean) => boolean;
  toggleFixedTransactionActive: (id: string) => void;
  deleteFixedTransaction: (id: string) => void;

  // Category Limits
  setCategoryLimit: (
    params: Omit<CategoryLimit, "id" | "createdAt" | "updatedAt">,
  ) => void;
  deleteCategoryLimit: (limitId: string) => void;
  getCategoryLimitsByCycle: (cycleId: string) => CategoryLimit[];

  // Dev
  clearAllCycleData: () => void;
}

// ─── STORE ───────────────────────────────────────────────────────────────────
export const useCycleStore = create<CycleStoreState & CycleStoreActions>()(
  persist(
    immer((set, get) => ({
      // ── Initial state ──────────────────────────────────────────────────────
      cycles: [],
      activeCycles: {},
      bucketsByAccount: {},
      bucketTransactions: [],
      surplusDestinations: [],
      fixedTransactions: [],
      categoryLimits: [],
      selectedCycleAccount: "",

      // ── Setup ──────────────────────────────────────────────────────────────

      initAccountDataIfMissing: (accountId, userId) => {
        set((state) => {
          if (!state.bucketsByAccount[accountId]) {
            const defaults: Bucket[] = DEFAULT_BUCKETS.map((b: any) => ({
              id: generateId(),
              userId,
              type: b.type ?? b.id,
              name: b.name ?? b.label,
              iconName: b.iconName ?? b.emoji ?? "circle",
              color: b.color,
              totalAccumulated: 0,
              createdAt: nowISO(),
              updatedAt: nowISO(),
            }));
            state.bucketsByAccount[accountId] = defaults;
          }
        });
      },

      setSelectedCycleAccount: (accountId, userId) => {
        if (userId) get().initAccountDataIfMissing(accountId, userId);
        set(() => ({ selectedCycleAccount: accountId }));
      },

      // ── Cycles ─────────────────────────────────────────────────────────────

      startNewCycle: ({
        accountId,
        userId,
        name,
        baseBudget,
        startDate,
        endDate,
        cutoffDate,
        fixedExpenses = 0,
      }) => {
        get().initAccountDataIfMissing(accountId, userId);
        const buckets = get().bucketsByAccount[accountId] ?? [];
        const rolloverBucket = buckets.find((b) => b.type === "rollover");
        const rolloverBonus = rolloverBucket?.totalAccumulated ?? 0;

        const newCycle: Cycle = {
          id: generateId(),
          accountId,
          userId,
          name: name ?? `Ciclo ${startDate.toLocaleDateString()}`,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          cutoffDate: (cutoffDate ?? subDays(endDate, 5)).toISOString(),
          baseBudget,
          rolloverBonus,
          effectiveBudget: baseBudget + rolloverBonus,
          totalSpent: 0,
          fixedExpenses,
          status: "active",
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };

        set((state) => {
          if (rolloverBonus > 0 && rolloverBucket) {
            const b = state.bucketsByAccount[accountId].find(
              (b) => b.type === "rollover",
            );
            if (b) {
              b.totalAccumulated = 0;
              b.updatedAt = nowISO();
            }
          }
          state.cycles.push(newCycle);
          state.activeCycles[accountId] = newCycle.id;
        });

        return newCycle;
      },

      addExpense: (cycleId, amount) => {
        set((state) => {
          const cycle = state.cycles.find((c) => c.id === cycleId);
          if (cycle?.status === "active") {
            cycle.totalSpent += amount;
            cycle.updatedAt = nowISO();
          }
        });
      },

      updateCycleBudget: (cycleId, newBudget) => {
        set((state) => {
          const cycle = state.cycles.find((c) => c.id === cycleId);
          if (cycle) {
            cycle.baseBudget = newBudget;
            cycle.effectiveBudget = newBudget + cycle.rolloverBonus;
            cycle.updatedAt = nowISO();
          }
        });
      },

      updateCycleFixedExpenses: (cycleId, amount) => {
        set((state) => {
          const cycle = state.cycles.find((c) => c.id === cycleId);
          if (cycle) {
            cycle.fixedExpenses = amount;
            cycle.updatedAt = nowISO();
          }
        });
      },

      closeCycle: (cycleId, finalTotalSpent) => {
        const cycle = get().cycles.find((c) => c.id === cycleId);
        if (!cycle) return { surplus: 0, deficit: 0, status: "exact" };

        const spent = finalTotalSpent ?? cycle.totalSpent;
        const surplus = cycle.effectiveBudget - spent;

        set((state) => {
          const c = state.cycles.find((c) => c.id === cycleId);
          if (c) {
            c.status = "closed";
            c.totalSpent = spent;
            c.surplusAmount = surplus > 0 ? surplus : 0;
            c.updatedAt = nowISO();
            c.endDate = nowISO(); //Por si el ciclo se cierra antes de la fecha programada, se actualiza la fecha de fin al momento del cierre para cálculos posteriores.
            state.activeCycles[c.accountId] = null;
          }
        });

        if (surplus > 0) return { surplus, deficit: 0, status: "surplus" };
        if (surplus < 0)
          return { surplus: 0, deficit: Math.abs(surplus), status: "deficit" };
        return { surplus: 0, deficit: 0, status: "exact" };
      },

      // ── Surplus ────────────────────────────────────────────────────────────

      allocateToBucket: (cycleId, bucketId, amount) => {
        const cycle = get().cycles.find((c) => c.id === cycleId);
        if (!cycle || cycle.status !== "closed") return;

        const available = cycle.surplusAmount ?? 0;
        if (amount <= 0 || amount > available) return;

        const bucket = get().bucketsByAccount[cycle.accountId]?.find(
          (b) => b.id === bucketId,
        );
        if (!bucket) return;

        const txn: BucketTransaction = {
          id: generateId(),
          bucketId,
          cycleId,
          userId: cycle.userId,
          amount,
          type: "deposit",
          note: `Sobrante ciclo ${cycle.name}`,
          date: nowISO(),
          createdAt: nowISO(),
        };

        const destination: SurplusDestination = {
          id: generateId(),
          cycleId,
          bucketId,
          amount,
          createdAt: nowISO(),
        };

        set((state) => {
          const c = state.cycles.find((c) => c.id === cycleId);
          if (c) {
            c.surplusAmount = (c.surplusAmount ?? 0) - amount;
            c.updatedAt = nowISO();
          }
          const b = state.bucketsByAccount[cycle.accountId]?.find(
            (b) => b.id === bucketId,
          );
          if (b) {
            b.totalAccumulated += amount;
            b.updatedAt = nowISO();
          }
          state.bucketTransactions.push(txn);
          state.surplusDestinations.push(destination);
        });
      },

      allocateSurplus: (cycleId, bucketId, amount) => {
        const cycle = get().cycles.find((c) => c.id === cycleId);
        if (!cycle || cycle.status !== "closed") return;

        const available = cycle.surplusAmount ?? 0;
        const alloc = amount ?? available;
        if (alloc <= 0 || alloc > available) return;

        const bucket = get().bucketsByAccount[cycle.accountId]?.find(
          (b) => b.id === bucketId,
        );
        if (!bucket) return;

        const txn: BucketTransaction = {
          id: generateId(),
          bucketId,
          cycleId,
          userId: cycle.userId,
          amount: alloc,
          type: "deposit",
          note: `Sobrante ciclo ${cycle.name}`,
          date: nowISO(),
          createdAt: nowISO(),
        };

        const destination: SurplusDestination = {
          id: generateId(),
          cycleId,
          bucketId,
          amount: alloc,
          createdAt: nowISO(),
        };

        set((state) => {
          const c = state.cycles.find((c) => c.id === cycleId);
          if (c) {
            c.surplusAmount = (c.surplusAmount ?? 0) - alloc;
            c.updatedAt = nowISO();
          }
          const b = state.bucketsByAccount[cycle.accountId]?.find(
            (b) => b.id === bucketId,
          );
          if (b) {
            b.totalAccumulated += alloc;
            b.updatedAt = nowISO();
          }
          state.bucketTransactions.push(txn);
          state.surplusDestinations.push(destination);
        });
      },

      applyRolloverToNextCycle: (fromCycleId, amount) => {
        const cycle = get().cycles.find((c) => c.id === fromCycleId);
        if (!cycle) return;
        const rolloverBucket = get().bucketsByAccount[cycle.accountId]?.find(
          (b) => b.type === "rollover",
        );
        if (rolloverBucket)
          get().allocateSurplus(fromCycleId, rolloverBucket.id, amount);
      },

      absorbDeficitWithBuffer: (cycleId) => {
        const cycle = get().cycles.find((c) => c.id === cycleId);
        if (!cycle) return false;

        const deficit = cycle.totalSpent - cycle.effectiveBudget;
        const bufferBucket = get().bucketsByAccount[cycle.accountId]?.find(
          (b) => b.type === "buffer",
        );
        if (!bufferBucket || deficit <= 0 || bufferBucket.totalAccumulated <= 0)
          return false;

        const absorbed = Math.min(deficit, bufferBucket.totalAccumulated);

        set((state) => {
          const b = state.bucketsByAccount[cycle.accountId]?.find(
            (b) => b.type === "buffer",
          );
          if (b) {
            b.totalAccumulated -= absorbed;
            b.updatedAt = nowISO();
          }
          const c = state.cycles.find((c) => c.id === cycleId);
          if (c) {
            c.totalSpent -= absorbed;
            c.updatedAt = nowISO();
          }
          state.bucketTransactions.push({
            id: generateId(),
            bucketId: bufferBucket.id,
            cycleId,
            userId: cycle.userId,
            amount: -absorbed,
            type: "withdrawal",
            note: `Absorción déficit ciclo ${cycle.name}`,
            date: nowISO(),
            createdAt: nowISO(),
          });
        });

        return absorbed >= deficit;
      },

      // ── Buckets ────────────────────────────────────────────────────────────
      getBucketsByAccount: (accountId) => {
        const buckets = get().bucketsByAccount[accountId] ?? [];
        return buckets.filter((b) => b.type !== "rollover");
      },

      createBucket: ({ userId, accountId, type, name, iconName }) => {
        const newBucket: Bucket = {
          id: generateId(),
          userId,
          type,
          name,
          iconName,
          totalAccumulated: 0,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((state) => {
          if (!state.bucketsByAccount[accountId])
            state.bucketsByAccount[accountId] = [];
          state.bucketsByAccount[accountId].push(newBucket);
        });
        return newBucket;
      },

      updateBucket: (bucketId, accountId, updates) => {
        set((state) => {
          const b = state.bucketsByAccount[accountId]?.find(
            (b) => b.id === bucketId,
          );
          if (b) Object.assign(b, updates, { updatedAt: nowISO() });
        });
      },

      depositToBucket: ({
        bucketId,
        accountId,
        userId,
        amount,
        cycleId,
        note,
      }) => {
        const bucket = get().bucketsByAccount[accountId]?.find(
          (b) => b.id === bucketId,
        );
        if (!bucket || amount <= 0) return false;

        set((state) => {
          const b = state.bucketsByAccount[accountId]?.find(
            (b) => b.id === bucketId,
          );
          if (b) {
            b.totalAccumulated += amount;
            b.updatedAt = nowISO();
          }
          state.bucketTransactions.push({
            id: generateId(),
            bucketId,
            cycleId,
            userId,
            amount,
            type: "deposit",
            note,
            date: nowISO(),
            createdAt: nowISO(),
          });
        });
        return true;
      },

      withdrawFromBucket: ({ bucketId, accountId, userId, amount, note }) => {
        const bucket = get().bucketsByAccount[accountId]?.find(
          (b) => b.id === bucketId,
        );
        if (!bucket || bucket.totalAccumulated < amount) return false;

        set((state) => {
          const b = state.bucketsByAccount[accountId]?.find(
            (b) => b.id === bucketId,
          );
          if (b) {
            b.totalAccumulated -= amount;
            b.updatedAt = nowISO();
          }
          state.bucketTransactions.push({
            id: generateId(),
            bucketId,
            userId,
            amount: -amount,
            type: "withdrawal",
            note,
            date: nowISO(),
            createdAt: nowISO(),
          });
        });
        return true;
      },

      resetBucket: (bucketId, accountId) => {
        set((state) => {
          const b = state.bucketsByAccount[accountId]?.find(
            (b) => b.id === bucketId,
          );
          if (b) {
            b.totalAccumulated = 0;
            b.updatedAt = nowISO();
          }
        });
      },

      // ── Fixed Transactions ─────────────────────────────────────────────────

      addFixedTransaction: (tx) => {
        const newTx: FixedTransaction = {
          ...tx,
          id: generateId(),
          created_at: nowISO(),
        };
        set((state) => {
          state.fixedTransactions.push(newTx);
        });
        return newTx;
      },

      updateFixedTransaction: (id, updates) => {
        set((state) => {
          const tx = state.fixedTransactions.find((t) => t.id === id);
          if (tx) Object.assign(tx, updates);
        });
      },

      getFixedTransactionById: (id) => {
        return get().fixedTransactions.find((t) => t.id === id) || null;
      },

      getFixedTransactionsByAccount: (accountId) => {
        const currentAccount = get().selectedCycleAccount;
        if (currentAccount !== accountId) return [];
        return get().fixedTransactions.filter(
          (t) => t.account_id === accountId,
        );
      },

      toggleFixedTransactionPaid: (id, toNotPaid = false) => {
        const { addTransactionStore, deleteTransaction } = useDataStore.getState();
        let isNowPaid = false;

        set((state) => {
          const tx = state.fixedTransactions.find((t) => t.id === id);
          if (tx) {
            if (toNotPaid) {
              tx.isPaid = false;
            } else {
              tx.isPaid = !tx.isPaid;
            }
            isNowPaid = tx.isPaid;
          }
        });

        const updatedTx = get().fixedTransactions.find((t) => t.id === id);
        if (!updatedTx) return false;

        if (isNowPaid) {
          const defaultCategoriesSlug: string[] = [
            CategoryLabelSpanish[updatedTx.category_icon_name as keyof typeof CategoryLabelSpanish] || "",
            CategoryLabelPortuguese[updatedTx.category_icon_name as keyof typeof CategoryLabelPortuguese] || "",
          ];
          const isNewCategory = !defaultCategoriesSlug.includes(updatedTx.category_icon_name as string);

          addTransactionStore({
            id: updatedTx.id,
            account_id: updatedTx.account_id,
            user_id: updatedTx.user_id,
            amount: updatedTx.amount,
            type: updatedTx.type,
            date: updatedTx.dayOfMonth
              ? new Date(new Date().setDate(updatedTx.dayOfMonth)).toISOString()
              : new Date().toISOString(),
            description: updatedTx.description,
            categoryId: updatedTx.categoryId,
            slug_category_name: isNewCategory
              ? [updatedTx.category_icon_name as string, ...defaultCategoriesSlug]
              : defaultCategoriesSlug,
            category_icon_name: updatedTx.category_icon_name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          deleteTransaction(updatedTx.id);
        }

        return isNowPaid;
      },

      toggleFixedTransactionActive: (id) => {
        set((state) => {
          const tx = state.fixedTransactions.find((t) => t.id === id);
          if (tx) tx.isActive = !tx.isActive;
        });
      },

      deleteFixedTransaction: (id) => {
        const { deleteTransaction } = useDataStore.getState();

        // 1. Buscamos el estado actual (fuera del mutador para no tener conflictos lógicos)
        const txToDelete = get().fixedTransactions.find((t) => t.id === id);

        if (!txToDelete) return;

        // 2. Si la transacción ya está pagada, bloqueamos su eliminación 
        // (o podrías quitar este if si decides que SÍ se eliminen, pero tu código sugería bloquearlo)
        if (txToDelete.isPaid) {
          console.warn("No se puede eliminar una transacción fija que ya está pagada.");
          return;
        }

        // 3. Procedemos a eliminarla de la lista del store local
        set((state) => {
          state.fixedTransactions = state.fixedTransactions.filter(
            (t) => t.id !== id,
          );
        });

        // 4. Si necesitáramos borrarla del global (aunque arriba bloqueamos si estaba pagada), 
        // la llamada correcta sería esta:
        if (txToDelete.isPaid) {
          deleteTransaction(txToDelete.id);
        }
      },

      // ── Category Limits ────────────────────────────────────────────────────

      setCategoryLimit: ({ cycleId, categoryId, limitAmount }) => {
        set((state) => {
          const existingLimit = state.categoryLimits.find(
            (l) => l.cycleId === cycleId && l.categoryId === categoryId,
          );

          if (existingLimit) {
            existingLimit.limitAmount = limitAmount;
            existingLimit.updatedAt = nowISO();
          } else {
            state.categoryLimits.push({
              id: generateId(),
              cycleId,
              categoryId,
              limitAmount,
              createdAt: nowISO(),
            });
          }
        });
      },

      deleteCategoryLimit: (limitId: string) => {
        set((state) => {
          state.categoryLimits = state.categoryLimits.filter(
            (l) => l.id !== limitId,
          );
        });
      },

      getCategoryLimitsByCycle: (cycleId: string) => {
        return get().categoryLimits.filter((l) => l.cycleId === cycleId);
      },

      // ── Dev ────────────────────────────────────────────────────────────────

      clearAllCycleData: () => {
        set((state) => {
          state.cycles = [];
          state.activeCycles = {};
          state.bucketsByAccount = {};
          state.bucketTransactions = [];
          state.surplusDestinations = [];
          state.fixedTransactions = [];
          state.categoryLimits = [];
        });
      },
    })),
    {
      name: "cycle-store-v5",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        cycles: state.cycles,
        activeCycles: state.activeCycles,
        bucketsByAccount: state.bucketsByAccount,
        bucketTransactions: state.bucketTransactions,
        surplusDestinations: state.surplusDestinations,
        fixedTransactions: state.fixedTransactions,
        categoryLimits: state.categoryLimits,
      }),
    },
  ),
);

// ─── SELECTORS ───────────────────────────────────────────────────────────────

export const selectActiveCycle =
  (accountId: string) => (state: CycleStoreState) => {
    const activeId = state.activeCycles[accountId];
    if (!activeId) return null;
    return (
      state.cycles.find(
        (c) => c.id === activeId && c.accountId === accountId,
      ) ?? null
    );
  };

export const selectBuckets = (accountId: string) => (state: CycleStoreState) =>
  state.bucketsByAccount[accountId] ?? [];

export const selectBucketByType =
  (accountId: string, type: BucketType) => (state: CycleStoreState) =>
    state.bucketsByAccount[accountId]?.find((b) => b.type === type) ?? null;

export const selectBucketTransactions =
  (bucketId: string) => (state: CycleStoreState) =>
    state.bucketTransactions.filter((t) => t.bucketId === bucketId);

export const selectCycleHistory =
  (accountId: string) => (state: CycleStoreState) =>
    [...state.cycles]
      .filter((c) => c.status === "closed" && c.accountId === accountId)
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      );

export const selectTotalSaved =
  (accountId: string) => (state: CycleStoreState) => {
    const buckets = state.bucketsByAccount[accountId] ?? [];
    return (["savings", "emergency", "investment"] as BucketType[]).reduce(
      (acc, type) =>
        acc + (buckets.find((b) => b.type === type)?.totalAccumulated ?? 0),
      0,
    );
  };

export const selectActiveFixedTransactions = (state: CycleStoreState) =>
  state.fixedTransactions.filter((t) => t.isActive);

export const selectPendingSurplus =
  (accountId: string) => (state: CycleStoreState) =>
    state.cycles.find(
      (c) =>
        c.status === "closed" &&
        c.accountId === accountId &&
        (c.surplusAmount ?? 0) > 0 &&
        !state.surplusDestinations.some((d) => d.cycleId === c.id),
    ) ?? null;