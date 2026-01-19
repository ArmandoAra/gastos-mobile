// ============================================
// EMPTY STATE COMPONENT

import { View, TouchableOpacity, Text } from "react-native";
import { StyleSheet } from "react-native";

// ============================================
interface EmptyStateProps {
    icon?: string;
    title: string;
    message?: string;
    actionText?: string;
    onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = '📭',
    title,
    message,
    actionText,
    onActionPress,
}) => {
    return (
        <View style={emptyStateStyles.container}>
            <Text style={emptyStateStyles.icon}>{icon}</Text>
            <Text style={emptyStateStyles.title}>{title}</Text>
            {message && <Text style={emptyStateStyles.message}>{message}</Text>}
            {actionText && onActionPress && (
                <TouchableOpacity style={emptyStateStyles.button} onPress={onActionPress}>
                    <Text style={emptyStateStyles.buttonText}>{actionText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const emptyStateStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    icon: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontFamily: 'Tinos-Bold',
        color: '#424242',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#6200EE',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'FiraSans-Bold',
    },
});
