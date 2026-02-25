import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { COLOR_PICKER_PALETTE } from './categories';
import { Image } from 'expo-image';
import { CategoryLabel } from '../interfaces/categories.interface';
import { Star } from 'lucide-react';
import { create } from 'zustand';


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

const createIconPainted = (source: string) => (props: IconProps) => (
    <Image
        source={source}
        style={[{ width: props.size || 44, height: props.size || 44 }, props.style]}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={200}
    />
);

// Iconos para la barra inferior (usando emojis en App.tsx)
export const SummarizeIcon = createIcon('summarize');
export const SummarizeIconPainted = createIconPainted(require('../../assets/icons/custom/lista.webp'));

export const AnalyticsIcon = createIcon('analytics');
export const AnalyticsIconPainted = createIconPainted(require('../../assets/icons/custom/chart.webp'));

export const SettingsIcon = createIcon('settings');
export const SettingsIconPainted = createIconPainted(require('../../assets/icons/custom/configuracion.webp'));

// Icons de ciclo de crédito (usados en CreditCycleScreen)
export const CreditCircleIcon = createIcon('credit-score');
export const CreditCircleIconPainted = createIconPainted(require('../../assets/icons/cycle/cycle.webp'));

export const BudgetIcon = createIcon('account-balance-wallet');
export const BudgetIconPainted = createIconPainted(require('../../assets/icons/custom/cartera.webp'));

// =====================================================================
// 2. DEFINICIÓN DE TODOS LOS COMPONENTES DE ICONOS
// =====================================================================
// --- Income ---
export const WorkIcon = createIcon('work');
export const WorkIconPainted = createIconPainted(require('../../assets/icons/custom/salario.webp'));

const AttachMoneyIcon = createIcon('attach-money');
const AttachMoneyIconPainted = createIconPainted(require('../../assets/icons/custom/moneda.webp'));

const AccountBalanceIcon = createIcon('account-balance');
const AccountBalanceIconPainted = createIconPainted(require('../../assets/icons/custom/dividendos.webp'));

const RentalsIcon = createIcon('home-work');
const RentalsIconPainted = createIconPainted(require('../../assets/icons/custom/alquiler.webp'));

const LocalOfferIcon = createIcon('local-offer');
const LocalOfferIconPainted = createIconPainted(require('../../assets/icons/custom/ventas.webp'));

const RedeemIcon = createIcon('redeem');
const RedeemIconPainted = createIconPainted(require('../../assets/icons/custom/regalos.webp'));

const ArrowUpwardIcon = createIcon('arrow-upward');
const ArrowUpwardIconPainted = createIconPainted(require('../../assets/icons/custom/ganancias.webp'));

const PeopleIcon = createIcon('people');
const PeopleIconPainted = createIconPainted(require('../../assets/icons/custom/clientes.webp'));

const ReceiptLongIcon = createIcon('receipt-long');
const ReceiptLongIconPainted = createIconPainted(require('../../assets/icons/custom/retorno.webp'));

const SchoolIcon = createIcon('school');
const SchoolIconPainted = createIconPainted(require('../../assets/icons/custom/educacion.webp'));

const ScholarshipIcon = createIcon('school');
const ScholarshipIconPainted = createIconPainted(require('../../assets/icons/custom/becas.webp'));

export const SavingsIcon = createIcon('savings');
export const SavingsIconPainted = createIconPainted(require('../../assets/icons/custom/metas.webp'));

// const AddCircleIcon = createIcon('add-circle');


// --- Spend ---
const RestaurantIcon = createIcon('restaurant');
const RestaurantIconPainted = createIconPainted(require('../../assets/icons/custom/comida.webp'));

const LocalGroceryStoreIcon = createIcon('local-grocery-store');
const LocalGroceryStoreIconPainted = createIconPainted(require('../../assets/icons/custom/compras.webp'));

const DirectionsCarIcon = createIcon('directions-car');
const DirectionsCarIconPainted = createIconPainted(require('../../assets/icons/custom/transporte.webp'));

const HomeIcon = createIcon('home');
const HomeIconPainted = createIconPainted(require('../../assets/icons/custom/casa.webp'));

const LocalHospitalIcon = createIcon('local-hospital');
const LocalHospitalIconPainted = createIconPainted(require('../../assets/icons/custom/salud.webp'));

const SportsEsportsIcon = createIcon('sports-esports');
const SportsEsportsIconPainted = createIconPainted(require('../../assets/icons/custom/gaming.webp'));

const FlightIcon = createIcon('flight');
const FlightIconPainted = createIconPainted(require('../../assets/icons/custom/viajes.webp'));

const ShoppingBagIcon = createIcon('shopping-bag');
const ShoppingBagIconPainted = createIconPainted(require('../../assets/icons/custom/supermercado.webp'));

const FitnessCenterIcon = createIcon('fitness-center');
const FitnessCenterIconPainted = createIconPainted(require('../../assets/icons/custom/fitness.webp'));

const LocalCafeIcon = createIcon('local-cafe');
const LocalCafeIconPainted = createIconPainted(require('../../assets/icons/custom/cafe.webp'));

const PetsIcon = createIcon('pets');
const PetsIconPainted = createIconPainted(require('../../assets/icons/custom/mascotas.webp'));

const PhoneAndroidIcon = createIcon('phone-android');
const PhoneAndroidIconPainted = createIconPainted(require('../../assets/icons/custom/tecnologia.webp'));

const MovieIcon = createIcon('movie');
const MovieIconPainted = createIconPainted(require('../../assets/icons/custom/entretenimiento.webp'));

const MusicNoteIcon = createIcon('music-note');
const MusicNoteIconPainted = createIconPainted(require('../../assets/icons/custom/musica.webp'));


// --- Others (Faltaban definir estos wrappers) ---
const ShowChartIcon = createIcon('show-chart');
const ShowChartIconPainted = createIconPainted(require('../../assets/icons/custom/pie_chart.webp'));

const CurrencyExchangeIcon = createIcon('currency-exchange');
const CurrencyExchangeIconPainted = createIconPainted(require('../../assets/icons/custom/divisa.webp'));

const CreditCardIcon = createIcon('credit-card');
const CreditCardIconPainted = createIconPainted(require('../../assets/icons/custom/tarjeta.webp'));

const PaymentsIcon = createIcon('payments');
const PaymentsIconPainted = createIconPainted(require('../../assets/icons/custom/pagos.webp'));

const LocalAtmIcon = createIcon('local-atm');
const LocalAtmIconPainted = createIconPainted(require('../../assets/icons/custom/atm.webp'));

const WeekendIcon = createIcon('weekend');
const WeekendIconPainted = createIconPainted(require('../../assets/icons/custom/muebles.webp'));

const BuildIcon = createIcon('build');
const BuildIconPainted = createIconPainted(require('../../assets/icons/custom/mantenimiento.webp'));

const LocalShippingIcon = createIcon('local-shipping');
const LocalShippingIconPainted = createIconPainted(require('../../assets/icons/custom/envios.webp'));

const WifiIcon = createIcon('wifi');
const WifiIconPainted = createIconPainted(require('../../assets/icons/custom/internet.webp'));

const LightbulbIcon = createIcon('lightbulb');
const LightbulbIconPainted = createIconPainted(require('../../assets/icons/custom/servicios.webp'));

const EmojiObjectsIcon = createIcon('emoji-objects');
const EmojiObjectsIconPainted = createIconPainted(require('../../assets/icons/custom/idea.webp'));

const TrendingUpIcon = createIcon('trending-up');
const TrendingUpIconPainted = createIconPainted(require('../../assets/icons/custom/inversion.webp'));

const BusinessIcon = createIcon('business');
const BusinessIconPainted = createIconPainted(require('../../assets/icons/custom/company.webp'));

const WorkspacesIcon = createIcon('workspaces');
const WorkspacesIconPainted = createIconPainted(require('../../assets/icons/custom/project.webp'));

const PeopleAltIcon = createIcon('people-alt');
const PeopleAltIconPainted = createIconPainted(require('../../assets/icons/custom/equipo.webp'));

const StorefrontIcon = createIcon('storefront');
const StorefrontIconPainted = createIconPainted(require('../../assets/icons/custom/comercio.webp'));

const PaletteIcon = createIcon('palette');
const PaletteIconPainted = createIconPainted(require('../../assets/icons/custom/arte.webp'));

const CameraAltIcon = createIcon('camera-alt');
const CameraAltIconPainted = createIconPainted(require('../../assets/icons/custom/fotografia.webp'));

const BookIcon = createIcon('book');
const BookIconPainted = createIconPainted(require('../../assets/icons/custom/libros.webp'));

const DiamondIcon = createIcon('diamond');
const DiamondIconPainted = createIconPainted(require('../../assets/icons/custom/lujo.webp'));

const PublicIcon = createIcon('public');
const PublicIconPainted = createIconPainted(require('../../assets/icons/custom/mundo.webp'));

const LandscapeIcon = createIcon('landscape');
const LandscapeIconPainted = createIconPainted(require('../../assets/icons/custom/naturaleza.webp'));

const MailIcon = createIcon('mail');
const MailIconPainted = createIconPainted(require('../../assets/icons/custom/suscripciones.webp'));

const InsuranceIcon = createIcon('vpn-key');
const InsuranceIconPainted = createIconPainted(require('../../assets/icons/custom/aseguracion.webp'));

const MicIcon = createIcon('mic');
const MicIconPainted = createIconPainted(require('../../assets/icons/custom/podcast.webp'));

const WatchIcon = createIcon('watch');
const WatchIconPainted = createIconPainted(require('../../assets/icons/custom/gadget.webp'));

const VolunteerActivismIcon = createIcon('volunteer-activism');
const VolunteerActivismIconPainted = createIconPainted(require('../../assets/icons/custom/donaciones.webp'));

const SecurityIcon = createIcon('security');
const SecurityIconPainted = createIconPainted(require('../../assets/icons/custom/seguridad.webp'));

const IncomesIcon = createIcon('arrow-circle-up');
const IncomesIconPainted = createIconPainted(require('../../assets/icons/custom/incomes.webp'));

const MoreHorizIcon = createIcon('more-horiz');
const MoreHorizIconPainted = createIconPainted(require('../../assets/icons/custom/otros.webp'));


// Iconos que tengo que agregar normales
const BebeIcon = createIcon('baby-changing-station');
const BebeIconPainted = createIconPainted(require('../../assets/icons/custom/bebe.webp'));

const BellezaIcon = createIcon('face-retouching-natural');
const BellezaIconPainted = createIconPainted(require('../../assets/icons/custom/belleza.webp'));

const PeluqueriaIcon = createIcon('content-cut');
const PeluqueriaIconPainted = createIconPainted(require('../../assets/icons/custom/peluqueria.webp'));

const ClothesIcon = createIcon('checkroom');
const ClothesIconPainted = createIconPainted(require('../../assets/icons/custom/ropa.webp'));

const LostIcon = createIcon('money-off');
const LostIconPainted = createIconPainted(require('../../assets/icons/custom/perdidas.webp'));

const OtherIncomesIcon = createIcon('more-horiz');
const OtherIncomesIconPainted = createIconPainted(require('../../assets/icons/custom/OtherIncomes.webp'));

// Others
export const TriStarsIcon = createIconPainted(require('../../assets/icons/cycle/1.webp'));
export const RedStar = createIconPainted(require('../../assets/icons/cycle/red_star.webp'));
export const BlueStar = createIconPainted(require('../../assets/icons/cycle/blue_star.webp'));
export const YellowStar = createIconPainted(require('../../assets/icons/cycle/yellow_star.webp'));

export const StarIcon = createIcon('star');


// =====================================================================
// 3. Creacion de iconos dibujados
// =====================================================================


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

const ICON_MATERIAL_OPTIONS: IconOption[] = [
    { id: '1', icon: WorkIcon, label: CategoryLabel.Salary, color: COLOR_PICKER_PALETTE[0], },
    { id: '2', icon: AttachMoneyIcon, label: CategoryLabel.Extra, color: COLOR_PICKER_PALETTE[1], },
    { id: '3', icon: AccountBalanceIcon, label: CategoryLabel.Dividends, color: COLOR_PICKER_PALETTE[2], },
    { id: '4', icon: RentalsIcon, label: CategoryLabel.Rentals, color: COLOR_PICKER_PALETTE[3] },
    { id: '5', icon: LocalOfferIcon, label: CategoryLabel.Sales, color: COLOR_PICKER_PALETTE[4] },
    { id: '6', icon: RedeemIcon, label: CategoryLabel.Gifts, color: COLOR_PICKER_PALETTE[5] },
    { id: '7', icon: ArrowUpwardIcon, label: CategoryLabel.Gains, color: COLOR_PICKER_PALETTE[6] },
    { id: '8', icon: PeopleIcon, label: CategoryLabel.Clients, color: COLOR_PICKER_PALETTE[7] },
    { id: '9', icon: ReceiptLongIcon, label: CategoryLabel.Returns, color: COLOR_PICKER_PALETTE[8] },
    { id: '10', icon: ScholarshipIcon, label: CategoryLabel.Scholarships, color: COLOR_PICKER_PALETTE[9] },
    { id: '11', icon: SavingsIcon, label: CategoryLabel.Interest, color: COLOR_PICKER_PALETTE[10] },
    { id: '12', icon: ClothesIcon, label: CategoryLabel.Clothes, color: COLOR_PICKER_PALETTE[11] },
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
    { id: '54', icon: InsuranceIcon, label: CategoryLabel.Insurance, color: COLOR_PICKER_PALETTE[53] },
    { id: '55', icon: MicIcon, label: CategoryLabel.Podcast, color: COLOR_PICKER_PALETTE[54] },
    { id: '56', icon: WatchIcon, label: CategoryLabel.Gadget, color: COLOR_PICKER_PALETTE[55] },
    { id: '57', icon: VolunteerActivismIcon, label: CategoryLabel.Donation, color: COLOR_PICKER_PALETTE[56] },
    { id: '58', icon: SecurityIcon, label: CategoryLabel.Security, color: COLOR_PICKER_PALETTE[57] },
    { id: '59', icon: FitnessCenterIcon, label: CategoryLabel.Gym, color: COLOR_PICKER_PALETTE[58] },
    { id: '60', icon: IncomesIcon, label: CategoryLabel.Refund, color: COLOR_PICKER_PALETTE[59] },
    { id: '61', icon: LostIcon, label: CategoryLabel.Lost, color: COLOR_PICKER_PALETTE[54] },
    { id: '62', icon: BebeIcon, label: CategoryLabel.Baby, color: COLOR_PICKER_PALETTE[34] },
    { id: '63', icon: BellezaIcon, label: CategoryLabel.Beauty, color: COLOR_PICKER_PALETTE[23] },
    { id: '64', icon: PeluqueriaIcon, label: CategoryLabel.Haircut, color: COLOR_PICKER_PALETTE[14] },
    { id: '65', icon: OtherIncomesIcon, label: CategoryLabel.OtherIncome, color: COLOR_PICKER_PALETTE[11] },
]


const ICON_PAINTED_OPTIONS: IconOption[] = [
    { id: '1', icon: WorkIconPainted, label: CategoryLabel.Salary, color: COLOR_PICKER_PALETTE[0], },
    { id: '2', icon: AttachMoneyIconPainted, label: CategoryLabel.Extra, color: COLOR_PICKER_PALETTE[1], },
    { id: '3', icon: AccountBalanceIconPainted, label: CategoryLabel.Dividends, color: COLOR_PICKER_PALETTE[2], },
    { id: '4', icon: RentalsIconPainted, label: CategoryLabel.Rentals, color: COLOR_PICKER_PALETTE[3] },
    { id: '5', icon: LocalOfferIconPainted, label: CategoryLabel.Sales, color: COLOR_PICKER_PALETTE[4] },
    { id: '6', icon: RedeemIconPainted, label: CategoryLabel.Gifts, color: COLOR_PICKER_PALETTE[5] },
    { id: '7', icon: ArrowUpwardIconPainted, label: CategoryLabel.Gains, color: COLOR_PICKER_PALETTE[6] },
    { id: '8', icon: PeopleIconPainted, label: CategoryLabel.Clients, color: COLOR_PICKER_PALETTE[7] },
    { id: '9', icon: ReceiptLongIconPainted, label: CategoryLabel.Returns, color: COLOR_PICKER_PALETTE[8] },
    { id: '10', icon: ScholarshipIconPainted, label: CategoryLabel.Scholarships, color: COLOR_PICKER_PALETTE[9] },
    { id: '11', icon: SavingsIconPainted, label: CategoryLabel.Interest, color: COLOR_PICKER_PALETTE[10] },
    { id: '12', icon: ClothesIconPainted, label: CategoryLabel.Clothes, color: COLOR_PICKER_PALETTE[11] },
    { id: '13', icon: RestaurantIconPainted, label: CategoryLabel.Food, color: COLOR_PICKER_PALETTE[12] },
    { id: '14', icon: LocalGroceryStoreIconPainted, label: CategoryLabel.Groceries, color: COLOR_PICKER_PALETTE[13] },
    { id: '15', icon: DirectionsCarIconPainted, label: CategoryLabel.Transport, color: COLOR_PICKER_PALETTE[14] },
    { id: '16', icon: HomeIconPainted, label: CategoryLabel.Home, color: COLOR_PICKER_PALETTE[15] },
    { id: '17', icon: LocalHospitalIconPainted, label: CategoryLabel.Health, color: COLOR_PICKER_PALETTE[16] },
    { id: '18', icon: SchoolIconPainted, label: CategoryLabel.Education, color: COLOR_PICKER_PALETTE[17] },
    { id: '19', icon: SportsEsportsIconPainted, label: CategoryLabel.Gaming, color: COLOR_PICKER_PALETTE[18] },
    { id: '20', icon: FlightIconPainted, label: CategoryLabel.Travel, color: COLOR_PICKER_PALETTE[19] },
    { id: '21', icon: ShoppingBagIconPainted, label: CategoryLabel.Shopping, color: COLOR_PICKER_PALETTE[20] },
    { id: '22', icon: FitnessCenterIconPainted, label: CategoryLabel.Fitness, color: COLOR_PICKER_PALETTE[21] },
    { id: '23', icon: LocalCafeIconPainted, label: CategoryLabel.Coffee, color: COLOR_PICKER_PALETTE[22] },
    { id: '24', icon: PetsIconPainted, label: CategoryLabel.Pets, color: COLOR_PICKER_PALETTE[23] },
    { id: '25', icon: PhoneAndroidIconPainted, label: CategoryLabel.Tech, color: COLOR_PICKER_PALETTE[24] },
    { id: '26', icon: MovieIconPainted, label: CategoryLabel.Entertainment, color: COLOR_PICKER_PALETTE[25] },
    { id: '27', icon: MusicNoteIconPainted, label: CategoryLabel.Music, color: COLOR_PICKER_PALETTE[26] },
    { id: '28', icon: MoreHorizIconPainted, label: CategoryLabel.Other, color: COLOR_PICKER_PALETTE[27] },
    { id: '29', icon: ShowChartIconPainted, label: CategoryLabel.Chart, color: COLOR_PICKER_PALETTE[28] },
    { id: '30', icon: SavingsIconPainted, label: CategoryLabel.SavingsGoal, color: COLOR_PICKER_PALETTE[29] },
    { id: '31', icon: CurrencyExchangeIconPainted, label: CategoryLabel.Exchange, color: COLOR_PICKER_PALETTE[30] },
    { id: '32', icon: CreditCardIconPainted, label: CategoryLabel.CreditCard, color: COLOR_PICKER_PALETTE[31] },
    { id: '33', icon: AttachMoneyIconPainted, label: CategoryLabel.Currency, color: COLOR_PICKER_PALETTE[32] },
    { id: '34', icon: PaymentsIconPainted, label: CategoryLabel.Payments, color: COLOR_PICKER_PALETTE[33] },
    { id: '35', icon: LocalAtmIconPainted, label: CategoryLabel.ATM, color: COLOR_PICKER_PALETTE[34] },
    { id: '36', icon: WeekendIconPainted, label: CategoryLabel.Furniture, color: COLOR_PICKER_PALETTE[35] },
    { id: '37', icon: BuildIconPainted, label: CategoryLabel.Maintenance, color: COLOR_PICKER_PALETTE[36] },
    { id: '38', icon: LocalShippingIconPainted, label: CategoryLabel.Shipping, color: COLOR_PICKER_PALETTE[37] },
    { id: '39', icon: WifiIconPainted, label: CategoryLabel.Internet, color: COLOR_PICKER_PALETTE[38] },
    { id: '40', icon: LightbulbIconPainted, label: CategoryLabel.Utilities, color: COLOR_PICKER_PALETTE[39] },
    { id: '41', icon: EmojiObjectsIconPainted, label: CategoryLabel.Idea, color: COLOR_PICKER_PALETTE[40] },
    { id: '42', icon: TrendingUpIconPainted, label: CategoryLabel.Investment, color: COLOR_PICKER_PALETTE[41] },
    { id: '43', icon: BusinessIconPainted, label: CategoryLabel.Company, color: COLOR_PICKER_PALETTE[42] },
    { id: '44', icon: WorkspacesIconPainted, label: CategoryLabel.Project, color: COLOR_PICKER_PALETTE[43] },
    { id: '45', icon: PeopleAltIconPainted, label: CategoryLabel.Team, color: COLOR_PICKER_PALETTE[44] },
    { id: '46', icon: StorefrontIconPainted, label: CategoryLabel.Retail, color: COLOR_PICKER_PALETTE[45] },
    { id: '47', icon: PaletteIconPainted, label: CategoryLabel.Art, color: COLOR_PICKER_PALETTE[46] },
    { id: '48', icon: CameraAltIconPainted, label: CategoryLabel.Photography, color: COLOR_PICKER_PALETTE[47] },
    { id: '49', icon: BookIconPainted, label: CategoryLabel.Reading, color: COLOR_PICKER_PALETTE[48] },
    { id: '50', icon: DiamondIconPainted, label: CategoryLabel.Luxury, color: COLOR_PICKER_PALETTE[49] },
    { id: '51', icon: PublicIconPainted, label: CategoryLabel.World, color: COLOR_PICKER_PALETTE[50] },
    { id: '52', icon: LandscapeIconPainted, label: CategoryLabel.Nature, color: COLOR_PICKER_PALETTE[51] },
    { id: '53', icon: MailIconPainted, label: CategoryLabel.Subscription, color: COLOR_PICKER_PALETTE[52] },
    { id: '54', icon: InsuranceIconPainted, label: CategoryLabel.Insurance, color: COLOR_PICKER_PALETTE[53] },
    { id: '55', icon: MicIconPainted, label: CategoryLabel.Podcast, color: COLOR_PICKER_PALETTE[54] },
    { id: '56', icon: WatchIconPainted, label: CategoryLabel.Gadget, color: COLOR_PICKER_PALETTE[55] },
    { id: '57', icon: VolunteerActivismIconPainted, label: CategoryLabel.Donation, color: COLOR_PICKER_PALETTE[56] },
    { id: '58', icon: SecurityIconPainted, label: CategoryLabel.Security, color: COLOR_PICKER_PALETTE[57] },
    { id: '59', icon: FitnessCenterIconPainted, label: CategoryLabel.Gym, color: COLOR_PICKER_PALETTE[58] },
    { id: '60', icon: IncomesIconPainted, label: CategoryLabel.Refund, color: COLOR_PICKER_PALETTE[59] },
    { id: '61', icon: LostIconPainted, label: CategoryLabel.Lost, color: COLOR_PICKER_PALETTE[54] },
    { id: '62', icon: BebeIconPainted, label: CategoryLabel.Baby, color: COLOR_PICKER_PALETTE[34] },
    { id: '63', icon: BellezaIconPainted, label: CategoryLabel.Beauty, color: COLOR_PICKER_PALETTE[22] },
    { id: '64', icon: PeluqueriaIconPainted, label: CategoryLabel.Haircut, color: COLOR_PICKER_PALETTE[16] },
    { id: '65', icon: OtherIncomesIconPainted, label: CategoryLabel.OtherIncome, color: COLOR_PICKER_PALETTE[11] },
]


export const ICON_OPTIONS = {
    'material': ICON_MATERIAL_OPTIONS,
    'painted': ICON_PAINTED_OPTIONS,
}
