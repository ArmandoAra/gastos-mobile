import { View,Text } from "react-native";
import { styles } from "../styles";




interface InsightCardProps {
    label: string;
    title: string;
    value: string;
    color: string;
    isSmallScreen: boolean;
    amountColor?: string;
}

export const InsightCard = ({ label, title, value, color, isSmallScreen, amountColor }: InsightCardProps) => (
    <View style={[
        styles.insightCard,
        { backgroundColor: color + '15', borderColor: color + '30' }
    ]}>
        <Text style={[styles.insightLabel, { color }, isSmallScreen && styles.insightLabelSmall]}>
            {label}
        </Text>
        <Text style={[styles.insightTitle, isSmallScreen && styles.insightTitleSmall, { color }]} numberOfLines={1}>
            {title}
        </Text>
        <Text style={[styles.insightValue, isSmallScreen && styles.insightValueSmall, { color: amountColor }]}>{value}</Text>
    </View>
);