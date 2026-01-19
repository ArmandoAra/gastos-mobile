import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HeaderTitleProps {
    title: string;
    date: string;
    titleColor: string;
}

export const TransactionHeaderTitle: React.FC<HeaderTitleProps> = ({ title, date, titleColor }) => {
    return (
        <View style={styles.container}>
            {/* Título Principal: Grande, negrita y con el color de acción */}
            <Text style={[styles.title, { color: titleColor }]}>
                {title}
            </Text>

            {/* Fecha: Pequeña, sutil y en mayúsculas para un look técnico limpio */}
            <View style={styles.dateContainer}>
                <Text style={[  styles.date, { color: titleColor }]}>
                    {date}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20, // Tamaño prominente
        fontFamily: 'Tinos-Bold',
        letterSpacing: 0.5,
        includeFontPadding: false, // Ayuda a alinear mejor en Android
    },
    dateContainer: {
        marginTop: 4, // Espacio entre título y fecha
        flexDirection: 'row',
        alignItems: 'center',
    },
    date: {
        fontSize: 12,
        color: '#94a3b8', // Un gris moderno y sutil (Slate 400)
        fontFamily: 'FiraSans-Bold',
        textTransform: 'uppercase', // Le da un toque elegante y ordenado
        letterSpacing: 1.2, // Facilita la lectura en tamaños pequeños
    }
});