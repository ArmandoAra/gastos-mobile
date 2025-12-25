
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

export enum TransactionType {
    EXPENSE = 'expense',
    INCOME = 'income',
}

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: TransactionType;
    quantity?: number;
    date: Date; // ISO string format
    createdAt: Date; // Timestamp de creación
    updatedAt: Date; // Timestamp de última actualización
    categoryId: string; // Foreign key
    accountId: string; // Foreign key
    monthFinanceId?: string; // Foreign key
    transactionGroupId?: string; // Foreign key opcional
}

export interface Category {
    id: string;
    name: string;
    icon: string; // Nombre del icono asociado
    userId: string; // Foreign key
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