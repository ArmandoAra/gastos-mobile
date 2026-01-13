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
    category_name: string;
    slug_category_name: string[];
    date: string;
    quantity?: number;
    transaction_group_id?: string;
    static_category_id?: string;
    user_category_id?: string;
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

export interface TransactionTemplate {
    id: string;
    description: string;
    amount: number;
    type: TransactionType;
    createdAt: Date; // Timestamp de creación
    updatedAt: Date; // Timestamp de última actualización
    categoryId: string; // Foreign key
    userId: string; // Foreign key
}


export interface TransactionGroup {
    id: string;
    name: string;
    initDate: Date; // ISO string format
    endDate: Date; // ISO string format
    createdAt: Date; // Timestamp de creación
    updatedAt: Date; // Timestamp de última actualización
    userId: string; // Foreign key
    monthFinanceId: string; // Foreign key
}