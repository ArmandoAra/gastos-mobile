
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    FadeInDown,
    FadeOutDown,
    ZoomIn,
    FadeIn,
    FadeOut
} from 'react-native-reanimated';
import { useSettingsStore } from '../../stores/settingsStore';
import { InputNameActive } from '../../interfaces/settings.interface';
import AddTransactionForm from '../forms/AddTransactionForm';
import useDataStore from '../../stores/useDataStore';
import { set } from 'date-fns';

const FAB_SIZE = 56;

// Configuración de animación Spring optimizada
const SPRING_CONFIG = {
    damping: 100,
    stiffness: 100,
    mass: 0.8
};

export default function AddTransactionsButton() {
    const { isAddOptionsOpen, setIsAddOptionsOpen, setInputNameActive, isDateSelectorOpen, inputNameActive } = useSettingsStore();
    const { allAccounts, setSelectedAccount, selectedAccount, } = useDataStore();

    // Shared Value para la rotación del icono
    const rotation = useSharedValue(0);

    // Sincronizar rotación con estado
    useEffect(() => {
        rotation.value = withTiming(isAddOptionsOpen ? 45 : 0, { duration: 200 });
    }, [isAddOptionsOpen]);

    useEffect(() => {
        // 1. Si no hay cuentas en absoluto, asegurarnos de que no haya nada seleccionado
        if (allAccounts.length === 0) {
            if (selectedAccount !== null && selectedAccount !== '') {
                setSelectedAccount(''); // O null, dependiendo de tu tipo
            }
            return;
        }

        // 2. Buscamos si la cuenta seleccionada actual existe en la lista
        const currentAccountExists = allAccounts.some(acc => acc.id === selectedAccount);

        // 3. Si NO existe (porque se borró o es antigua) o no hay ninguna seleccionada
        if (!currentAccountExists || !selectedAccount) {
            console.log("La cuenta seleccionada no es válida. Asignando la primera disponible.");
            // Seleccionamos la primera cuenta disponible por defecto
            setSelectedAccount(allAccounts[0].id);
        }

        // Eliminamos 'setSelectedAccount' de las dependencias para evitar bucles si la función no es estable
    }, [allAccounts, selectedAccount]);


    const handleToggleOptions = () => {
        setIsAddOptionsOpen(!isAddOptionsOpen);
    };

    return (
        <>
            {
                (inputNameActive === InputNameActive.INCOME || inputNameActive === InputNameActive.SPEND) &&
                <AddTransactionForm />
            }


            {/* Opciones del Menú */}
            {isAddOptionsOpen && (
                <Animated.View
                    layout={FadeIn}
                    key="options-container"
                    style={styles.optionsContainer}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                >
                    <View style={styles.optionsWrapper}>
                        {/* Opción 1: Ingreso */}
                        <InputOptionsNoShadow
                            title="Add Income"
                            iconName="trending-up"
                            gradientColors={['#10b981', '#34d399']}
                            onPress={() => {
                                setInputNameActive(InputNameActive.INCOME);
                                setIsAddOptionsOpen(false);
                            }}
                            index={0}
                        />

                        {/* Opción 2: Gasto */}
                        <InputOptionsNoShadow
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
                </Animated.View>
            )}

            {/* Botón Flotante (FAB) */}
            {!isDateSelectorOpen && (
                <Animated.View
                    layout={ZoomIn}
                    entering={ZoomIn.springify()}
                    style={styles.fabContainer}
                >
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleToggleOptions}
                        style={[
                            styles.fab,
                            isAddOptionsOpen && styles.fabOpen
                        ]}
                    >
                        <Animated.View
                            layout={FadeIn}>
                            <MaterialIcons name="add" size={28} color="#FFF" />
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </>
    );
}

// ==========================================
// Componente Hijo: InputOptions (CORREGIDO)
// ==========================================

interface InputOptionsProps {
    title: string;
    iconName: keyof typeof MaterialIcons.glyphMap;
    gradientColors: [string, string];
    index: number;
    onPress: () => void;
}

const InputOptionsNoShadow = ({ title, iconName, gradientColors, onPress, index }: InputOptionsProps) => {
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withSpring(1, SPRING_CONFIG);
    }, []);

    const animatedCardStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            entering={FadeInDown
                .delay(index * 60)
                .springify()
                .damping(SPRING_CONFIG.damping)
                .stiffness(SPRING_CONFIG.stiffness)
                .mass(SPRING_CONFIG.mass)
            }
            exiting={FadeOutDown.duration(150)}
            style={styles.cardContainer}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
            >
                <Animated.View style={[styles.cardNoShadow, animatedCardStyle]}>
                    <LinearGradient
                        colors={gradientColors}
                        style={styles.avatarNoShadow}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <MaterialIcons name={iconName} size={20} color="#FFF" />
                    </LinearGradient>
                    <Text style={styles.cardText}>{title}</Text>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
};


// ==========================================
// Estilos CORREGIDOS
// ==========================================

const styles = StyleSheet.create({
    optionsContainer: {
        position: 'absolute',
        bottom: 110,
        right: 90,
        zIndex: 1300,
        alignItems: 'flex-end',
    },
    optionsWrapper: {
        gap: 12,
        width: 200,
        paddingBottom: 8,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 110,
        right: 24,
        zIndex: 301,
    },
    fab: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            android: {
                elevation: 6
            },
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65
            }
        }),
    },
    fabOpen: {
        backgroundColor: '#3700B3',
        transform: [{ rotate: '45deg' }],
        ...Platform.select({
            android: { elevation: 8 }
        }),
    },
    cardContainer: {
        // Espaciado entre tarjetas
    },
    cardText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    cardNoShadow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E0E0E0', // Borde sutil en lugar de sombra
    },
    avatarNoShadow: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        // Sin elevation ni shadow
    }
});