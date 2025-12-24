// ============================================
// TRANSACTION CARD COMPONENT
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';



interface TransactionCardProps {
    id: string;
    description: string;
    amount: number;
    type: 'expense' | 'income';
    category: string;
    date: string;
    onPress?: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
    description,
    amount,
    type,
    category,
    date,
    onPress,
}) => {
    return (
        <TouchableOpacity style={transactionCardStyles.card} onPress={onPress}>
            <View style={transactionCardStyles.icon}>
                <Text style={transactionCardStyles.iconText}>
                    {type === 'expense' ? '💸' : '💰'}
                </Text>
            </View>
            <View style={transactionCardStyles.details}>
                <Text style={transactionCardStyles.description}>{description}</Text>
                <Text style={transactionCardStyles.category}>{category}</Text>
            </View>
            <View style={transactionCardStyles.right}>
                <Text
                    style={[
                        transactionCardStyles.amount,
                        { color: type === 'expense' ? '#EF5350' : '#4CAF50' },
                    ]}
                >
                    {type === 'expense' ? '-' : '+'}${amount.toLocaleString('es-AR')}
                </Text>
                <Text style={transactionCardStyles.date}>{date}</Text>
            </View>
        </TouchableOpacity>
    );
};

const transactionCardStyles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 20,
    },
    details: {
        flex: 1,
    },
    description: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    category: {
        fontSize: 12,
        color: '#757575',
    },
    right: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#757575',
    },
});