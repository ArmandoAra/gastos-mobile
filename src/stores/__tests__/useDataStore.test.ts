import { renderHook, act, waitFor } from '@testing-library/react-native';
import useDataStore from '../useDataStore'; // Ajusta la ruta si es necesario
import { TransactionType } from '../../interfaces/data.interface'; // Ajusta la ruta
import { create } from 'zustand';

// Mockeamos uuid para controlar los IDs en el test
const mockUuid = require('uuid');

describe('useDataStore (Zustand)', () => {
  // LIMPIEZA: Antes de cada test, reseteamos el store a su estado inicial
  beforeEach(() => {
    const { result } = renderHook(() => useDataStore());
    act(() => {
      result.current.reset();
    });
    // Limpiamos los mocks para que cuenten desde cero
    jest.clearAllMocks();
  });

  it('debe iniciar con el estado por defecto vacío', () => {
    const { result } = renderHook(() => useDataStore());
    expect(result.current.allAccounts).toEqual([]);
    expect(result.current.transactions).toEqual([]);
    expect(result.current.balance).toBe(0); // O 0, según tu lógica
  });

  it('debe crear una cuenta correctamente', async () => {
    const { result } = renderHook(() => useDataStore());
    
    // Forzamos a que el UUID sea 'account-1'
    mockUuid.v4.mockReturnValue('account-1');

    // ACT: Creamos la cuenta
    await act(async () => {
      await result.current.createAccount({ 
        name: 'Banco Test', 
        type: 'Cash',
        userId: 'user-1'
      });
    });

    // ASSERT: Verificamos que se guardó
    expect(result.current.allAccounts).toHaveLength(1);
    expect(result.current.allAccounts[0].id).toBe('account-1');
    expect(result.current.allAccounts[0].name).toBe('Banco Test');
    expect(result.current.selectedAccount).toBe('account-1'); // Debe seleccionarse automáticamente
  });

  it('debe calcular el saldo correctamente al sincronizar (Sync Logic)', async () => {
    const { result } = renderHook(() => useDataStore());
    
    // 1. ARRANGE: Crear una cuenta y configurar datos
    mockUuid.v4.mockReturnValue('acc-1');
    
    await act(async () => {
      await result.current.createAccount({ name: 'Wallet', userId: 'u1' });
    });

    // Simulamos transacciones
    const incomeTx = {
      id: 'tx-1',
      account_id: 'acc-1',
      amount: 1000,
      type: TransactionType.INCOME,
      user_id: 'u1',
      date: (new Date()).toISOString(),
        category_icon_name: 'Salary',
      description: 'Pago',
      created_at: (new Date()).toISOString(),
      updated_at: (new Date()).toISOString(),
    };

    const expenseTx = {
      id: 'tx-2',
      account_id: 'acc-1',
      amount: 200,
      type: TransactionType.EXPENSE,
      user_id: 'u1',
      date: (new Date()).toISOString(),
        category_icon_name: 'Food',
      description: 'Cena',
      created_at: (new Date()).toISOString(),
      updated_at: (new Date()).toISOString(),
    };

    // 2. ACT: Agregamos transacciones y corremos el SYNC
    act(() => {
      result.current.setTransactions([incomeTx, expenseTx]);
    });

    // EJECUTAMOS LA LÓGICA DE NEGOCIO REAL
    act(() => {
      result.current.syncAccountsWithTransactions();
    });

    // 3. ASSERT: El saldo debería ser 1000 - 200 = 800
    const updatedAccount = result.current.allAccounts.find(acc => acc.id === 'acc-1');
    expect(updatedAccount?.balance).toBe(800);
  });
  
  it('debe eliminar una transacción y actualizar el estado', () => {
     const { result } = renderHook(() => useDataStore());
     
     // Setup inicial
     const tx = { id: 'tx-1', amount: 50 } as any; // Mock parcial
     
     act(() => {
         result.current.setTransactions([tx]);
     });
     
     expect(result.current.transactions).toHaveLength(1);
     
     // Acción de borrar
     act(() => {
         result.current.deleteTransaction('tx-1');
     });
     
     expect(result.current.transactions).toHaveLength(0);
  });
});

describe('Integración Transacciones <-> Cuentas (Sync Logic)', () => {
    
    // Limpieza antes de cada test
    beforeEach(() => {
        const { result } = renderHook(() => useDataStore());
        act(() => {
            result.current.reset();
        });
        jest.clearAllMocks();
    });

    it('debe aumentar el saldo de la cuenta al agregar un INGRESO y sincronizar', async () => {
        const { result } = renderHook(() => useDataStore());
        mockUuid.v4.mockReturnValue('acc-1');

        // 1. Crear Cuenta (Saldo inicial 0)
        await act(async () => {
            await result.current.createAccount({ name: 'Banco A', userId: 'user-1' });
        });

        // 2. Agregar Transacción de Ingreso (+1500)
        const incomeTx = {
            id: 'tx-1',
            account_id: 'acc-1',
            amount: 1500,
            type: TransactionType.INCOME,
            user_id: 'user-1',
            date: ( new Date()).toISOString(),
            category_icon_name: 'Salary',
            description: 'Nómina',
            created_at: ( new Date()).toISOString(),
            updated_at: ( new Date()).toISOString(),
        };

        act(() => {
            result.current.addTransactionStore(incomeTx);
        });

        // 3. EJECUTAR SINCRONIZACIÓN (Aquí ocurre la magia)
        act(() => {
            result.current.syncAccountsWithTransactions();
        });

        // 4. Verificar Saldo
        const account = result.current.allAccounts.find(a => a.id === 'acc-1');
        expect(account?.balance).toBe(1500);
    });

    it('debe disminuir el saldo al agregar un GASTO y sincronizar', async () => {
        const { result } = renderHook(() => useDataStore());
        mockUuid.v4.mockReturnValue('acc-1');

        // 1. Crear Cuenta
        await act(async () => {
            await result.current.createAccount({ name: 'Efectivo', userId: 'user-1' });
        });

        // 2. Agregar Gasto (500)
        // Nota: Si el saldo es 0, debería quedar en -500
        const expenseTx = {
            id: 'tx-2',
            account_id: 'acc-1',
            amount: 500,
            type: TransactionType.EXPENSE,
            user_id: 'user-1',
            date: ( new Date()).toISOString(),
            category_icon_name: 'Food',
            description: 'Supermercado',
            created_at: ( new Date()).toISOString(),
            updated_at: ( new Date()).toISOString(),
        };

        act(() => {
            result.current.addTransactionStore(expenseTx);
            result.current.syncAccountsWithTransactions(); // Sincronizamos inmediatamente
        });

        const account = result.current.allAccounts.find(a => a.id === 'acc-1');
        expect(account?.balance).toBe(-500);
    });

    it('debe recalcular correctamente al ACTUALIZAR el monto de una transacción', async () => {
        const { result } = renderHook(() => useDataStore());
        mockUuid.v4.mockReturnValue('acc-1');

        // 1. Setup: Cuenta con 1 Ingreso de 1000
        await act(async () => {
            await result.current.createAccount({ name: 'Ahorros', userId: 'u1' });
        });

        const tx = {
            id: 'tx-1',
            account_id: 'acc-1',
            amount: 1000,
            type: TransactionType.INCOME,
            user_id: 'u1',
            date: ( new Date()).toISOString(),
            category_icon_name: 'Job',
            description: 'Freelance',
            created_at: ( new Date()).toISOString(),
            updated_at: ( new Date()).toISOString(),
        };

        act(() => {
            result.current.addTransactionStore(tx);
            result.current.syncAccountsWithTransactions();
        });

        // Checkpoint: Saldo debe ser 1000
        expect(result.current.allAccounts[0].balance).toBe(1000);

        // 2. ACTUALIZAR: Nos equivocamos, eran 2000, no 1000
        act(() => {
            result.current.updateTransaction({ id: 'tx-1', amount: 2000 });
            result.current.syncAccountsWithTransactions(); // ¡Importante resincronizar!
        });

        // 3. Verificar nuevo saldo
        expect(result.current.allAccounts[0].balance).toBe(2000);
    });

    it('debe restaurar el saldo al ELIMINAR una transacción', async () => {
        const { result } = renderHook(() => useDataStore());
        mockUuid.v4.mockReturnValue('acc-1');

        // 1. Setup: Cuenta + Gasto de 300
        await act(async () => {
            await result.current.createAccount({ name: 'Cartera', userId: 'u1' });
        });

        const tx = {
            id: 'tx-del',
            account_id: 'acc-1',
            amount: 300,
            type: TransactionType.EXPENSE,
            user_id: 'u1',
            date: ( new Date()).toISOString(),
            category_icon_name: 'Taxi',
            description: 'Uber',
            created_at: ( new Date()).toISOString(),
            updated_at: ( new Date()).toISOString(),
        };

        act(() => {
            result.current.addTransactionStore(tx);
            result.current.syncAccountsWithTransactions();
        });

        // Checkpoint: Saldo -300
        expect(result.current.allAccounts[0].balance).toBe(-300);

        // 2. BORRAR la transacción
        act(() => {
            result.current.deleteTransaction('tx-del');
            result.current.syncAccountsWithTransactions();
        });

        // 3. El saldo debe volver a 0 porque el gasto ya no existe
        expect(result.current.allAccounts[0].balance).toBe(0);
    });

    it('debe manejar múltiples transacciones y tipos mixtos correctamente', async () => {
        const { result } = renderHook(() => useDataStore());
        mockUuid.v4.mockReturnValue('acc-mix');

        await act(async () => {
            await result.current.createAccount({ name: 'Mix Account', userId: 'u1' });
        });

        const t1 = { id: '1', account_id: 'acc-mix', amount: 1000, type: TransactionType.INCOME, user_id: 'u1', date: (new Date()).toISOString(), created_at: (new Date()).toISOString(), updated_at: (new Date()).toISOString(), category_icon_name: 'A', description: 'A' };
        const t2 = { id: '2', account_id: 'acc-mix', amount: 200, type: TransactionType.EXPENSE, user_id: 'u1', date: (new Date()).toISOString(), created_at: (new Date()).toISOString(), updated_at: (new Date()).toISOString(), category_icon_name: 'B', description: 'B' };
        const t3 = { id: '3', account_id: 'acc-mix', amount: 50, type: TransactionType.EXPENSE, user_id: 'u1', date: (new Date()).toISOString(), created_at: (new Date()).toISOString(), updated_at: (new Date()).toISOString(), category_icon_name: 'C', description: 'C' };

        // 1000 (Ingreso) - 200 (Gasto) - 50 (Gasto) = 750
        act(() => {
            result.current.setTransactions([t1, t2, t3]);
            result.current.syncAccountsWithTransactions();
        });

        expect(result.current.allAccounts[0].balance).toBe(750);
    });
});

describe('Operaciones Críticas de Cuentas y Transferencias', () => {

    beforeEach(() => {
        const { result } = renderHook(() => useDataStore());
        act(() => { result.current.reset(); });
        jest.clearAllMocks();
    });

    it('debe TRANSFERIR todas las transacciones y el saldo de una cuenta a otra', async () => {
        const { result } = renderHook(() => useDataStore());
        mockUuid.v4.mockReturnValueOnce('acc-origin').mockReturnValueOnce('acc-dest');

        // 1. Setup: Crear 2 cuentas
        await act(async () => {
            await result.current.createAccount({ name: 'Origen', userId: 'u1' });
            await result.current.createAccount({ name: 'Destino', userId: 'u1' });
        });

        // 2. Agregar dinero a la cuenta Origen (1000)
        const tx1 = { 
            id: 'tx-1', account_id: 'acc-origin', amount: 1000, type: TransactionType.INCOME, 
            user_id: 'u1', date: (new Date()).toISOString(), created_at: '', updated_at: '', category_icon_name: '', description: '' 
        };
        
        act(() => {
            result.current.setTransactions([tx1]);
            result.current.syncAccountsWithTransactions();
        });

        // Verificación previa
        expect(result.current.getAccountById('acc-origin')?.balance).toBe(1000);
        expect(result.current.getAccountById('acc-dest')?.balance).toBe(0);

        // 3. EJECUTAR TRANSFERENCIA
        act(() => {
            result.current.transferAllAccountTransactions('acc-origin', 'acc-dest');
        });

        // 4. ASSERT: Validar el movimiento de dinero y datos
        const origin = result.current.getAccountById('acc-origin');
        const dest = result.current.getAccountById('acc-dest');
        const txUpdated = result.current.transactions.find(t => t.id === 'tx-1');

        // El origen debe quedar vacío
        expect(origin?.balance).toBe(0);
        
        // El destino debe tener el dinero
        expect(dest?.balance).toBe(1000);

        // La transacción ahora debe pertenecer a la cuenta destino
        expect(txUpdated?.account_id).toBe('acc-dest');
    });

    it('debe manejar correctamente el borrado de cuenta (Cascada)', async () => {
        const { result } = renderHook(() => useDataStore());
        mockUuid.v4.mockReturnValueOnce('acc-A').mockReturnValueOnce('acc-B');

        // 1. Crear 2 cuentas
        await act(async () => {
            await result.current.createAccount({ name: 'Cuenta A', userId: 'u1' }); // Se selecciona esta automáticamente
            await result.current.createAccount({ name: 'Cuenta B', userId: 'u1' });
        });

        // Agregar transacciones a la cuenta A
        const txA = { id: 'tx-A', account_id: 'acc-A', amount: 100, type: TransactionType.EXPENSE, user_id: 'u1', date: '', created_at: '', updated_at: '', category_icon_name: '', description: '' };
        
        act(() => {
            result.current.setTransactions([txA]);
            expect(result.current.selectedAccount).toBe('acc-A'); // Confirmar selección inicial
        });

        // 2. BORRAR la cuenta A (que está seleccionada)
        act(() => {
            result.current.deleteAccountStore('acc-A');
        });

        // 3. ASSERT
        // La cuenta A ya no debe existir
        expect(result.current.allAccounts.find(a => a.id === 'acc-A')).toBeUndefined();
        
        // Sus transacciones deben haber sido borradas también
        expect(result.current.transactions.find(t => t.id === 'tx-A')).toBeUndefined();

        // IMPORTANTE: La selección debe haber cambiado a la Cuenta B (o a vacío, según tu lógica)
        // Tu código dice: selectedAccount: needsNewSelection ? (newAccounts[0]?.id || '')
        expect(result.current.selectedAccount).toBe('acc-B');
    });

    it('debe filtrar cuentas y transacciones por Usuario correctamente (Seguridad)', async () => {
        const { result } = renderHook(() => useDataStore());
        mockUuid.v4.mockReturnValueOnce('acc-u1').mockReturnValueOnce('acc-u2');

        // Setup: Datos mezclados de Usuario 1 y Usuario 2
        await act(async () => {
            await result.current.createAccount({ name: 'User 1 Acc', userId: 'user-1' });
            await result.current.createAccount({ name: 'User 2 Acc', userId: 'user-2' });
        });

        const txU1 = { id: 't1', user_id: 'user-1', amount: 100 } as any;
        const txU2 = { id: 't2', user_id: 'user-2', amount: 500 } as any;

        act(() => {
            result.current.setTransactions([txU1, txU2]);
        });

        // 2. Probar Selectores
        const accountsU1 = result.current.getAllAccountsByUserId('user-1');
        const txsU1 = result.current.getAllTransactionsByUserId('user-1');

        // 3. ASSERT
        expect(accountsU1).toHaveLength(1);
        expect(accountsU1[0].id).toBe('acc-u1');

        expect(txsU1).toHaveLength(1);
        expect(txsU1[0].id).toBe('t1');
    });

    it('debe borrar una cantidad específica de una cuenta (deleteSomeAmountInAccount)', () => {
        const { result } = renderHook(() => useDataStore());
        mockUuid.v4.mockReturnValue('acc-1');

        // Setup manual de cuenta con saldo 1000
        const accountMock = { id: 'acc-1', name: 'Test', balance: 1000, userId: 'u1' } as any;
        
        act(() => {
            result.current.setAllAccounts([accountMock]);
        });

        // Acción: Borrar 200 (Simulando borrar un INGRESO de 200)
        // Si borro un ingreso, el saldo baja.
        act(() => {
            result.current.deleteSomeAmountInAccount('acc-1', 200, TransactionType.INCOME);
        });

        expect(result.current.allAccounts[0].balance).toBe(800);

        // Acción: Borrar 50 (Simulando borrar un GASTO de 50)
        // Si borro un gasto, el dinero "vuelve", el saldo sube.
        // NOTA: Tu lógica actual es: acc.balance - amountToDelete.
        // Si es INCOME: amountToDelete = 200 -> 1000 - 200 = 800. Correcto.
        // Si es EXPENSE: amountToDelete = -50 -> 800 - (-50) = 850. Correcto.
        
        act(() => {
            result.current.deleteSomeAmountInAccount('acc-1', 50, TransactionType.EXPENSE);
        });

        expect(result.current.allAccounts[0].balance).toBe(850);
    });
});