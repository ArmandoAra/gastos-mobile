import { Transaction } from "./data.interface";


export type CycleStatus = 'active' | 'closed' | 'pending';

export interface Cycle {
  id: string;
  accountId: string;
  userId: string;
  name: string;
  
  // Fechas
  startDate: string;
  endDate: string;
  cutoffDate?: string; // Opcional: Fecha de corte real si es tarjeta de crédito
  
  // Finanzas del ciclo
  baseBudget: number;      // El presupuesto original asignado
  effectiveBudget: number;
  rolloverBonus: number;   // Lo que sobró del mes pasado y se sumó a este
  totalSpent: number;      // Total gastado hasta ahora
  fixedExpenses: number;   // Gastos fijos comprometidos en este ciclo
  
  // Cierre de ciclo
  status: CycleStatus;
  surplusAmount?: number;        // Cuánto sobró al cerrar
  
  // Auditoría
  createdAt: string;
  updatedAt: string;
}

export interface SurplusDestination {
  id: string;
  cycleId: string;
  bucketId: string;
  amount: number;
  createdAt: string;
  updatedAt?: string;
}

export type BucketType = 'rollover' | 'savings' | 'emergency' | 'investment' | 'buffer';

export interface Bucket {
  id: string;
  userId: string;
  type: BucketType;           // Tipo de cofre
  name: string;               // Ej: "Viaje a Japón" o "Emergencias"
  iconName: string;
  totalAccumulated: number;  // Saldo actual del cofre
  createdAt: string;
  updatedAt: string;
  color?: string;           // Para personalizar el color del cofre en la UI
}

export interface BucketTransaction {
  id: string;
  bucketId: string;      // A qué cofre entró/salió el dinero
  cycleId?: string;      // (Opcional) De qué ciclo provino el sobrante
  userId: string;
  amount: number;         // Positivo para depósitos, negativo para retiros
  type: 'deposit' | 'withdrawal';
  note?: string;          // Ej: "Sobrante de Octubre"
  date: string;
  createdAt: string;
}

export interface FixedTransaction extends Transaction {
  id: string;
  dayOfMonth: number; // Para saber cuándo "ocurre" dentro del ciclo
  isPaid: boolean;     // Para marcar si ya se pagó este mes o no
  isActive: boolean;   // Por si el usuario quiere pausar una suscripción
}

export interface CategoryLimit {
  id: string;
  cycleId: string;
  categoryId: string;
  limitAmount: number;
  createdAt: string;
  updatedAt?: string;
}