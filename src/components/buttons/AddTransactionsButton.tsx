import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Iconos equivalentes a MUI
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti'; // Equivalente a Framer Motion
import  { useSettingsStore } from '../../stores/settingsStore'; // Asumo que tu store ya es compatible (Zustand funciona igual)
import { InputNameActive } from '../../interfaces/settings.interface';

// Definimos variantes de animación similares a las que tenías
// Moti nos permite definir 'from', 'animate', 'exit' directamente en el componente
const FAB_SIZE = 56;

export default function AddTransactionsButton() {
    const { isAddOptionsOpen, setIsAddOptionsOpen, setInputNameActive, isDateSelectorOpen } = useSettingsStore();

    const handleToggleOptions = () => {
        setIsAddOptionsOpen(!isAddOptionsOpen);
    };

    return (
        <>
            {/* Opciones del Menú (AnimatePresence maneja el desmontaje animado) */}
            <AnimatePresence>
                {isAddOptionsOpen && (
                    <MotiView
                        key="options-container"
                        from={{ opacity: 0, translateY: 20, scale: 0.9 }}
                        animate={{ opacity: 1, translateY: 0, scale: 1 }}
                        exit={{ opacity: 0, translateY: 20, scale: 0.9 }}
                        transition={{ type: 'timing', duration: 250 }}
                        style={styles.optionsContainer}
                    >
                        <View style={styles.optionsWrapper}>
                            <InputOptions
                                title="Add Income"
                                iconName="trending-up"
                                gradientColors={['#10b981', '#34d399']}
                                onPress={() => {
                                    setInputNameActive(InputNameActive.INCOME);
                                    setIsAddOptionsOpen(false);
                                }}
                                index={0}
                            />
                            
                            <InputOptions
                                title="Add Spend"
                                iconName="trending-down"
                                gradientColors={['#ec4899', '#f43f5e']}
                                onPress={() => {
                                    setInputNameActive(InputNameActive.SPEND);
                                    setIsAddOptionsOpen(false);
                                }}
                                index={1}
                            />
                        </View>
                    </MotiView>
                )}
            </AnimatePresence>

            {/* Botón Flotante (FAB) */}
            {!isDateSelectorOpen && (
                <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    style={styles.fabContainer}
                >
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleToggleOptions}
                        style={[
                            styles.fab,
                            isAddOptionsOpen && styles.fabOpen // Cambia sombra/color si está abierto
                        ]}
                    >
                        {/* Rotamos el icono si está abierto */}
                        <MotiView
                            animate={{ rotate: isAddOptionsOpen ? '45deg' : '0deg' }}
                            transition={{ type: 'timing', duration: 200 }}
                        >
                            <MaterialIcons name="add" size={28} color="#FFF" />
                        </MotiView>
                    </TouchableOpacity>
                </MotiView>
            )}
        </>
    );
}

// ==========================================
// Componente Hijo: InputOptions
// ==========================================

interface InputOptionsProps {
    title: string;
    iconName: keyof typeof MaterialIcons.glyphMap;
    closeOptions?: () => void;
    gradientColors: [string, string];
    index: number;
    onPress: () => void;
}

const InputOptions = ({ title, iconName, gradientColors, onPress, index }: InputOptionsProps) => {
    return (
        <MotiView
            from={{ opacity: 0, translateX: 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            delay={index * 100} // Stagger effect (efecto cascada)
            style={styles.cardContainer}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                style={styles.card}
            >
                {/* Icono con Gradiente */}
                <LinearGradient
                    colors={gradientColors}
                    style={styles.avatar}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <MaterialIcons name={iconName} size={20} color="#FFF" />
                </LinearGradient>

                {/* Texto */}
                <Text style={styles.cardText}>{title}</Text>
            </TouchableOpacity>
        </MotiView>
    );
};

// ==========================================
// Estilos
// ==========================================

const styles = StyleSheet.create({
    // Contenedor absoluto de las opciones
    optionsContainer: {
        position: 'absolute',
        bottom: 100, // Un poco más arriba del FAB
        right: 24,
        zIndex: 1300,
        alignItems: 'flex-end', // Alinear a la derecha
    },
    optionsWrapper: {
        gap: 12, // Espacio entre las tarjetas (equivalente a spacing={2})
        width: 200, // Ancho fijo similar a tu { md: '200px' }
    },
    
    // FAB Styles
    fabContainer: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        zIndex: 301,
    },
    fab: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        backgroundColor: '#6200EE', // Tu color primario
        justifyContent: 'center',
        alignItems: 'center',
        // Sombras (Elevation para Android, Shadow para iOS)
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    fabOpen: {
        backgroundColor: '#3700B3', // Color más oscuro al abrir
        elevation: 10,
    },

    // Tarjeta de Opción (InputOptions)
    cardContainer: {
        width: '100%',
        marginBottom: 8,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Efecto semi-transparente
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        // Sombras suaves
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#424242', // text.secondary aprox
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        // Sombra del icono (simulando el boxShadow del CSS original)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    }
});