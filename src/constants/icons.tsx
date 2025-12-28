import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { CategoryLabel } from '../api/interfaces';



// =====================================================================
// 1. HELPERS Y TIPOS DE ICONOS
// =====================================================================

type IconProps = {
    color?: string;
    size?: number;
    style?: any;
};

// Helper para crear componentes de iconos compatibles
const createIcon = (name: keyof typeof MaterialIcons.glyphMap) => (props: IconProps) => (
    <MaterialIcons name={name} size={props.size || 24} color={props.color || '#FFF'} style={props.style} />
);
// Iconos para la barra inferior (usando emojis en App.tsx)
export const SumarizeIcon = createIcon('summarize');
export const AnaliticsIcon = createIcon('analytics');
export const SettingsIcon = createIcon('settings');



// =====================================================================
// 2. DEFINICIÓN DE TODOS LOS COMPONENTES DE ICONOS
// =====================================================================
// --- Income ---
const WorkIcon = createIcon('work');
const AttachMoneyIcon = createIcon('attach-money');
const AccountBalanceIcon = createIcon('account-balance');
const HomeWorkIcon = createIcon('home-work');
const LocalOfferIcon = createIcon('local-offer');
const RedeemIcon = createIcon('redeem');
const ArrowUpwardIcon = createIcon('arrow-upward');
const PeopleIcon = createIcon('people');
const ReceiptLongIcon = createIcon('receipt-long');
const SchoolIcon = createIcon('school');
const SavingsIcon = createIcon('savings');
const AddCircleIcon = createIcon('add-circle');

// --- Spend ---
const RestaurantIcon = createIcon('restaurant');
const LocalGroceryStoreIcon = createIcon('local-grocery-store');
const DirectionsCarIcon = createIcon('directions-car');
const HomeIcon = createIcon('home');
const LocalHospitalIcon = createIcon('local-hospital');
const SportsEsportsIcon = createIcon('sports-esports');
const FlightIcon = createIcon('flight');
const ShoppingBagIcon = createIcon('shopping-bag');
const FitnessCenterIcon = createIcon('fitness-center');
const LocalCafeIcon = createIcon('local-cafe');
const PetsIcon = createIcon('pets');
const PhoneAndroidIcon = createIcon('phone-android');
const MovieIcon = createIcon('movie');
const MusicNoteIcon = createIcon('music-note');
const MoreHorizIcon = createIcon('more-horiz');

// --- Others (Faltaban definir estos wrappers) ---
const ShowChartIcon = createIcon('show-chart');
const CurrencyExchangeIcon = createIcon('currency-exchange');
const CreditCardIcon = createIcon('credit-card');
const PaymentsIcon = createIcon('payments');
const LocalAtmIcon = createIcon('local-atm');
const WeekendIcon = createIcon('weekend');
const BuildIcon = createIcon('build');
const LocalShippingIcon = createIcon('local-shipping');
const WifiIcon = createIcon('wifi');
const LightbulbIcon = createIcon('lightbulb');
const EmojiObjectsIcon = createIcon('emoji-objects');
const TrendingUpIcon = createIcon('trending-up');
const BusinessIcon = createIcon('business');
const WorkspacesIcon = createIcon('workspaces');
const PeopleAltIcon = createIcon('people-alt');
const StorefrontIcon = createIcon('storefront');
const PaletteIcon = createIcon('palette');
const CameraAltIcon = createIcon('camera-alt');
const BookIcon = createIcon('book');
const DiamondIcon = createIcon('diamond');
const PublicIcon = createIcon('public');
const LandscapeIcon = createIcon('landscape');
const MailIcon = createIcon('mail');
const VpnKeyIcon = createIcon('vpn-key'); // 'Key' en MUI suele ser 'vpn-key' en MaterialIcons
const MicIcon = createIcon('mic');
const WatchIcon = createIcon('watch');
const VolunteerActivismIcon = createIcon('volunteer-activism');
const SecurityIcon = createIcon('security');
const ArrowCircleUpIcon = createIcon('arrow-circle-up');

// =====================================================================
// 3. INTERFACES Y ENUMS
// =====================================================================

export enum IconKey {
    spend = "expense",
    income = "income",
    others = "others",
    none = "none"
}

export interface IconOption {
    id: string;
    icon: React.ComponentType<IconProps>;
    label: CategoryLabel;
    gradientColors: [string, string];
}

export interface IconsOptions {
    income: IconOption[];
    expense: IconOption[];
    others: IconOption[];
    none: IconOption[];
}

// =====================================================================
// 4. OBJETO ICON_OPTIONS (Corregido con las variables definidas arriba)
// =====================================================================

export const ICON_OPTIONS: IconsOptions = {
    [IconKey.income]: [
        { id: '1', icon: WorkIcon, label: CategoryLabel.Salary, gradientColors: ['#06b6d4', '#22d3ee'] },
        { id: '2', icon: AttachMoneyIcon, label: CategoryLabel.Extra, gradientColors: ['#10b981', '#34d399'] },
        { id: '3', icon: AccountBalanceIcon, label: CategoryLabel.Dividends, gradientColors: ['#f59e0b', '#f97316'] },
        { id: '4', icon: HomeWorkIcon, label: CategoryLabel.Rentals, gradientColors: ['#3b82f6', '#60a5fa'] },
        { id: '5', icon: LocalOfferIcon, label: CategoryLabel.Sales, gradientColors: ['#8b5cf6', '#a78bfa'] },
        { id: '6', icon: RedeemIcon, label: CategoryLabel.Gifts, gradientColors: ['#ef4444', '#f87171'] },
        { id: '7', icon: ArrowUpwardIcon, label: CategoryLabel.Gains, gradientColors: ['#059669', '#10b981'] },
        { id: '8', icon: PeopleIcon, label: CategoryLabel.Clients, gradientColors: ['#ec4899', '#f472b6'] },
        { id: '9', icon: ReceiptLongIcon, label: CategoryLabel.Returns, gradientColors: ['#a855f7', '#c084fc'] },
        { id: '10', icon: SchoolIcon, label: CategoryLabel.Scholarships, gradientColors: ['#14b8a6', '#2dd4bf'] },
        { id: '11', icon: SavingsIcon, label: CategoryLabel.Interest, gradientColors: ['#eab308', '#facc15'] },
        { id: '12', icon: AddCircleIcon, label: CategoryLabel.OtherIncome, gradientColors: ['#64748b', '#94a3b8'] },
    ],
    [IconKey.spend]: [
        { id: '13', icon: RestaurantIcon, label: CategoryLabel.Food, gradientColors: ['#f59e0b', '#f97316'] },
        { id: '14', icon: LocalGroceryStoreIcon, label: CategoryLabel.Groceries, gradientColors: ['#10b981', '#34d399'] },
        { id: '15', icon: DirectionsCarIcon, label: CategoryLabel.Transport, gradientColors: ['#3b82f6', '#60a5fa'] },
        { id: '16', icon: HomeIcon, label: CategoryLabel.Home, gradientColors: ['#8b5cf6', '#a78bfa'] },
        { id: '17', icon: LocalHospitalIcon, label: CategoryLabel.Health, gradientColors: ['#ef4444', '#f87171'] },
        { id: '18', icon: SchoolIcon, label: CategoryLabel.Education, gradientColors: ['#06b6d4', '#22d3ee'] },
        { id: '19', icon: SportsEsportsIcon, label: CategoryLabel.Gaming, gradientColors: ['#ec4899', '#f472b6'] },
        { id: '20', icon: FlightIcon, label: CategoryLabel.Travel, gradientColors: ['#14b8a6', '#2dd4bf'] },
        { id: '21', icon: ShoppingBagIcon, label: CategoryLabel.Shopping, gradientColors: ['#f43f5e', '#fb7185'] },
        { id: '22', icon: FitnessCenterIcon, label: CategoryLabel.Fitness, gradientColors: ['#84cc16', '#a3e635'] },
        { id: '23', icon: LocalCafeIcon, label: CategoryLabel.Coffee, gradientColors: ['#78716c', '#a8a29e'] },
        { id: '24', icon: PetsIcon, label: CategoryLabel.Pets, gradientColors: ['#fb923c', '#fdba74'] },
        { id: '25', icon: PhoneAndroidIcon, label: CategoryLabel.Tech, gradientColors: ['#6366f1', '#818cf8'] },
        { id: '26', icon: MovieIcon, label: CategoryLabel.Entertainment, gradientColors: ['#a855f7', '#c084fc'] },
        { id: '27', icon: MusicNoteIcon, label: CategoryLabel.Music, gradientColors: ['#d946ef', '#e879f9'] },
        { id: '28', icon: MoreHorizIcon, label: CategoryLabel.Other, gradientColors: ['#eab308', '#facc15'] },
    ],
    [IconKey.others]: [
        { id: '29', icon: ShowChartIcon, label: CategoryLabel.Chart, gradientColors: ['#64748b', '#94a3b8'] },
        { id: '30', icon: SavingsIcon, label: CategoryLabel.SavingsGoal, gradientColors: ['#4ade80', '#86efac'] },
        { id: '31', icon: CurrencyExchangeIcon, label: CategoryLabel.Exchange, gradientColors: ['#f97316', '#fb923c'] },
        { id: '32', icon: CreditCardIcon, label: CategoryLabel.CreditCard, gradientColors: ['#7c3aed', '#a855f7'] },
        { id: '33', icon: AttachMoneyIcon, label: CategoryLabel.Currency, gradientColors: ['#fcd34d', '#facc15'] },
        { id: '34', icon: PaymentsIcon, label: CategoryLabel.Payments, gradientColors: ['#f43f5e', '#fb7185'] },
        { id: '35', icon: LocalAtmIcon, label: CategoryLabel.ATM, gradientColors: ['#14b8a6', '#2dd4bf'] },
        { id: '36', icon: WeekendIcon, label: CategoryLabel.Furniture, gradientColors: ['#65a30d', '#a3e635'] },
        { id: '37', icon: BuildIcon, label: CategoryLabel.Maintenance, gradientColors: ['#16a34a', '#4ade80'] },
        { id: '38', icon: LocalShippingIcon, label: CategoryLabel.Shipping, gradientColors: ['#0369a1', '#0ea5e9'] },
        { id: '39', icon: WifiIcon, label: CategoryLabel.Internet, gradientColors: ['#facc15', '#fde047'] },
        { id: '40', icon: LightbulbIcon, label: CategoryLabel.Utilities, gradientColors: ['#22d3ee', '#67e8f9'] },
        { id: '41', icon: EmojiObjectsIcon, label: CategoryLabel.Idea, gradientColors: ['#8b5cf6', '#a78bfa'] },
        { id: '42', icon: TrendingUpIcon, label: CategoryLabel.Investment, gradientColors: ['#059669', '#10b981'] },
        { id: '43', icon: BusinessIcon, label: CategoryLabel.Company, gradientColors: ['#f97316', '#f59e0b'] },
        { id: '44', icon: WorkspacesIcon, label: CategoryLabel.Project, gradientColors: ['#3b82f6', '#60a5fa'] },
        { id: '45', icon: PeopleAltIcon, label: CategoryLabel.Team, gradientColors: ['#ec4899', '#f472b6'] },
        { id: '46', icon: StorefrontIcon, label: CategoryLabel.Retail, gradientColors: ['#f43f5e', '#fb7185'] },
        { id: '47', icon: PaletteIcon, label: CategoryLabel.Art, gradientColors: ['#78716c', '#a8a29e'] },
        { id: '48', icon: CameraAltIcon, label: CategoryLabel.Photography, gradientColors: ['#6366f1', '#818cf8'] },
        { id: '49', icon: BookIcon, label: CategoryLabel.Reading, gradientColors: ['#84cc16', '#a3e635'] },
        { id: '50', icon: DiamondIcon, label: CategoryLabel.Luxury, gradientColors: ['#06b6d4', '#22d3ee'] },
        { id: '51', icon: PublicIcon, label: CategoryLabel.World, gradientColors: ['#14b8a6', '#2dd4bf'] },
        { id: '52', icon: LandscapeIcon, label: CategoryLabel.Nature, gradientColors: ['#10b981', '#34d399'] },
        { id: '53', icon: MailIcon, label: CategoryLabel.Subscription, gradientColors: ['#f43f5e', '#fb7185'] },
        { id: '54', icon: VpnKeyIcon, label: CategoryLabel.Insurance, gradientColors: ['#d946ef', '#e879f9'] },
        { id: '55', icon: MicIcon, label: CategoryLabel.Podcast, gradientColors: ['#06b6d4', '#22d3ee'] },
        { id: '56', icon: WatchIcon, label: CategoryLabel.Gadget, gradientColors: ['#64748b', '#94a3b8'] },
        { id: '57', icon: VolunteerActivismIcon, label: CategoryLabel.Donation, gradientColors: ['#ef4444', '#f87171'] },
        { id: '58', icon: SecurityIcon, label: CategoryLabel.Security, gradientColors: ['#0f172a', '#1e293b'] },
        { id: '59', icon: FitnessCenterIcon, label: CategoryLabel.Gym, gradientColors: ['#7c3aed', '#a855f7'] },
        { id: '60', icon: ArrowCircleUpIcon, label: CategoryLabel.Refund, gradientColors: ['#4ade80', '#86efac'] },
    ],
    [IconKey.none]: [],
};

// =====================================================================
// 5. HELPER FINAL (Tipos corregidos)
// =====================================================================

export const transactions_icons: Record<CategoryLabel, { icon: React.ComponentType<IconProps>; color: string }> =
    ICON_OPTIONS.income.concat(ICON_OPTIONS.expense, ICON_OPTIONS.others).reduce((acc, curr) => {
        acc[curr.label] = { icon: curr.icon, color: curr.gradientColors[0] };
        return acc;
    }, {} as Record<CategoryLabel, { icon: React.ComponentType<IconProps>; color: string }>);