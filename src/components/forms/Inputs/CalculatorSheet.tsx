import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeColors } from '../../../types/navigation';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics'; 

interface CalculatorSheetProps {
    colors: ThemeColors;
    value: string;
    onChange: (val: string) => void;
    onClose: () => void;
}

const BUTTONS = [
    ['C', '÷', '×', 'DEL'],
    ['7', '8', '9', '-'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '='],
    ['0', '.', 'DONE']
];

export default function CalculatorSheet({ colors, value, onChange, onClose }: CalculatorSheetProps) {
    const {t} = useTranslation();

    // Función auxiliar para el feedback táctil
    const triggerFeedback = () => {
        // ImpactFeedbackStyle.Light es sutil, ideal para teclados
        // Si quieres algo más fuerte usa Medium o Heavy
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handlePress = (key: string) => {
        triggerFeedback(); // <--- DISPARAR AQUÍ

        let current = value;

        switch (key) {
            case 'C':
                onChange('');
                break;
            case 'DEL':
                onChange(current.slice(0, -1));
                break;
            case 'DONE':
                calculate();
                onClose();
                break;
            case '=':
                calculate();
                break;
            case '×':
                onChange(current + '*');
                break;
            case '÷':
                onChange(current + '/');
                break;
            default:
                onChange(current + key);
                break;
        }
    };

    const calculate = () => {
        try {
            if (!value) return;
            // eslint-disable-next-line no-new-func
            const result = new Function('return ' + value)();
            const formatted = String(Math.round(result * 100) / 100); 
            onChange(formatted);
        } catch (e) {
            // Error handling
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surfaceSecondary }]}>
            {BUTTONS.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {row.map((btn) => {
                        const isOperator = ['÷', '×', '-', '+', '=', 'C', 'DEL'].includes(btn);
                        const isDone = btn === 'DONE';
                        
                        return (
                            <TouchableOpacity
                                key={btn}
                                onPress={() => handlePress(btn)}
                                style={[
                                    styles.button,
                                    isDone ? { flex: 2, backgroundColor: colors.primary, borderColor: colors.text } : { flex: 1 },
                                    isOperator && !isDone && { backgroundColor: colors.surface, borderColor: colors.text }, 
                                    !isOperator && !isDone && { backgroundColor: colors.text, borderColor: colors.text } 
                                ]}
                                accessibilityRole="button"
                                accessibilityLabel={btn === 'DEL' ? 'Delete' : btn}
                            >
                                {btn === 'DEL' ? (
                                    <MaterialIcons name="backspace" size={24} color={colors.text} />
                                ) : btn === 'DONE' ? (
                                    <Text style={[styles.text, { color: colors.text, fontWeight: 'bold' }]}>{t('common.done', 'Done')}</Text>
                                ) : (
                                    <Text style={[
                                        styles.text, 
                                        { color: isOperator  ? colors.text : colors.surface, fontSize: isOperator ? 24 : 22 }
                                    ]}>
                                                {btn === '.' ? "," : btn}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 350, 
        width: '100%',
        paddingHorizontal: 6,
        paddingVertical: 16,
        marginBottom: 30,// Espacio para el home indicator en iOS
        gap: 10,
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        gap: 10,
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        elevation: 1,
        // Sombra suave para iOS
        shadowColor: "#000",
        borderWidth: 0.5,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
    },
    text: {
        fontSize: 22,
        fontFamily: 'FiraSans-Bold',
    }
});