import { CategoryLabel } from "../api/interfaces";
import {  Category, TransactionType } from "../interfaces/data.interface";

export const CATEGORY_COLORS = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981',
    '#EF4444', '#06B6D4', '#F97316', '#6366F1', '#14B8A6'
];

export const COLOR_PICKER_PALETTE = [
    // --- ROJOS Y ROSAS (12) ---
    '#FCA5A5', '#F87171', '#EF4444', '#B91C1C', // Rojos
    '#FDA4AF', '#FB7185', '#F43F5E', '#BE123C', // Rose
    '#F9A8D4', '#F472B6', '#EC4899', '#9D174D', // Rosas

    // --- NARANJAS Y AMARILLOS (12) ---
    '#FDBA74', '#FB923C', '#F97316', '#C2410C', // Naranjas
    '#FCD34D', '#FBBF24', '#F59E0B', '#B45309', // Ámbar
    '#FDE047', '#FACC15', '#EAB308', '#A16207', // Amarillos

    // --- NATURALEZA Y VERDES (12) ---
    '#BEF264', '#A3E635', '#84CC16', '#4D7C0F', // Limas
    '#86EFAC', '#4ADE80', '#22C55E', '#15803D', // Verdes
    '#6EE7B7', '#34D399', '#10B981', '#047857', // Esmeraldas

    // --- FRÍOS Y CIANES (12) ---
    '#67E8F9', '#22D3EE', '#06B6D4', '#0E7490', // Cianes
    '#7DD3FC', '#38BDF8', '#0EA5E9', '#0369A1', // Azules Cielo
    '#93C5FD', '#60A5FA', '#3B82F6', '#1D4ED8', // Azules

    // --- PÚRPURAS Y VIOLETAS (8) ---
    '#C4B5FD', '#A78BFA', '#8B5CF6', '#6D28D9', // Violetas
    '#D8B4FE', '#C084FC', '#A855F7', '#7E22CE', // Púrpuras

    // --- NEUTROS Y ELEGANTES (4) ---
    '#94A3B8', '#64748B', '#475569', '#1E4D16'  // Slates / Grises Profundos
];

export const defaultCategoryNames: string[] = [
  // Income Categories
  'Salary', 'Extra', 'Dividends', 'Rentals', 'Sales', 'Gifts', 'Gains', 'Clients', 'Returns', 'Scholarships', 'Interest', 'Other',
  // Expense Categories
  'Food', 'Groceries', 'Transport', 'Home', 'Health', 'Education', 'Gaming', 'Travel', 'Shopping', 'Fitness', 'Coffee', 'Pet',
  'Tech', 'Entertainment', 'Music', 
  // Other Categories
  'Chart', 'SavingsGoal', 'Exchange', 'CreditCard', 'Currency', 'Payments', 'ATM', 'Furniture', 'Maintenance', 'Shipping',
  'Internet', 'Utilities', 'Idea', 'Investment', 'Company', 'Project', 'Team', 'Retail', 'Art', 'Photography', 'Reading',
  'Luxury', 'World', 'Nature', 'Subscription', 'Insurance', 'Podcast', 'Gadget', 'Donation', 'Security', 'Gym', 'Refund',
  'Lost', 'Baby', 'Beauty', 'Haircut', 'Clothes'
];

export const defaultCategories: Category[] = [
  // --- INCOME CATEGORIES ---
  {
    id: '1',
    name: 'Salary',
    icon: CategoryLabel.Salary,
    color: COLOR_PICKER_PALETTE[42],
    type: TransactionType.INCOME,
    userId: 'default'
  },
  {
    id: '2',
    name: 'Extra',
    icon: CategoryLabel.Extra,
    color: COLOR_PICKER_PALETTE[15],
    type: TransactionType.INCOME,
    userId: 'default'
  },
  {
    id: '3',
    name: 'Dividends',
    icon: CategoryLabel.Dividends,
    color: COLOR_PICKER_PALETTE[3],
    type: TransactionType.INCOME,
    userId: 'default'
  },
  {
    id: '4',
    name: 'Rentals',
    icon: CategoryLabel.Rentals,
    color: COLOR_PICKER_PALETTE[51],
    type: TransactionType.INCOME,
    userId: 'default'
  },
  {
    id: '5',
    name: 'Sales',
    icon: CategoryLabel.Sales,
    color: COLOR_PICKER_PALETTE[28],
    type: TransactionType.INCOME,
    userId: 'default'
  },
  {
    id: '6',
    name: 'Gifts',
    icon: CategoryLabel.Gifts,
    color: COLOR_PICKER_PALETTE[9],
    type: TransactionType.INCOME,
    userId: 'default'
  },
  {
    id: '7',
    name: 'Gains',
    icon: CategoryLabel.Gains,
    color: COLOR_PICKER_PALETTE[33],
    type: TransactionType.INCOME,
    userId: 'default'
  },
  {
    id: '8',
    name: 'Clients',
    icon: CategoryLabel.Clients,
    color: COLOR_PICKER_PALETTE[57],
    type: TransactionType.INCOME,
    userId: 'default'
  },
  {
    id: '9',
    name: 'Returns',
    icon: CategoryLabel.Returns,
    color: COLOR_PICKER_PALETTE[21],
    type: TransactionType.INCOME,
    userId: 'default'
  },
  {
    id: '10',
    name: 'Scholarships',
    icon: CategoryLabel.Scholarships,
    color: COLOR_PICKER_PALETTE[46],
    type: TransactionType.INCOME,
    userId: 'default'
  },
  {
    id: '11',
    name: 'Interest',
    icon: CategoryLabel.Interest,
    color: COLOR_PICKER_PALETTE[0],
    type: TransactionType.INCOME,
    userId: 'default'
  },
  {
    id: '12',
    name: 'Clothes',
    icon: CategoryLabel.Clothes,
    color: COLOR_PICKER_PALETTE[18],
    type: TransactionType.INCOME,
    userId: 'default'
  },

  // --- SPEND CATEGORIES ---
  {
    id: '13',
    name: 'Food',
    icon: CategoryLabel.Food,
    color: COLOR_PICKER_PALETTE[37],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '14',
    name: 'Groceries',
    icon: CategoryLabel.Groceries,
    color: COLOR_PICKER_PALETTE[5],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '15',
    name: 'Transport',
    icon: CategoryLabel.Transport,
    color: COLOR_PICKER_PALETTE[24],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '16',
    name: 'Home',
    icon: CategoryLabel.Home,
    color: COLOR_PICKER_PALETTE[59],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '17',
    name: 'Health',
    icon: CategoryLabel.Health,
    color: COLOR_PICKER_PALETTE[11],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '18',
    name: 'Education',
    icon: CategoryLabel.Education,
    color: COLOR_PICKER_PALETTE[43],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '19',
    name: 'Gaming',
    icon: CategoryLabel.Gaming,
    color: COLOR_PICKER_PALETTE[2],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '20',
    name: 'Travel',
    icon: CategoryLabel.Travel,
    color: COLOR_PICKER_PALETTE[30],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '21',
    name: 'Shopping',
    icon: CategoryLabel.Shopping,
    color: COLOR_PICKER_PALETTE[55],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '22',
    name: 'Fitness',
    icon: CategoryLabel.Fitness,
    color: COLOR_PICKER_PALETTE[14],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '23',
    name: 'Coffee',
    icon: CategoryLabel.Coffee,
    color: COLOR_PICKER_PALETTE[39],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '24',
    name: 'Pets',
    icon: CategoryLabel.Pets,
    color: COLOR_PICKER_PALETTE[8],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '25',
    name: 'Tech',
    icon: CategoryLabel.Tech,
    color: COLOR_PICKER_PALETTE[49],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '26',
    name: 'Entertainment',
    icon: CategoryLabel.Entertainment,
    color: COLOR_PICKER_PALETTE[20],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '27',
    name: 'Music',
    icon: CategoryLabel.Music,
    color: COLOR_PICKER_PALETTE[35],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  // --- OTHERS CATEGORIES ---
  {
    id: '29',
    name: 'Chart',
    icon: CategoryLabel.Chart,
    color: COLOR_PICKER_PALETTE[53],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '30',
    name: 'SavingsGoal',
    icon: CategoryLabel.SavingsGoal,
    color: COLOR_PICKER_PALETTE[12],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '31',
    name: 'Exchange',
    icon: CategoryLabel.Exchange,
    color: COLOR_PICKER_PALETTE[41],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '32',
    name: 'CreditCard',
    icon: CategoryLabel.CreditCard,
    color: COLOR_PICKER_PALETTE[7],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '33',
    name: 'Currency',
    icon: CategoryLabel.Currency,
    color: COLOR_PICKER_PALETTE[26],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '34',
    name: 'Payments',
    icon: CategoryLabel.Payments,
    color: COLOR_PICKER_PALETTE[58],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '35',
    name: 'ATM',
    icon: CategoryLabel.ATM,
    color: COLOR_PICKER_PALETTE[4],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '36',
    name: 'Furniture',
    icon: CategoryLabel.Furniture,
    color: COLOR_PICKER_PALETTE[22],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '37',
    name: 'Maintenance',
    icon: CategoryLabel.Maintenance,
    color: COLOR_PICKER_PALETTE[48],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '38',
    name: 'Shipping',
    icon: CategoryLabel.Shipping,
    color: COLOR_PICKER_PALETTE[16],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '39',
    name: 'Internet',
    icon: CategoryLabel.Internet,
    color: COLOR_PICKER_PALETTE[31],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '40',
    name: 'Utilities',
    icon: CategoryLabel.Utilities,
    color: COLOR_PICKER_PALETTE[54],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '41',
    name: 'Idea',
    icon: CategoryLabel.Idea,
    color: COLOR_PICKER_PALETTE[6],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '42',
    name: 'Investment',
    icon: CategoryLabel.Investment,
    color: COLOR_PICKER_PALETTE[44],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '43',
    name: 'Company',
    icon: CategoryLabel.Company,
    color: COLOR_PICKER_PALETTE[19],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '44',
    name: 'Project',
    icon: CategoryLabel.Project,
    color: COLOR_PICKER_PALETTE[36],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '45',
    name: 'Team',
    icon: CategoryLabel.Team,
    color: COLOR_PICKER_PALETTE[52],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '46',
    name: 'Retail',
    icon: CategoryLabel.Retail,
    color: COLOR_PICKER_PALETTE[23],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '47',
    name: 'Art',
    icon: CategoryLabel.Art,
    color: COLOR_PICKER_PALETTE[40],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '48',
    name: 'Photography',
    icon: CategoryLabel.Photography,
    color: COLOR_PICKER_PALETTE[10],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '49',
    name: 'Reading',
    icon: CategoryLabel.Reading,
    color: COLOR_PICKER_PALETTE[34],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '50',
    name: 'Luxury',
    icon: CategoryLabel.Luxury,
    color: COLOR_PICKER_PALETTE[56],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '51',
    name: 'World',
    icon: CategoryLabel.World,
    color: COLOR_PICKER_PALETTE[13],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '52',
    name: 'Nature',
    icon: CategoryLabel.Nature,
    color: COLOR_PICKER_PALETTE[45],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '53',
    name: 'Subscription',
    icon: CategoryLabel.Subscription,
    color: COLOR_PICKER_PALETTE[27],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '54',
    name: 'Insurance',
    icon: CategoryLabel.Insurance,
    color: COLOR_PICKER_PALETTE[38],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '55',
    name: 'Podcast',
    icon: CategoryLabel.Podcast,
    color: COLOR_PICKER_PALETTE[50],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '56',
    name: 'Gadget',
    icon: CategoryLabel.Gadget,
    color: COLOR_PICKER_PALETTE[17],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '57',
    name: 'Donation',
    icon: CategoryLabel.Donation,
    color: COLOR_PICKER_PALETTE[47],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '58',
    name: 'Security',
    icon: CategoryLabel.Security,
    color: COLOR_PICKER_PALETTE[25],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '59',
    name: 'Gym',
    icon: CategoryLabel.Gym,
    color: COLOR_PICKER_PALETTE[32],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '60',
    name: 'Refund',
    icon: CategoryLabel.Refund,
    color: COLOR_PICKER_PALETTE[29],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '61',
    name: 'Lost',
    icon: CategoryLabel.Lost,
    color: COLOR_PICKER_PALETTE[21],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '62',
    name: 'Baby',
    icon: CategoryLabel.Baby,
    color: COLOR_PICKER_PALETTE[43],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '63',
    name: 'Beauty',
    icon: CategoryLabel.Beauty,
    color: COLOR_PICKER_PALETTE[33],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '64',
    name: 'Haircut',
    icon: CategoryLabel.Haircut,
    color: COLOR_PICKER_PALETTE[55],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '65',
    name: 'Other',
    icon: CategoryLabel.Other,
    color: COLOR_PICKER_PALETTE[1],
    type: TransactionType.EXPENSE,
    userId: 'default'
  },
  {
    id: '66',
    name: 'OtherIncome',
    icon: CategoryLabel.OtherIncome,
    color: COLOR_PICKER_PALETTE[1],
    type: TransactionType.INCOME,
    userId: 'default'
  }
];