

const minYear = 1900;
const maxYear = 2100;

export function calculateTransactionsStats(transactions: Transaction[]): { totalIncome: number; totalExpenses: number | null; balance: number } {
    let totalIncome = 0;
    let totalExpenses = 0;
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else if (transaction.type === 'expense') {
            totalExpenses += transaction.amount;
        }
    });
    const balance = totalIncome + totalExpenses;
    return { totalIncome, totalExpenses, balance };
}




export function joinAndSortTransactions(transactions: Transaction[]): Transaction[] {
    return transactions.sort((a, b) => {
        const fechaA = new Date(a.date);
        const fechaB = new Date(b.date);
        return fechaB.getTime() - fechaA.getTime();
    }
    );
}

export interface Transaction {
    id: string,
    description: string,
    amount: number,
    type: "income" | "expense",
    date: Date, //Formato ISO 8601
    category_name: string, //Id del icono de la categoría para hacer que sea visual con el icono
    account_id: string,
    transaction_group_id?: string, //si pertenece a un grupo de transacciones va a tener un id de grupo
    quantity?: number, //Para transacciones recurrentes
    static_category_id?: string, //Para vincular con categorías predefinidas
    user_category_id?: string, //Para categorías personalizadas
}

export function filterTransactionsBySpecificDay(
    transactions: Transaction[],
    dayToFilter: string | number,
): Transaction[] {

    // Convertimos el parámetro a número por seguridad
    const targetDay = Number(dayToFilter);

    return transactions
        .filter(t => {
            const d = new Date(t.date);

            // Comparamos día, mes y año usando UTC para evitar saltos de zona horaria
            return (
                d.getUTCDate() === targetDay
            );
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function calculateTotalIncome(transactions: Transaction[]): number {
    return transactions
        .filter(transaction => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0);
}

export function calculateTotalExpenses(transactions: Transaction[]): number {
    return transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0);
}

export function calculateIncomesAndExpensesAmount(transactions: Transaction[]): { incomesAmount: number; expensesAmount: number } {
    let incomesAmount = 0;
    let expensesAmount = 0;
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            incomesAmount += transaction.amount;
        } else if (transaction.type === 'expense') {
            expensesAmount += transaction.amount;
        }
    });
    return { incomesAmount, expensesAmount };
}


/**
 * @param amount - El número o string numérico a formatear
 * @returns string formateado
 */
export const formatCurrency = (amount: number | string): string => {
    const numericValue = typeof amount === 'string' ? parseFloat(amount) : amount;

    // Si el valor no es un número válido, retornamos 0.00
    if (isNaN(numericValue)) return "0.00";

    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numericValue);
};

interface DateTextParams {
    month?: number | null;
    year?: number | null;
    day?: number | null;
}

import {MONTHS} from '../constants/date';

export function makeTextFromDate({ month = null, year = null, day = null }: DateTextParams) {
    switch (true) {
        case month !== null && year !== null && day !== null:
            return `${MONTHS[month]} ${day}, ${year}`;
        case month !== null && year !== null:
            return `${MONTHS[month]} ${year}`;
        case year !== null:
            return `${year}`;
        default:
            return '';
    }
}

export function makeTextFromDateToSave({ month = null, year = null, day = null }: DateTextParams) {
    const dayTime = new Date()

    switch (true) {
        case month !== null && year !== null && day !== null:
            return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}-${String(dayTime.getHours()).padStart(2, '0')}:${String(dayTime.getMinutes()).padStart(2, '0')}`;
        case month !== null && year !== null:
            return `${year}-${String(month + 1).padStart(2, '0')}-01-${String(dayTime.getHours()).padStart(2, '0')}:${String(dayTime.getMinutes()).padStart(2, '0')}`;
        case year !== null:
            return `${year}`;
        default:
            return '';
    }
}

//input format YY-dd-mm-H:m
export function splitDateString(dateString: string) {
    const [year, month, day, time] = dateString.split('-');
    const timeInSeconds = time.split(":").map(num => parseInt(num)) || [0, 0];
    return {
        year: parseInt(year),
        month: parseInt(month) - 1,
        day: parseInt(day),
        time: time,
        daySeconds: (timeInSeconds[0] * 3600) + (timeInSeconds[1] * 60)
    };
}

// Esto va para el archivo de edición de transacciones
export function formatDateToInputValue(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Define el tipo de dato que deseas para la fecha de salida
interface DateParts {
    year: number;
    month: number; // 1-12 (Formato humano)
    day: number;
    time: string; // Formato HH:MM
}

/**
 * Normaliza una fecha (o crea la actual) y extrae sus componentes en un formato legible.
 * @param dateInput - Objeto Date, string ISO o null/undefined.
 * @returns DateParts { year, month (1-12), day, time (HH:MM) }
 */
export const getNormalizedDateParts = (dateInput?: Date | string | null): DateParts => {
    // 1. Inicialización limpia: Si no es válido o no existe, usamos "now"
    const date = (dateInput && !isNaN(new Date(dateInput).getTime()))
        ? new Date(dateInput)
        : new Date();

    // 2. Extraer componentes locales
    // Usamos Intl.DateTimeFormat para asegurar el formato HH:mm con ceros a la izquierda
    const timeFormatter = new Intl.DateTimeFormat('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1, // Convertir 0-11 a 1-12
        day: date.getDate(),
        time: timeFormatter.format(date)
    };
};


export function calculateDaysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
}

export function makeUrlDate(year: number, month?: number | null, day?: number | null): string {

    const now = new Date();

    // 1. Validación GLOBAL del año (para todos los casos)
    let finalYear = year;
    if (!finalYear || finalYear < minYear || finalYear > maxYear) {
        finalYear = now.getFullYear();
    }

    if (!month && !day) {
        return `${finalYear}`;
    }

    let finalMonth = month;
    if (!finalMonth || finalMonth === 0 || finalMonth > 12) {
        finalMonth = now.getMonth() + 1;
    }

    if (!day) {
        return `${finalYear}-${String(finalMonth).padStart(2, '0')}`;
    }

    // 3. Validación del Día (Teniendo en cuenta los días reales del mes)
    let finalDay = day;
    const maxDaysInMonth = new Date(finalYear, finalMonth, 0).getDate();

    if (!finalDay || finalDay < 1 || finalDay > maxDaysInMonth) {
        finalDay = maxDaysInMonth;
        if (finalDay > maxDaysInMonth) finalDay = maxDaysInMonth;
    }

    return `${finalYear}-${String(finalMonth).padStart(2, '0')}-${String(finalDay).padStart(2, '0')}`;
}

export interface ParsedDate {
    year: number;
    month: number;
    day: number;
}

export function parseUrlDate(dateStr: string | null | undefined): ParsedDate {
    const now = new Date();

    // Valores por defecto (Fecha actual)
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();

    if (!dateStr) {
        return { year, month, day };
    }

    // Separamos el string por el guion
    const parts = dateStr.split('-');

    // 1. Validar Año
    const parsedYear = parseInt(parts[0], 10);
    if (!isNaN(parsedYear) && parsedYear >= minYear && parsedYear <= maxYear) {
        year = parsedYear;
    }

    // 2. Validar Mes (si existe en el string)
    if (parts.length >= 2) {
        const parsedMonth = parseInt(parts[1], 10);
        if (!isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
            month = parsedMonth;
        } else {
            month = now.getMonth() + 1; // Fallback al mes actual si es inválido
            if (parts.length >= 3) {
                parts.pop(); // Remover día inválido si existe
            }
        }
    }
    else {
        month = 0;
    }

    // 3. Validar Día (si existe en el string)
    if (parts.length >= 3) {
        const parsedDay = parseInt(parts[2], 10);
        const maxDaysInMonth = new Date(year, month, 0).getDate();

        if (!isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= maxDaysInMonth) {
            day = parsedDay;
        } else {
            // day = now.getDate();
            // if (day > maxDaysInMonth) day = maxDaysInMonth;
            day = maxDaysInMonth; // Fallback a 0 si es inválido
        }
    }
    // 4. Si el dia no existe en el string, vamos a mandar un null
    else {
        day = 0;
    }


    return { year, month, day };
}

// Budget helpers
/**
 * Agrupa y suma los montos de una lista de transacciones por su categoría.
 * @param {Array<Object>} transacciones La lista de objetos de transacción.
 * @returns {Array<Object>} Un arreglo de objetos { category: string, totalAmount: number }.
 */
export function sortAmountsByCategories(transacciones: Transaction[]): { category: string; totalAmount: number }[] {
    // 1. Usamos reduce para crear un objeto acumulador
    const totalesAgrupados = transacciones.reduce((acumulador, transaction) => {
        if (transaction.type === 'income') return acumulador;

        const categoria = transaction.category_name;
        const monto = transaction.amount;

        // Si la categoría ya existe en el acumulador, sumamos el monto
        if (acumulador[categoria]) {
            acumulador[categoria] += monto;
        } else {
            // Si no existe, la inicializamos con el monto actual
            acumulador[categoria] = monto;
        }
        return acumulador;

    }, {} as Record<string, number>); // El acumulador inicial es un objeto vacío {}

    // 2. Convertimos el objeto resultante en la lista de objetos deseada
    // Mapeamos las claves (categorías) del objeto a un nuevo formato [ { category: name, totalAmount: sum } ]
    const resultadoFinal = Object.keys(totalesAgrupados).map(categoria => ({
        category: categoria,
        totalAmount: totalesAgrupados[categoria]
    }));

    return resultadoFinal;
}

// Year dashboard helpers

export interface FormatFormData {
    month: number;
    totalIncome: number;
    totalExpenses: number;
}

export interface ExpensesByCategory {
    category: string;
    totalAmount: number;
}

export interface MonthAccumulator {
    [month: number]: {
        month: number;
        totalIncome: number;
        totalExpenses: number;
    };
}


export function formatMonthData(yearData: Transaction[]): FormatFormData[] {
    // 1. Usar reduce para agrupar y agregar en una sola pasada (O(N))
    const aggregatedData = yearData.reduce((acc: MonthAccumulator, transaction) => {
        // Obtenemos el mes (1-12) solo una vez por transacción
        const transactionMonth = new Date(transaction.date).getMonth() + 1;

        // Inicializar el mes si es la primera vez que lo vemos
        if (!acc[transactionMonth]) {
            acc[transactionMonth] = {
                month: transactionMonth,
                totalIncome: 0,
                totalExpenses: 0,
            };
        }

        // Agregar el monto basado en el tipo
        const amount = transaction.amount;

        if (transaction.type === 'income') {
            acc[transactionMonth].totalIncome += amount;
        } else if (transaction.type === 'expense') {
            // Nota: Aquí sumamos el gasto. 
            // Si amount es negativo (ej. -50), se resta, lo cual es incorrecto para un totalExpenses.
            // Si amount es POSITIVO y type='expense', simplemente sumamos.
            acc[transactionMonth].totalExpenses += Math.abs(amount); // Usar Math.abs por seguridad
        }

        return acc;
    }, {}); // El valor inicial es un objeto vacío para el mapeo

    // 2. Convertir el objeto de mapeo a un array del formato deseado
    // Object.values() itera sobre los valores (los objetos {month, income, expenses})
    return Object.values(aggregatedData);
}

export function calculateExpensesByCategory(transactions: Transaction[]): ExpensesByCategory[] {
    const categoryMap: { [key: string]: number } = {};
    transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
            if (!categoryMap[transaction.category_name]) {
                categoryMap[transaction.category_name] = 0;
            }
            categoryMap[transaction.category_name] += transaction.amount;
        }
    });

    return Object.entries(categoryMap).map(([category, totalAmount]) => ({
        category,
        totalAmount,
    }));
}

// Verificar con la data que se esta trabajando a nivel de fechas
export function dataByYearMonthOrDay(year: number, month?: number | null, day?: number | null) {
    if (year && month && day) {
        return 'day';
    } else if (year && month) {
        return 'month';
    } else {
        return 'year';
    }
}

