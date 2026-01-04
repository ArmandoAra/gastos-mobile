import { Ionicons } from '@expo/vector-icons';
import { View,Text } from 'react-native';
import {styles, isSmallScreen } from '../styles';

interface StatCardProps {
    label: string;
    value: string;
    sub?: string;
    colorBgAndHeader: string;
    colorText: string;
    colorSubText: string;
    colorBorder: string;
    icon: keyof typeof Ionicons.glyphMap;
    isTablet: boolean;
}

export const StatCard = ({ label, value, sub, colorBgAndHeader, colorText, colorSubText, colorBorder, icon, isTablet }: StatCardProps) => (
    <View style={[
        styles.statCard,
        { borderColor: colorBorder, backgroundColor: colorBgAndHeader + '15' },
        isTablet && styles.statCardTablet
    ]}>
        <View style={styles.statHeader}>
            <Ionicons name={icon} size={isSmallScreen ? 12 : 14} color={colorBgAndHeader} style={{ marginRight: 4 }} />
            <Text style={[styles.statLabel, { color: colorBgAndHeader + 'dd' }, isSmallScreen && styles.statLabelSmall]}>
                {label}
            </Text>
        </View>
        <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall, { color: colorText }]} numberOfLines={1}>
            {value}
        </Text>
        <Text style={[styles.statSub, isSmallScreen && styles.statSubSmall, { color: colorSubText }]}>{sub}</Text>
    </View>
);