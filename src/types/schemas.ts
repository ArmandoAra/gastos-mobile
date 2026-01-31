// // Enums
// export enum TransactionType {
//     EXPENSE = 'expense',
//     INCOME = 'income'
// }

// export enum AccountType {
//     SAVINGS = 'savings',
//     CHECKING = 'checking',
//     CASH = 'cash'
// }

// // Usuario
// export interface User {
//     id: string;
//     email: string;
//     name?: string;
//     created_at: string;
// }

// export interface LoginCredentials {
//     email: string;
//     password: string;
// }

// // Cuenta
// export interface Account {
//     id: string;
//     user_id: string;
//     name: string;
//     type: AccountType;
//     balance: number;
//     created_at: string;
//     updated_at: string;
// }

// export interface AccountCreate {
//     name: string;
//     type: AccountType;
// }

// // Categoría personalizada
// export interface UserCategory {
//     id: string;
//     user_id: string;
//     name: string;
//     icon_name: string;
// }

// export interface UserCategoryCreate {
//     name: string;
//     icon_name: string;
// }

// // Transacción
// export interface Transaction {
//     id: string;
//     account_id: string;
//     user_id: string;
//     description: string;
//     amount: number;
//     type: TransactionType;
//     category_icon_name: string;
//     slug_category_name: string[];
//     date: string;
//     quantity?: number;
//     transaction_group_id?: string;
//     static_category_id?: string;
//     user_category_id?: string;
//     created_at: string;
//     updated_at: string;
// }

// export interface TransactionCreate {
//     account_id: string;
//     description: string;
//     amount: number;
//     type: TransactionType;
//     category_icon_name: string;
//     date: string;
//     quantity?: number;
//     transaction_group_id?: string;
// }

// // Grupo/Plan
// export interface TransactionGroup {
//     id: string;
//     user_id: string;
//     name: string;
//     init_date: string;
//     end_date: string;
//     created_at: string;
//     updated_at: string;
// }

// // Local (offline)
// export interface PendingSync {
//     id: string;
//     type: 'create' | 'update' | 'delete';
//     entity: 'transaction' | 'account' | 'category';
//     data: any;
//     timestamp: number;
// }