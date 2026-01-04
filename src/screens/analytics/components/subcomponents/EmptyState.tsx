import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import { styles, isSmallScreen } from "../styles";



export const EmptyState = ({ period, color }: { period: string, color: string }) => (
    <View style={styles.emptyState}>
        <Ionicons name="moon" size={isSmallScreen ? 40 : 48} color={color} style={{ opacity: 0.5 }} />
        <Text style={[styles.emptyTitle, isSmallScreen && styles.emptyTitleSmall, { color }]}>
            No transactions this {period.toLowerCase()}
        </Text>
        <Text style={[styles.emptySub, isSmallScreen && styles.emptySubSmall, { color }]}>
            {period === 'Day' ? 'Enjoy your rest day! 😊' : 'Time to add some transactions'}
        </Text>
    </View>
);