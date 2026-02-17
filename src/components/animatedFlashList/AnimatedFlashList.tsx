import { FlashList } from "@shopify/flash-list";
import Animated from "react-native-reanimated";
import { ListItem } from "../../interfaces/items.interface";
import { ExpenseBudget } from "../../interfaces/data.interface";
import { ScrollView } from "react-native";



// Crea el componente animado (hazlo fuera de la función del componente)
export const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<ListItem>);

export const AnimatedBudgetFlashList = Animated.createAnimatedComponent(FlashList<ExpenseBudget>);
