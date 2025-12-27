
export interface Account {
  id: string,
  name: string,
  type: string,
  balance: number,
  user_id: string,
}

export enum CategoryLabel  {
    Salary = "Salary",
    Extra = "Extra",
    Dividends = "Dividends",
    Rentals = "Rentals",
    Sales = "Sales",
    Gifts = "Gifts",
    Gains = "Gains",
    Clients = "Clients",
    Returns = "Returns",
    Scholarships = "Scholarships",
    Interest = "Interest",
    OtherIncome = "OtherIncome",
    Food = "Food",
    Groceries = "Groceries",
    Transport = "Transport",
    Home = "Home",
    Health = "Health",
    Education = "Education",
    Gaming = "Gaming",
    Travel = "Travel",
    Shopping = "Shopping",
    Fitness = "Fitness",
    Coffee = "Coffee",
    Pets = "Pets",
    Tech = "Tech",
    Entertainment = "Entertainment",
    Music = "Music",
    Other = "Other",
    Chart = "Chart",
    SavingsGoal = "SavingsGoal",
    Exchange = "Exchange",
    CreditCard = "CreditCard",
    Currency = "Currency",
    Payments = "Payments",
    ATM = "ATM",
    Furniture = "Furniture",
    Maintenance = "Maintenance",
    Shipping = "Shipping",
    Internet = "Internet",
    Utilities = "Utilities",
    Idea = "Idea",
    Investment = "Investment",
    Company = "Company",
    Project = "Project",
    Team = "Team",
    Retail = "Retail",
    Art = "Art",
    Photography = "Photography",
    Reading = "Reading",
    Luxury = "Luxury",
    World = "World",
    Nature = "Nature",
    Subscription = "Subscription",
    Insurance = "Insurance",
    Podcast = "Podcast",
    Gadget = "Gadget",
    Donation = "Donation",
    Security = "Security",
    Gym = "Gym",
    Refund = "Refund",
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

export interface TransactionResponse extends Transaction {
  id: string,
  created_at: string,
  updated_at: string,
}


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
    type: "income" | "expense";
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