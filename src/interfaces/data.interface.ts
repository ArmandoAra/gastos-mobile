import { CategoryLabel, CategoryLabelPortuguese, CategoryLabelSpanish } from "../api/interfaces";
import { COLOR_PICKER_PALETTE } from "../constants/categories";

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: Date; // Timestamp de creación
    updatedAt: Date; // Timestamp de última actualización
}

export interface Account {
    id: string;
    name: string;
    type: string; // Ej: "savings", "checking"
    balance: number;
    createdAt: Date; // Timestamp de creación
    updatedAt: Date; // Timestamp de última actualización
    userId: string; // Foreign key
}

export interface MonthFinance {
    id: string; // Cambiado a string para usar UUIDs
    year: number; // Año del mes financiero
    month: number; // Mes (1-12)
    date: Date; // ISO string del primer día del mes (ej: "2024-01-01")
    createdAt: Date; // Timestamp de creación
    updatedAt: Date; // Timestamp de última actualización
}

export interface YearResume extends MonthFinance {
    totalExpenses: number;
    totalIncomes: number;
}

export enum TransactionType {
    EXPENSE = 'expense',
    INCOME = 'income',
}

export interface Transaction {
    id: string;
    account_id: string;
    user_id: string;
    description: string;
    amount: number;
    type: TransactionType;
    category_icon_name: string;
    slug_category_name: string[];
    date: string;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    name: string;
    icon: CategoryLabel;
    color: typeof COLOR_PICKER_PALETTE[number];
    type: TransactionType;
    userId: string;
}


// Van a ir dentro de un presupuesto de gastos
export interface Item {
    id: string;
    name: string;
    price: number;
    quantity: number;
    expenseBudgetId: string; // Foreign key
}

// Pagina de presupuesto de gastos, cada presupuesto tiene varios items, y se le puede asignar una categoria
// Debe poder convertirse en Transaction solo si el usuario lo desea
export interface ExpenseBudget {
    id: string;
    account_id: string;
    user_id: string;
    name: string;
    slug_category_name: string[];
    category_icon_name: string;
    items: Item[];
    spentAmount: number; //Es la suma de los items
    budgetedAmount: number; //Es el monto total del presupuesto
    period?: 'weekly' | 'monthly' | 'yearly' | 'one-time'; // La fecha  endDate debe ser obligatoriamente para periodos recurrentes
    date: string;
    endDate?: string;
    created_at: string;
    updated_at: string;
}

// Requiere en los inputs de:
// nombre, categoria, budgetedAmount, period (opcional), endDate (opcional), items (opcional)