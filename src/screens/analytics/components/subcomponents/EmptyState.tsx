import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import { styles, isSmallScreen } from "../styles";
import { useTranslation } from "react-i18next";



export const EmptyState = ({ period, color }: { period: string, color: string }) => {
    const { t } = useTranslation();
    const periodKey = `transactions.this${period}`;
    return (
        <View style={styles.emptyState}>
            <Ionicons name="moon" size={isSmallScreen ? 40 : 48} color={color} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyTitle, isSmallScreen && styles.emptyTitleSmall, { color }]}>
                {t('transactions.noTransactions',)} {t(periodKey).toLowerCase()}
            </Text>
        <Text style={[styles.emptySub, isSmallScreen && styles.emptySubSmall, { color }]}>
                {period === 'Day' ? t('overviews.enjoyRestDay') : t('overviews.timeToAddTransactions')}
        </Text>
    </View>
);
}