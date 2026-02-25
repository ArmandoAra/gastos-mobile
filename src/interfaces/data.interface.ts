
import { COLOR_PICKER_PALETTE } from "../constants/categories";
import { CategoryLabel } from "./categories.interface";

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Account {
    id: string;
    name: string;
    type: string; 
    balance: number;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
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
    categoryId?: string;
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
    isActive: boolean;
    userId: string;
}


// Van a ir dentro de un presupuesto de gastos
export interface Item {
    id: string;
    name: string;
    price: number;
    quantity: number;
    done: boolean;
    expenseBudgetId: string;
}

export interface ExpenseBudget {
    id: string;
    account_id: string;
    user_id: string;
    name: string;
    categoryId: string;
    slug_category_name: string[];
    category_icon_name: string;
    items: Item[];
    spentAmount: number; //Es la suma de los items
    budgetedAmount: number; //Es el monto total del presupuesto
    favorite: boolean;
    period?: 'weekly' | 'monthly' | 'yearly' | 'one-time'; 
    date: string;
    endDate?: string;
    created_at: string;
    updated_at: string;
}
