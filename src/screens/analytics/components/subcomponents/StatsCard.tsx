import { Ionicons } from '@expo/vector-icons';
import { View,Text } from 'react-native';
import {styles, isSmallScreen } from '../styles';
import { formatCurrency } from '../../../../utils/helpers';

interface StatCardData {
    label: string;
    value: number;
    sub?: string;
    colorBgAndHeader: string;
    colorText: string;
    colorSubText: string;
    colorBorder: string;
    icon: keyof typeof Ionicons.glyphMap;
    isTablet: boolean;
    currentSymbol?: string;
}

export interface TopCategories {
    topCategory: {
        category: string;
        amount: number;
    };
}

interface StatCardProps {
    data: StatCardData;
}

export const StatCard = ({ data }: StatCardProps) => (
    <View style={[
        styles.statCard,
        { borderColor: data.colorBorder, backgroundColor: data.colorBgAndHeader + '15' },
        data.isTablet && styles.statCardTablet
    ]}>
        <View style={styles.statHeader}>
            <Ionicons name={data.icon} size={isSmallScreen ? 12 : 14} color={data.colorBgAndHeader} style={{ marginRight: 4 }} />
            <Text style={[styles.statLabel, { color: data.colorBgAndHeader + 'dd' }, isSmallScreen && styles.statLabelSmall]}>
                {data.label}
            </Text>
        </View>
        <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall, { color: data.colorText }]} numberOfLines={1}>

            {data.value < 0 ? '-' : '+'}{data.currentSymbol} {formatCurrency(Math.abs(data.value))}
        </Text>
        <Text style={[styles.statSub, isSmallScreen && styles.statSubSmall, { color: data.colorSubText }]}>{data.sub}</Text>
    </View>
);