import React, { useState, useMemo } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Modal, 
    FlatList,
    Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { ThemeColors } from '../../../types/navigation';
import { is } from 'date-fns/locale';

// Definición de tipos basada en tu código original
export interface Account {
    id: string;
    name: string;
    type: string;
}

interface AccountSelectorProps {
    label: string;
    accountSelected: string;
    setAccountSelected: (account: string) => void;
    accounts: Account[];
    colors: ThemeColors;
}

export default function AccountSelector({
    label,
    accountSelected,
    setAccountSelected,
    accounts,
    colors
}: AccountSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Buscamos el objeto completo de la cuenta seleccionada para mostrar su nombre
    // Si no hay seleccionada, intentamos mostrar la primera como fallback visual (o placeholder)
    const selectedAccountObj = useMemo(() => {
        return accounts.find(acc => acc.id === accountSelected) || accounts[0];
    }, [accountSelected, accounts]);

    const handleSelect = (id: string) => {
        setAccountSelected(id);
        setIsOpen(false);
    };

    return (
        <View style={styles.container}>
            {/* Label Superior */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>

            {/* Trigger (El botón que parece un Input) */}
            <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setIsOpen(true)}
                style={[styles.inputTrigger, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
                <View style={[styles.textContainer, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.inputText, { color: colors.accent }]} numberOfLines={1}>
                        {selectedAccountObj ? selectedAccountObj.name : "Select Account"}
                    </Text>
                    {selectedAccountObj && (
                        <Text style={[styles.inputTypeText, { color: colors.accent }]}>
                            {selectedAccountObj.type}
                        </Text>
                    )}
                </View>
                <MaterialIcons name="arrow-drop-down" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Modal de Selección */}
            <Modal
                visible={isOpen}
                transparent
                animationType="none" // Usamos Reanimated para animar
                onRequestClose={() => setIsOpen(false)}
            >
                {/* Backdrop Oscuro */}
                <Animated.View 
                    layout={FadeIn}

                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    style={styles.modalBackdrop}
                >
                    {/* Cierra al tocar fuera */}
                    <TouchableOpacity 
                        style={StyleSheet.absoluteFill} 
                        onPress={() => setIsOpen(false)} 
                        activeOpacity={1}
                    />

                    {/* Contenedor de la Lista */}
                    <Animated.View 
                        layout={FadeIn}

                        entering={ZoomIn.duration(250)}
                        exiting={ZoomOut.duration(200)}
                        style={[styles.modalContent, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                    >
                        {/* Header del Modal */}
                        <View style={[styles.modalHeader, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{label}</Text>
                        </View>

                        {/* Lista de Opciones */}
                        <FlatList
                            data={accounts}
                            keyExtractor={(item) => item.id}
                            style={{ backgroundColor: colors.surfaceSecondary }}
                            contentContainerStyle={{ paddingVertical: 8, backgroundColor: colors.surfaceSecondary }}
                            renderItem={({ item }) => {
                                const isSelected = accountSelected === item.id;
                                return (
                                    <TouchableOpacity 
                                        style={[
                                            styles.optionItem,
                                            { backgroundColor: colors.surfaceSecondary },
                                            isSelected && { backgroundColor: colors.surface }
                                        ]}
                                        onPress={() => handleSelect(item.id)}
                                    >
                                        <View>
                                            <Text style={[
                                                styles.optionText,
                                                { color: isSelected ? colors.accent : colors.textSecondary },
                                                isSelected && [styles.optionTextSelected, { color: colors.accent }]
                                            ]}>
                                                {item.name}
                                            </Text>
                                            <Text style={[styles.optionSubText, { color: isSelected ? colors.accent : colors.textSecondary }]}>
                                                {item.type}
                                            </Text>
                                        </View>
                                        
                                        {isSelected && (
                                            <MaterialIcons name="check-circle" size={20} color={colors.accent} />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </Animated.View>
                </Animated.View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        fontSize: 8,
        marginBottom: 4,
        fontWeight: '600',
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Estilo del Input Trigger
    inputTrigger: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 64,
        borderWidth: 1,
    },
    textContainer: {
        flex: 1,
    },
    inputText: {
        fontSize: 16,
        fontWeight: '500',
    },
    inputTypeText: {
        fontSize: 12,
        marginTop: 2,
    },
    
    // Estilos del Modal
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // Backdrop más oscuro para contraste
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '60%', // Evita que ocupe toda la pantalla si hay muchas cuentas
        backgroundColor: 'white',
        borderRadius: 20,
        
        // CERO SOMBRAS / ELEVACIÓN
        borderWidth: 0.5,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
    },
    // Estilos de la Lista
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    optionText: {
        fontSize: 16,
        color: '#444',
    },
    optionTextSelected: {
        fontWeight: '700',
    },
    optionSubText: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        textTransform: 'capitalize',
    }
});