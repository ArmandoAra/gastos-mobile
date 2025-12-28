
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

const FAB_SIZE = 56;

// Configuración de animación Spring optimizada
const SPRING_CONFIG = {
    damping: 100,
    stiffness: 100,
    mass: 0.8
};

export default function AddTransactionsButton() {
    const { isAddOptionsOpen, setIsAddOptionsOpen, setInputNameActive, isDateSelectorOpen, inputNameActive } = useSettingsStore();

    // Shared Value para la rotación del icono
    const rotation = useSharedValue(0);

    // Sincronizar rotación con estado
    useEffect(() => {
        rotation.value = withTiming(isAddOptionsOpen ? 45 : 0, { duration: 200 });
    }, [isAddOptionsOpen]);


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
        bottom: 90,
        right: 24,
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
        bottom: 24,
        right: 24,
        zIndex: 301,
    },
    fab: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        backgroundColor: '#6200EE',
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