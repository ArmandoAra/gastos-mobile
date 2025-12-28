import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Modal, 
    FlatList 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut, FadeInLeft } from 'react-native-reanimated';

interface DaySelectorInputProps {
    label: string;
    selectedDay: number | string; // Permitimos string por si usas "Monday", etc.
    setSelectedDay: (day: number) => void;
    days: (number | string)[]; // Array flexible
}

export default function DaySelectorInput({
    label,
    selectedDay,
    setSelectedDay,
    days
}: DaySelectorInputProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (day: number | string) => {
        // Aseguramos que se pase como número si tu lógica lo requiere, 
        // o adaptamos según el tipo de dato real.
        setSelectedDay(Number(day)); 
        setIsOpen(false);
    };

    return (
        <Animated.View 
            layout={FadeInLeft}

            entering={FadeInLeft.duration(300).delay(100).springify()}
            style={styles.container}
        >
            {/* Label Superior */}
            <Text style={styles.label}>{label}</Text>

            {/* Trigger (El botón que parece un Input) */}
            <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setIsOpen(true)}
                style={styles.inputTrigger}
            >
                <Text style={styles.inputText}>
                    {selectedDay ? selectedDay : "Select Day"}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color="#757575" />
            </TouchableOpacity>

            {/* Modal de Selección */}
            <Modal
                visible={isOpen}
                transparent
                animationType="none"
                onRequestClose={() => setIsOpen(false)}
            >
                {/* Backdrop Oscuro */}
                <Animated.View 
                    layout={FadeIn}

                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    style={styles.modalBackdrop}
                >
                    <TouchableOpacity 
                        style={StyleSheet.absoluteFill} 
                        onPress={() => setIsOpen(false)} 
                        activeOpacity={1}
                    />

                    {/* Contenido del Modal */}
                    <Animated.View 
                        layout={ZoomIn}

                        entering={ZoomIn.duration(250).springify().damping(18)}
                        exiting={ZoomOut.duration(200)}
                        style={styles.modalContent}
                    >
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{label}</Text>
                            <TouchableOpacity 
                                onPress={() => setIsOpen(false)}
                                style={styles.closeButton}
                            >
                                <MaterialIcons name="close" size={24} color="#757575" />
                            </TouchableOpacity>
                        </View>

                        {/* Lista de Días */}
                        <FlatList
                            data={days}
                            keyExtractor={(item) => String(item)}
                            contentContainerStyle={{ paddingVertical: 8 }}
                            // Optimizaciones para listas largas
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            renderItem={({ item }) => {
                                const isSelected = selectedDay === item;
                                return (
                                    <TouchableOpacity 
                                        style={[
                                            styles.optionItem,
                                            isSelected && styles.optionSelected
                                        ]}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text style={[
                                            styles.optionText,
                                            isSelected && styles.optionTextSelected
                                        ]}>
                                            {item}
                                        </Text>
                                        
                                        {isSelected && (
                                            <MaterialIcons name="check" size={20} color="#6200EE" />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </Animated.View>
                </Animated.View>
            </Modal>
        </Animated.View>
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
        backgroundColor: '#F5F5F7', // Mismo gris iOS style
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14, // Un poco más alto para touch targets
        borderWidth: 1,
        borderColor: 'transparent', 
    },
    inputText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    
    // Estilos del Modal
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '70%', // Permitimos que crezca más verticalmente
        backgroundColor: 'white',
        borderRadius: 20,
        
        // SIN SOMBRAS NI ELEVACIÓN
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
        backgroundColor: '#EDE7F6', // Lila muy claro
    },
    optionText: {
        fontSize: 16,
        color: '#444',
    },
    optionTextSelected: {
        color: '#6200EE',
        fontWeight: '700',
    }
});