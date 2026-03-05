
import { DEFAULT_BUCKETS } from "../../../constants/cycle";
import { BucketType, CycleStoreState } from "../../../stores/useCycleStore";

export const selectActiveCycle = (accountId: string) => (state: CycleStoreState) => {
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
  // 1. Obtenemos el array de cofres de forma segura (si es undefined, usamos [])
  const bucketsArray = state.bucketsByAccount[accountId] || [];

  // 2. Sumamos el acumulado de todos los cofres (excepto el rollover, si quieres)
  return bucketsArray.reduce((sum, bucket) => {
    // Normalmente el rollover (sobrante para el mes siguiente) no se cuenta como "ahorro" neto.
    // Si tú sí quieres contarlo, simplemente quita este 'if'
    if (bucket.type === 'rollover') return sum;

    return sum + (bucket.totalAccumulated || 0);
  }, 0);
};

export const selectCycleHistory = (accountId: string) => (state: CycleStoreState) => {
  const allCycles = state.cycles || [];

  return allCycles
    .filter((c) => c.accountId === accountId && c.status === 'closed')
    // Ordenar de más reciente a más antiguo
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
};

// Si necesitas un selector para traer todos los buckets de una cuenta a la vez
export const selectBuckets = (accountId: string) => (state: CycleStoreState) => {
  return state.bucketsByAccount[accountId] || DEFAULT_BUCKETS;
};

export const selectFixedExpenses = (accountId: string) => (state: CycleStoreState) => {
  const cycle = selectActiveCycle(accountId)(state);
  return cycle ? cycle.fixedExpenses : [];
};