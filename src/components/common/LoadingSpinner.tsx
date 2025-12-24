// ============================================
// LOADING SPINNER COMPONENT
// ============================================
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    color?: string;
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'large',
    color = '#6200EE',
    message,
}) => {
    return (
        <View style={loadingSpinnerStyles.container}>
            <ActivityIndicator size={size} color={color} />
            {message && <Text style={loadingSpinnerStyles.message}>{message}</Text>}
        </View>
    );
};

const loadingSpinnerStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    message: {
        marginTop: 16,
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
    },
});
