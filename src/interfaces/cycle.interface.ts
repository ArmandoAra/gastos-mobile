import { Transaction } from "./data.interface";


export type CycleStatus = 'active' | 'closed' | 'pending';

export interface Cycle {
  id: string;
  account_id: string;
  user_id: string;
  name: string;
  
  // Fechas
  start_date: string;
  end_date: string;   
  cutoff_date?: string; // Opcional: Fecha de corte real si es tarjeta de crédito
  
  // Finanzas del ciclo
  base_budget: number;      // El presupuesto original asignado
  rollover_bonus: number;   // Lo que sobró del mes pasado y se sumó a este
  total_spent: number;      // Total gastado hasta ahora
  fixed_expenses: number;   // Gastos fijos comprometidos en este ciclo
  
  // Cierre de ciclo
  status: CycleStatus;
  surplus_amount?: number;        // Cuánto sobró al cerrar
  surplus_destination?: string;   // A qué cofre se fue (ej. 'savings', 'rollover')
  
  // Auditoría
  created_at: string; 
  updated_at: string; 
}

export type BucketType = 'rollover' | 'savings' | 'emergency' | 'investment' | 'buffer';

export interface Bucket {
  id: string;
  user_id: string;
  type: BucketType;           // Tipo de cofre
  name: string;               // Ej: "Viaje a Japón" o "Emergencias"
  icon_name: string;
  color: string;
  total_accumulated: number;  // Saldo actual del cofre
  created_at: string;
  updated_at: string;
}

export interface BucketTransaction {
  id: string;
  bucket_id: string;      // A qué cofre entró/salió el dinero
  cycle_id?: string;      // (Opcional) De qué ciclo provino el sobrante
  user_id: string;
  amount: number;         // Positivo para depósitos, negativo para retiros
  type: 'deposit' | 'withdrawal';
  note?: string;          // Ej: "Sobrante de Octubre"
  date: string;
  created_at: string;
}

export interface FixedTransaction extends Transaction {
  id: string;
  day_of_month: number; // Para saber cuándo "ocurre" dentro del ciclo
  is_paid: boolean;     // Para marcar si ya se pagó este mes o no
  is_active: boolean;   // Por si el usuario quiere pausar una suscripción
  created_at: string;
}