import { Transaction } from "../interfaces/data.interface";

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

export enum CategoryLabelSpanish {
    Salary = "Salario",
    Extra = "Extra",
    Dividends = "Dividendos",
    Rentals = "Alquileres",
    Sales = "Ventas",
    Gifts = "Regalos",
    Gains = "Ganancias",
    Clients = "Clientes",
    Returns = "Devoluciones",
    Scholarships = "Becas",
    Interest = "Intereses",
    OtherIncome = "Otros Ingresos",
    Food = "Comida",
    Groceries = "Supermercado",
    Transport = "Transporte",
    Home = "Hogar",
    Health = "Salud",
    Education = "Educación",
    Gaming = "Juegos",
    Travel = "Viajes",
    Shopping = "Compras",
    Fitness = "Fitness",
    Coffee = "Café",
    Pets = "Mascotas",
    Tech = "Tecnología",
    Entertainment = "Entretenimiento",
    Music = "Música",
    Other = "Otros",
    Chart = "Gráficos",
    SavingsGoal = "Meta de Ahorro",
    Exchange = "Cambio",
    CreditCard = "Tarjeta de Crédito",
    Currency = "Divisa",
    Payments = "Pagos",
    ATM = "Cajero Automático",
    Furniture = "Muebles",
    Maintenance = "Mantenimiento",
    Shipping = "Envíos",
    Internet = "Internet",
    Utilities = "Servicios Públicos",
    Idea = "Idea",
    Investment = "Inversión",
    Company = "Empresa",
    Project = "Proyecto",
    Team = "Equipo",
    Retail = "Comercio",
    Art = "Arte",
    Photography = "Fotografía",
    Reading = "Lectura",
    Luxury = "Lujo",
    World = "Mundo",
    Nature = "Naturaleza",
    Subscription = "Suscripción",
    Insurance = "Seguro",
    Podcast = "Podcast",
    Gadget = "Gadget",
    Donation = "Donación",
    Security = "Seguridad",
    Gym = "Gimnasio",
    Refund = "Reembolso"
}

export enum CategoryLabelPortuguese {
    Salary = "Salário",
    Extra = "Extra",
    Dividends = "Dividendos",
    Rentals = "Aluguéis",
    Sales = "Vendas",
    Gifts = "Presentes",
    Gains = "Ganhos",
    Clients = "Clientes",
    Returns = "Retornos",
    Scholarships = "Bolsas de Estudo",
    Interest = "Juros",
    OtherIncome = "Outras Rendas",
    Food = "Alimentação",
    Groceries = "Mercado",
    Transport = "Transporte",
    Home = "Casa",
    Health = "Saúde",
    Education = "Educação",
    Gaming = "Jogos",
    Travel = "Viagem",
    Shopping = "Compras",
    Fitness = "Fitness",
    Coffee = "Café",
    Pets = "Pets",
    Tech = "Tecnologia",
    Entertainment = "Entretenimento",
    Music = "Música",
    Other = "Outros",
    Chart = "Gráficos",
    SavingsGoal = "Meta de Economia",
    Exchange = "Câmbio",
    CreditCard = "Cartão de Crédito",
    Currency = "Moeda",
    Payments = "Pagamentos",
    ATM = "Caixa Eletrônico",
    Furniture = "Móveis",
    Maintenance = "Manutenção",
    Shipping = "Envios",
    Internet = "Internet",
    Utilities = "Serviços Públicos",
    Idea = "Ideia",
    Investment = "Investimento",
    Company = "Empresa",
    Project = "Projeto",
    Team = "Equipe",
    Retail = "Varejo",
    Art = "Arte",
    Photography = "Fotografia",
    Reading = "Leitura",
    Luxury = "Luxo",
    World = "Mundo",
    Nature = "Natureza",
    Subscription = "Assinatura",
    Insurance = "Seguro",
    Podcast = "Podcast",
    Gadget = "Gadget",
    Donation = "Doação",
    Security = "Segurança",
    Gym = "Academia",
    Refund = "Reembolso"
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