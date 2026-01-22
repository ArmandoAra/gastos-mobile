import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { CategoryLabel } from '../api/interfaces';
import { COLOR_PICKER_PALETTE } from './categories';

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
export const SummarizeIcon = createIcon('summarize');
export const AnalyticsIcon = createIcon('analytics');
export const SettingsIcon = createIcon('settings');
export const BudgetIcon = createIcon('account-balance-wallet');

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

export enum IconKey {
    spend = "expense",
    income = "income",
}


export interface IconOption {
    id: string;
    icon: React.ComponentType<IconProps>;
    label: CategoryLabel;
    color: string;
}

export interface IconsOptions {
    income: IconOption[];
    expense: IconOption[];
    others: IconOption[];
    none: IconOption[];
}

export const ICON_OPTIONS: IconOption[] = [
    { id: '1', icon: WorkIcon, label: CategoryLabel.Salary, color: COLOR_PICKER_PALETTE[0], },
    { id: '2', icon: AttachMoneyIcon, label: CategoryLabel.Extra, color: COLOR_PICKER_PALETTE[1], },
    { id: '3', icon: AccountBalanceIcon, label: CategoryLabel.Dividends, color: COLOR_PICKER_PALETTE[2], },
    { id: '4', icon: HomeWorkIcon, label: CategoryLabel.Rentals, color: COLOR_PICKER_PALETTE[3] },
    { id: '5', icon: LocalOfferIcon, label: CategoryLabel.Sales, color: COLOR_PICKER_PALETTE[4] },
    { id: '6', icon: RedeemIcon, label: CategoryLabel.Gifts, color: COLOR_PICKER_PALETTE[5] },
    { id: '7', icon: ArrowUpwardIcon, label: CategoryLabel.Gains, color: COLOR_PICKER_PALETTE[6] },
    { id: '8', icon: PeopleIcon, label: CategoryLabel.Clients, color: COLOR_PICKER_PALETTE[7] },
    { id: '9', icon: ReceiptLongIcon, label: CategoryLabel.Returns, color: COLOR_PICKER_PALETTE[8] },
    { id: '10', icon: SchoolIcon, label: CategoryLabel.Scholarships, color: COLOR_PICKER_PALETTE[9] },
    { id: '11', icon: SavingsIcon, label: CategoryLabel.Interest, color: COLOR_PICKER_PALETTE[10] },
    { id: '12', icon: AddCircleIcon, label: CategoryLabel.OtherIncome, color: COLOR_PICKER_PALETTE[11] },
    { id: '13', icon: RestaurantIcon, label: CategoryLabel.Food, color: COLOR_PICKER_PALETTE[12] },
    { id: '14', icon: LocalGroceryStoreIcon, label: CategoryLabel.Groceries, color: COLOR_PICKER_PALETTE[13] },
    { id: '15', icon: DirectionsCarIcon, label: CategoryLabel.Transport, color: COLOR_PICKER_PALETTE[14] },
    { id: '16', icon: HomeIcon, label: CategoryLabel.Home, color: COLOR_PICKER_PALETTE[15] },
    { id: '17', icon: LocalHospitalIcon, label: CategoryLabel.Health, color: COLOR_PICKER_PALETTE[16] },
    { id: '18', icon: SchoolIcon, label: CategoryLabel.Education, color: COLOR_PICKER_PALETTE[17] },
    { id: '19', icon: SportsEsportsIcon, label: CategoryLabel.Gaming, color: COLOR_PICKER_PALETTE[18] },
    { id: '20', icon: FlightIcon, label: CategoryLabel.Travel, color: COLOR_PICKER_PALETTE[19] },
    { id: '21', icon: ShoppingBagIcon, label: CategoryLabel.Shopping, color: COLOR_PICKER_PALETTE[20] },
    { id: '22', icon: FitnessCenterIcon, label: CategoryLabel.Fitness, color: COLOR_PICKER_PALETTE[21] },
    { id: '23', icon: LocalCafeIcon, label: CategoryLabel.Coffee, color: COLOR_PICKER_PALETTE[22] },
    { id: '24', icon: PetsIcon, label: CategoryLabel.Pets, color: COLOR_PICKER_PALETTE[23] },
    { id: '25', icon: PhoneAndroidIcon, label: CategoryLabel.Tech, color: COLOR_PICKER_PALETTE[24] },
    { id: '26', icon: MovieIcon, label: CategoryLabel.Entertainment, color: COLOR_PICKER_PALETTE[25] },
    { id: '27', icon: MusicNoteIcon, label: CategoryLabel.Music, color: COLOR_PICKER_PALETTE[26] },
    { id: '28', icon: MoreHorizIcon, label: CategoryLabel.Other, color: COLOR_PICKER_PALETTE[27] },
    { id: '29', icon: ShowChartIcon, label: CategoryLabel.Chart, color: COLOR_PICKER_PALETTE[28] },
    { id: '30', icon: SavingsIcon, label: CategoryLabel.SavingsGoal, color: COLOR_PICKER_PALETTE[29] },
    { id: '31', icon: CurrencyExchangeIcon, label: CategoryLabel.Exchange, color: COLOR_PICKER_PALETTE[30] },
    { id: '32', icon: CreditCardIcon, label: CategoryLabel.CreditCard, color: COLOR_PICKER_PALETTE[31] },
    { id: '33', icon: AttachMoneyIcon, label: CategoryLabel.Currency, color: COLOR_PICKER_PALETTE[32] },
    { id: '34', icon: PaymentsIcon, label: CategoryLabel.Payments, color: COLOR_PICKER_PALETTE[33] },
    { id: '35', icon: LocalAtmIcon, label: CategoryLabel.ATM, color: COLOR_PICKER_PALETTE[34] },
    { id: '36', icon: WeekendIcon, label: CategoryLabel.Furniture, color: COLOR_PICKER_PALETTE[35] },
    { id: '37', icon: BuildIcon, label: CategoryLabel.Maintenance, color: COLOR_PICKER_PALETTE[36] },
    { id: '38', icon: LocalShippingIcon, label: CategoryLabel.Shipping, color: COLOR_PICKER_PALETTE[37] },
    { id: '39', icon: WifiIcon, label: CategoryLabel.Internet, color: COLOR_PICKER_PALETTE[38] },
    { id: '40', icon: LightbulbIcon, label: CategoryLabel.Utilities, color: COLOR_PICKER_PALETTE[39] },
    { id: '41', icon: EmojiObjectsIcon, label: CategoryLabel.Idea, color: COLOR_PICKER_PALETTE[40] },
    { id: '42', icon: TrendingUpIcon, label: CategoryLabel.Investment, color: COLOR_PICKER_PALETTE[41] },
    { id: '43', icon: BusinessIcon, label: CategoryLabel.Company, color: COLOR_PICKER_PALETTE[42] },
    { id: '44', icon: WorkspacesIcon, label: CategoryLabel.Project, color: COLOR_PICKER_PALETTE[43] },
    { id: '45', icon: PeopleAltIcon, label: CategoryLabel.Team, color: COLOR_PICKER_PALETTE[44] },
    { id: '46', icon: StorefrontIcon, label: CategoryLabel.Retail, color: COLOR_PICKER_PALETTE[45] },
    { id: '47', icon: PaletteIcon, label: CategoryLabel.Art, color: COLOR_PICKER_PALETTE[46] },
    { id: '48', icon: CameraAltIcon, label: CategoryLabel.Photography, color: COLOR_PICKER_PALETTE[47] },
    { id: '49', icon: BookIcon, label: CategoryLabel.Reading, color: COLOR_PICKER_PALETTE[48] },
    { id: '50', icon: DiamondIcon, label: CategoryLabel.Luxury, color: COLOR_PICKER_PALETTE[49] },
    { id: '51', icon: PublicIcon, label: CategoryLabel.World, color: COLOR_PICKER_PALETTE[50] },
    { id: '52', icon: LandscapeIcon, label: CategoryLabel.Nature, color: COLOR_PICKER_PALETTE[51] },
    { id: '53', icon: MailIcon, label: CategoryLabel.Subscription, color: COLOR_PICKER_PALETTE[52] },
    { id: '54', icon: VpnKeyIcon, label: CategoryLabel.Insurance, color: COLOR_PICKER_PALETTE[53] },
    { id: '55', icon: MicIcon, label: CategoryLabel.Podcast, color: COLOR_PICKER_PALETTE[54] },
    { id: '56', icon: WatchIcon, label: CategoryLabel.Gadget, color: COLOR_PICKER_PALETTE[55] },
    { id: '57', icon: VolunteerActivismIcon, label: CategoryLabel.Donation, color: COLOR_PICKER_PALETTE[56] },
    { id: '58', icon: SecurityIcon, label: CategoryLabel.Security, color: COLOR_PICKER_PALETTE[57] },
    { id: '59', icon: FitnessCenterIcon, label: CategoryLabel.Gym, color: COLOR_PICKER_PALETTE[58] },
    { id: '60', icon: ArrowCircleUpIcon, label: CategoryLabel.Refund, color: COLOR_PICKER_PALETTE[59] },
]
