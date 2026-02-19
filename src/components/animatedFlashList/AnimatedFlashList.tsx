import { FlashList } from "@shopify/flash-list";
import Animated from "react-native-reanimated";
import { ListItem } from "../../interfaces/items.interface";
import { ExpenseBudget } from "../../interfaces/data.interface";

export const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<ListItem>);

export const AnimatedBudgetFlashList = Animated.createAnimatedComponent(FlashList<ExpenseBudget>);
