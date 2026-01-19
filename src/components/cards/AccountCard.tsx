// ============================================
// ACCOUNT CARD COMPONENT
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface AccountCardProps {
    id: string;
    name: string;
    type: 'checking' | 'savings' | 'cash';
    balance: number;
    onPress?: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
    name,
    type,
    balance,
    onPress,
}) => {
    const getAccountIcon = (type: string) => {
        switch (type) {
            case 'checking': return '💳';
            case 'savings': return '🏦';
            case 'cash': return '💵';
            default: return '💰';
        }
    };

    return (
        <TouchableOpacity style={accountCardStyles.card} onPress={onPress}>
            <View style={accountCardStyles.icon}>
                <Text style={accountCardStyles.iconText}>{getAccountIcon(type)}</Text>
            </View>
            <Text style={accountCardStyles.name}>{name}</Text>
            <Text style={accountCardStyles.balance}>
                ${balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </Text>
        </TouchableOpacity>
    );
};

const accountCardStyles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginLeft: 16,
        width: 140,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3E5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconText: {
        fontSize: 24,
    },
    name: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 4,
    },
    balance: {
        fontSize: 18,
        fontFamily: 'FiraSans-Bold',
        color: '#000',
    },
});