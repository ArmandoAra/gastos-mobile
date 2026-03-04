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
import { calculateDailyExpensesAcc } from '../../../utils/helpers';

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
    return cycleTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [activeCycle, accountSelected, transactions, getAccoutTransactionsByCycle]);

  const spendProgress = useMemo(() => {
    if (!activeCycle || activeCycle.baseBudget === 0) return 0;
    return Math.min(totalSpentInCycle / activeCycle.baseBudget, 1);
  }, [totalSpentInCycle, activeCycle]);

  const safeToSpendToday = useMemo(() => {
    if (!activeCycle) return 0;
    const elapsedDays = differenceInDays(new Date(), new Date(activeCycle.startDate)) + 1;
    const totalDays = differenceInDays(new Date(activeCycle.endDate), new Date(activeCycle.startDate)) + 1;
    
    // Asumiendo que fixedExpenses es un number en tu interfaz de Cycle
    const variableBudget = activeCycle.baseBudget - (activeCycle.fixedExpenses || 0);
    const expectedSpendByToday = (variableBudget / totalDays) * elapsedDays;
    
    return parseFloat((expectedSpendByToday - totalSpentInCycle).toFixed(2));
  }, [activeCycle, totalSpentInCycle]);

 const idealSpendingData = useMemo(() => {
    if (!activeCycle) return [];

    const start = new Date(activeCycle.startDate);
    const end = new Date(activeCycle.endDate);
    const today = new Date();

    // Limitamos el ciclo hasta hoy (o hasta el endDate si el ciclo ya terminó)
    const lastDate = today > end ? end : today;

    const totalDays = differenceInDays(end, start) + 1;
    const elapsedDays = differenceInDays(lastDate, start) + 1;

    // Presupuesto destinado solo a gastos variables
    const variableBudget = activeCycle.baseBudget - (activeCycle.fixedExpenses || 0);
    const idealDailyRate = variableBudget / totalDays;

    const idealData = [];

    for (let i = 0; i < elapsedDays; i++) {
      const currentDate = addDays(start, i);
      const dayLabel = `D${currentDate.getDate()}`; 
      const accumulatedIdeal = idealDailyRate * (i + 1);

      idealData.push({
        label: dayLabel,
        value: parseFloat(accumulatedIdeal.toFixed(2)),
      });
    }

    return idealData;
  }, [activeCycle]);

  // ─── 2. GRÁFICO: GASTO REAL ACUMULADO ───
  const realSpendingData = useMemo(() => {
    if (!activeCycle) return [];

    const start = new Date(activeCycle.startDate);
    const end = new Date(activeCycle.endDate);
    const today = new Date();
    const lastDate = today > end ? end : today;

    // Obtenemos las transacciones específicas de este ciclo
    const cycleTransactions = getAccoutTransactionsByCycle(
      accountSelected,
      start,
      end
    );

    // Le pasamos las transacciones y las fechas a tu helper mejorado
    return calculateDailyExpensesAcc(cycleTransactions, start, lastDate);
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
    setAccountSelected, // Esto ahora llama a Zustand directo, evitando loops de estado local
    selectedAccountObj,
    isAccountSelectorOpen,
    setIsAccountSelectorOpen,
    activeCycle,
    isActiveCycle,
    daysElapsed,
    timeProgress,
    spendProgress,
    safeToSpendToday,
    totalSpentInCycle,
    rollover,
    totalSaved,
    bufferBalance,

    // Datos para el gráfico
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