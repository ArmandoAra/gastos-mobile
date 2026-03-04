import { useState, useMemo, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { differenceInDays, addDays } from 'date-fns';
import { AppState } from 'react-native';
import { useCycleStore } from '../../../stores/useCycleStore';
import {
  selectBuckets,
  selectCycleHistory,
  selectActiveCycle,
  selectTotalSaved,
} from '../selectors/cycleSelectors';
import useDataStore from '../../../stores/useDataStore';

export const useCreditCycleScreen = () => {
  const [todayString, setTodayString] = useState(new Date().toDateString());

  const getAccoutTransactionsByCycle = useDataStore((s) => s.getAccoutTransactionsByCycle);
  const transactions = useDataStore((s) => s.transactions);
  const allAccounts = useDataStore((s) => s.allAccounts);
  const selectedAccountGlobal = useDataStore((s) => s.selectedAccount);

  // ── FUENTE DE VERDAD ÚNICA PARA LA CUENTA ──
  // Leemos y escribimos DIRECTAMENTE en Zustand. Cero estados locales duplicados.
  const storedCycleAccount = useCycleStore((s) => s.selectedCycleAccount);
  const setAccountSelected = useCycleStore((s) => s.setSelectedCycleAccount);
  const cycles = useCycleStore((s) => s.cycles);

  // Si storedCycleAccount está vacío (app recién instalada o borrada), usamos la cuenta global
  const accountSelected = storedCycleAccount || selectedAccountGlobal;

  // Garantizamos que el store se inicialice con la cuenta actual sin causar loops
  useEffect(() => {
    if (!storedCycleAccount && selectedAccountGlobal) {
      setAccountSelected(selectedAccountGlobal);
    }
  }, [storedCycleAccount, selectedAccountGlobal, setAccountSelected]);

  // ── DATOS DEL STORE ──
  const activeCycle = useCycleStore((state) => selectActiveCycle(accountSelected)(state));
  const buckets = useCycleStore((state) => selectBuckets(accountSelected)(state));
  const history = useCycleStore(useShallow((state) => selectCycleHistory(accountSelected)(state)));
  const totalSaved = useCycleStore((state) => selectTotalSaved(accountSelected)(state));
  const bufferBalance = useCycleStore((state) => state.bufferByAccount[accountSelected] || 0);
  const rollover = useCycleStore(
    (state) => state.bucketsByAccount[accountSelected]?.rollover?.totalAccumulated || 0
  );

  const selectedAccountObj = useMemo(
    () => allAccounts.find((acc) => acc.id === accountSelected),
    [accountSelected, allAccounts]
  );

  const isActiveCycle = !!activeCycle;

  const daysElapsed = useMemo(() => {
    if (!activeCycle) return 0;
    return differenceInDays(new Date(activeCycle.endDate), new Date(activeCycle.startDate));
  }, [activeCycle?.startDate, activeCycle?.endDate]);

  const remainingDays = useMemo(() => {
    if (!activeCycle) return 0;
    const today = new Date();
    const end = new Date(activeCycle.endDate);
    return differenceInDays(end, today);
  }, [activeCycle?.endDate, todayString]);

  const timeProgress = useMemo(() => {
    if (!activeCycle) return 0;
    const total = new Date(activeCycle.endDate).getTime() - new Date(activeCycle.startDate).getTime();
    const elapsed = Date.now() - new Date(activeCycle.startDate).getTime();
    return Math.min(Math.max(elapsed / total, 0), 1);
  }, [activeCycle, todayString]);

  const totalSpentInCycle = useMemo(() => {
    if (!activeCycle) return 0;
    const cycleTransactions = getAccoutTransactionsByCycle(
      accountSelected,
      new Date(activeCycle.startDate),
      new Date(activeCycle.endDate)
    );
    return cycleTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }, [activeCycle, accountSelected, transactions, getAccoutTransactionsByCycle]);

  const spendProgress = useMemo(() => {
    if (!activeCycle || activeCycle.baseBudget === 0) return 0;
    return Math.min(totalSpentInCycle / activeCycle.baseBudget, 1);
  }, [totalSpentInCycle, activeCycle]);

  const safeToSpendToday = useMemo(() => {
    if (!activeCycle) return 0;
    const elapsedDays = differenceInDays(new Date(), new Date(activeCycle.startDate)) + 1;
    const totalDays = differenceInDays(new Date(activeCycle.endDate), new Date(activeCycle.startDate)) + 1;
    const variableBudget = activeCycle.baseBudget - (activeCycle.fixedExpenses || 0);
    const expectedSpendByToday = (variableBudget / totalDays) * elapsedDays;
    return parseFloat((expectedSpendByToday - totalSpentInCycle).toFixed(2));
  }, [activeCycle, totalSpentInCycle]);

  // ── DATOS PARA LA GRÁFICA ──────────────────────────────────────────────────
  // REGLA CRÍTICA gifted-charts: data y data2 DEBEN tener exactamente la
  // misma longitud o data2 simplemente no se renderiza sin error visible.
  //
  // FIX: generamos AMBOS arrays en el MISMO loop — longitud idéntica garantizada.
  // Antes eran dos useMemo independientes que podían divergir (calculateDailyExpensesAcc
  // omite días sin transacciones, idealSpendingData incluye todos los días → lengths distintos).
  //
  // También normalizamos a valores positivos: gifted-charts no puede
  // mezclar eje negativo (real) con positivo (ideal) en el mismo chart.
  const { idealSpendingData, realSpendingData } = useMemo(() => {
    if (!activeCycle) return { idealSpendingData: [], realSpendingData: [] };

    const start = new Date(activeCycle.startDate);
    const end = new Date(activeCycle.endDate);
    const today = new Date();
    const lastDate = today < end ? today : end;

    // Días a mostrar: desde el inicio hasta hoy (o fin de ciclo si ya terminó)
    const daysToShow = Math.max(differenceInDays(lastDate, start) + 1, 1);
    const totalDays = Math.max(differenceInDays(end, start) + 1, 1);

    const variableBudget = activeCycle.baseBudget - (activeCycle.fixedExpenses || 0);
    const idealDailyRate = variableBudget / totalDays;

    // Pre-agrupar transacciones por fecha local → O(n) en vez de O(n²)
    const cycleTransactions = getAccoutTransactionsByCycle(accountSelected, start, end);
    const spendByDay: Record<string, number> = {};
    for (const tx of cycleTransactions) {
      const d = new Date(tx.date);
      // Fecha LOCAL para evitar desfases por zona horaria UTC (toISOString da UTC)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      spendByDay[key] = (spendByDay[key] || 0) + Math.abs(tx.amount);
    }

    const ideal: { value: number; label: string }[] = [];
    const real: { value: number; label: string }[] = [];
    let cumulativeReal = 0;

    for (let i = 0; i < daysToShow; i++) {
      const day = addDays(start, i);
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      const label = `D${day.getDate()}`;

      // Mismo índice, mismo label → arrays siempre en sync
      ideal.push({ label, value: parseFloat((idealDailyRate * (i + 1)).toFixed(2)) });

      cumulativeReal += spendByDay[key] || 0;
      real.push({ label, value: parseFloat(cumulativeReal.toFixed(2)) });
    }

    return { idealSpendingData: ideal, realSpendingData: real };
  }, [activeCycle, accountSelected, transactions, getAccoutTransactionsByCycle]);

  const avgSurplus = useMemo(
    () => history.length > 0
      ? history.reduce((a, c) => a + (c.surplusAmount ?? 0), 0) / history.length
      : 0,
    [history]
  );

  const pendingSurplusCycle = useMemo(
    () => cycles.find(
      (c) => c.status === 'closed' &&
        !c.surplusDestination &&
        (c.surplusAmount ?? 0) > 0 &&
        c.accountId === accountSelected
    ),
    [cycles, accountSelected]
  );

  // ── ESTADO DE UI ──
  const [isAccountSelectorOpen, setIsAccountSelectorOpen] = useState(false);
  const [showRollover, setShowRollover] = useState(false);
  const [showAlloc, setShowAlloc] = useState(!!pendingSurplusCycle);

  // ── EFECTOS ──
  useEffect(() => {
    setShowAlloc(!!pendingSurplusCycle);
  }, [pendingSurplusCycle]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        setTodayString(new Date().toDateString());
      }
    });
    const interval = setInterval(() => {
      setTodayString(new Date().toDateString());
    }, 1000 * 60 * 60);
    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  return {
    allAccounts,
    accountSelected,
    setAccountSelected,
    selectedAccountObj,
    isAccountSelectorOpen,
    setIsAccountSelectorOpen,
    activeCycle,
    isActiveCycle,
    daysElapsed,
    remainingDays,
    timeProgress,
    spendProgress,
    safeToSpendToday,
    totalSpentInCycle,
    rollover,
    totalSaved,
    bufferBalance,
    idealSpendingData,
    realSpendingData,
    avgSurplus,
    buckets,
    history,
    pendingSurplusCycle,
    showAlloc,
    setShowAlloc,
    showRollover,
    setShowRollover,
  };
};