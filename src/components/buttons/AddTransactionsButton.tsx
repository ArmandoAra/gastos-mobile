import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Pressable } from 'react-native';
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
    FadeOut,
    interpolateColor
} from 'react-native-reanimated';
import { useSettingsStore } from '../../stores/settingsStore';
import { InputNameActive } from '../../interfaces/settings.interface';
import AddTransactionForm from '../forms/AddTransactionForm';
import useDataStore from '../../stores/useDataStore';
import { darkTheme, lightTheme } from '../../theme/colors';
import { ThemeColors } from '../../types/navigation';
import { useTranslation } from 'react-i18next';

const FAB_SIZE = 62;

export default function AddTransactionsButton() {
    const { theme } = useSettingsStore();
    const { t } = useTranslation();
    const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;
    const { isAddOptionsOpen, setIsAddOptionsOpen, setInputNameActive, isDateSelectorOpen, inputNameActive } = useSettingsStore();
    const { allAccounts, setSelectedAccount, selectedAccount } = useDataStore();
    const [isOpen, setIsOpen] = React.useState(false);

    // Shared Value para la rotación (0 a 1)
    const animationProgress = useSharedValue(0);

    // Sincronizar animación con estado
    useEffect(() => {
        animationProgress.value = withTiming(isAddOptionsOpen ? 1 : 0, { duration: 250 });
    }, [isAddOptionsOpen]);

    // Lógica de selección de cuenta por defecto
    useEffect(() => {
        if (allAccounts.length === 0) {
            if (selectedAccount !== null && selectedAccount !== '') setSelectedAccount('');
            return;
        }
        const currentAccountExists = allAccounts.some(acc => acc.id === selectedAccount);
        if (!currentAccountExists || !selectedAccount) {
            setSelectedAccount(allAccounts[0].id);
        }
    }, [allAccounts, selectedAccount]);

    const handleToggleOptions = () => {
        setIsAddOptionsOpen(!isAddOptionsOpen);
    };

    const handleClose = () => {
        setIsAddOptionsOpen(false);
    };

    // Estilo animado para el FAB (Rotación y cambio de color de fondo)
    const fabAnimatedStyle = useAnimatedStyle(() => {
        const rotate = animationProgress.value * 45; // 0 a 45 grados
        const backgroundColor = interpolateColor(
            animationProgress.value,
            [0, 1],
            [colors.text, colors.surface] // De oscuro a claro (o según tu tema)
        );

        return {
            transform: [{ rotate: `${rotate}deg` }],
            backgroundColor: backgroundColor
        };
    });

    return (
        <>

            {/* --- BACKDROP (FONDO OSCURO) --- */}
            {isAddOptionsOpen && (
                <Animated.View
                    style={styles.backdrop}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                >
                    {/* Usamos Pressable para detectar el clic fuera y cerrar */}
                    <Pressable style={styles.backdropPressable} onPress={handleClose} />
                </Animated.View>
            )}

            {/* --- OPCIONES DEL MENÚ --- */}
            {isAddOptionsOpen && (
                <View style={styles.optionsContainer} pointerEvents="box-none">
                    <View style={styles.optionsWrapper}>
                        {/* Opción 1: Ingreso */}
                        <InputOptionsNoShadow
                            title={t('common.addIncome')}
                            iconName="trending-up"
                            gradientColors={['#10b981', '#34d399']}
                            onPress={() => {
                                setIsOpen(true);
                                setInputNameActive(InputNameActive.INCOME);
                                setIsAddOptionsOpen(false);
                            }}
                            index={1} // Invertimos indices para que el de arriba salga ultimo o primero segun gusto
                        />

                        {/* Opción 2: Gasto */}
                        <InputOptionsNoShadow
                            title={t('common.addExpense')}
                            iconName="trending-down"
                            gradientColors={['#ec4899', '#f43f5e']}
                            onPress={() => {
                                setIsOpen(true);
                                setInputNameActive(InputNameActive.SPEND);
                                setIsAddOptionsOpen(false);
                            }}
                            index={0}
                        />
                    </View>
                </View>
            )}

            {/* --- BOTÓN FLOTANTE (FAB) --- */}
            {!isDateSelectorOpen && (
                <Animated.View
                    layout={ZoomIn}
                    entering={ZoomIn.springify()}
                    style={styles.fabContainer}
                >
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleToggleOptions}
                    >
                        <Animated.View style={[styles.fab, fabAnimatedStyle]}>
                            <MaterialIcons
                                name="add"
                                size={28}
                                color={colors.accent}
                            />
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>
            )}
            {/* Modal del Formulario (Gasto/Ingreso) */}
            {(inputNameActive === InputNameActive.INCOME || inputNameActive === InputNameActive.SPEND) && (
                <AddTransactionForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
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
    gradientColors: [string, string];
    index: number;
    onPress: () => void;
}

const InputOptionsNoShadow = ({ title, iconName, gradientColors, onPress, index }: InputOptionsProps) => {

    // Animación de entrada: Slide hacia arriba + Fade In
    return (
        <Animated.View
            entering={FadeInDown
                .delay(index * 50) // Pequeño delay escalonado
                .springify()
                .damping(12)
                .mass(0.8)
            }
            exiting={FadeOutDown.duration(150)} // Salida rápida hacia abajo
            style={styles.cardContainer}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                style={styles.touchableOption}
            >
                {/* Texto a la izquierda */}
                <View style={styles.textWrapper}>
                    <Text style={styles.cardText}>{title}</Text>
                </View>

                {/* Icono a la derecha */}
                <LinearGradient
                    colors={gradientColors}
                    style={styles.avatarNoShadow}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <MaterialIcons name={iconName} size={20} color="#FFF" />
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    // El Backdrop cubre toda la pantalla
    backdrop: {
        ...StyleSheet.absoluteFillObject, // Ocupa todo el espacio (top: 0, left: 0, etc)
        backgroundColor: 'rgba(0,0,0,0.35)', // Oscurece el fondo
        zIndex: 1000, // Alto, pero menos que el FAB y las opciones
        elevation: 1, // Para Android
    },
    backdropPressable: {
        flex: 1,
        width: '100%',
        height: '100%',
    },

    // Contenedor de opciones
    optionsContainer: {
        position: 'absolute',
        bottom: 210, // Un poco arriba del FAB
        right: 38,   // Alineado con el FAB
        zIndex: 1300, // Por encima del backdrop
        alignItems: 'flex-end', // Alinea el contenido a la derecha
    },
    optionsWrapper: {
        gap: 16,
        alignItems: 'flex-end',
    },

    // Contenedor del FAB
    fabContainer: {
        position: 'absolute',
        bottom: 120, // Más pegado al borde inferior (estándar Material Design)
        right: 24,
        zIndex: 1301, // El elemento más alto, siempre clicable
    },
    fab: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            android: { elevation: 6 },
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65
            }
        }),
    },

    // Estilos de las opciones individuales
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    touchableOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12, // Espacio entre texto e icono
    },
    textWrapper: {
        backgroundColor: '#FFF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        ...Platform.select({
            android: { elevation: 2 },
            ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }
        })
    },
    cardText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    avatarNoShadow: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            android: { elevation: 4 },
            ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } }
        })
    }
});