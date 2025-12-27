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
}

export default function AccountSelector({
    label,
    accountSelected,
    setAccountSelected,
    accounts
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
            <Text style={styles.label}>{label}</Text>

            {/* Trigger (El botón que parece un Input) */}
            <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setIsOpen(true)}
                style={styles.inputTrigger}
            >
                <View style={styles.textContainer}>
                    <Text style={styles.inputText} numberOfLines={1}>
                        {selectedAccountObj ? selectedAccountObj.name : "Select Account"}
                    </Text>
                    {selectedAccountObj && (
                        <Text style={styles.inputTypeText}>
                            {selectedAccountObj.type}
                        </Text>
                    )}
                </View>
                <MaterialIcons name="arrow-drop-down" size={24} color="#757575" />
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
                        entering={ZoomIn.duration(250)}
                        exiting={ZoomOut.duration(200)}
                        style={styles.modalContent}
                    >
                        {/* Header del Modal */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{label}</Text>
                            <TouchableOpacity 
                                onPress={() => setIsOpen(false)}
                                style={styles.closeButton}
                            >
                                <MaterialIcons name="close" size={24} color="#757575" />
                            </TouchableOpacity>
                        </View>

                        {/* Lista de Opciones */}
                        <FlatList
                            data={accounts}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ paddingVertical: 8 }}
                            renderItem={({ item }) => {
                                const isSelected = accountSelected === item.id;
                                return (
                                    <TouchableOpacity 
                                        style={[
                                            styles.optionItem,
                                            isSelected && styles.optionSelected
                                        ]}
                                        onPress={() => handleSelect(item.id)}
                                    >
                                        <View>
                                            <Text style={[
                                                styles.optionText,
                                                isSelected && styles.optionTextSelected
                                            ]}>
                                                {item.name}
                                            </Text>
                                            <Text style={styles.optionSubText}>
                                                {item.type}
                                            </Text>
                                        </View>
                                        
                                        {isSelected && (
                                            <MaterialIcons name="check-circle" size={20} color="#6200EE" />
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
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
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
        backgroundColor: '#F5F5F7', // Gris muy claro (Estilo iOS inputs)
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'transparent', 
    },
    textContainer: {
        flex: 1,
    },
    inputText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    inputTypeText: {
        fontSize: 12,
        color: '#888',
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
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#FFFFFF',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
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
        borderBottomWidth: 1,
        borderBottomColor: '#FAFAFA',
    },
    optionSelected: {
        backgroundColor: '#F3E5F5', // Color Lila muy suave de fondo
    },
    optionText: {
        fontSize: 16,
        color: '#444',
    },
    optionTextSelected: {
        color: '#6200EE',
        fontWeight: '700',
    },
    optionSubText: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        textTransform: 'capitalize',
    }
});