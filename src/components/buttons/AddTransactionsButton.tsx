import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    FadeInDown,
    FadeOutDown,
    ZoomIn,
    FadeIn,
    FadeOut,
    interpolateColor
} from 'react-native-reanimated';
import { useSettingsStore } from '../../stores/settingsStore';
import { InputNameActive } from '../../interfaces/settings.interface';
import useDataStore from '../../stores/useDataStore';
import { darkTheme, lightTheme } from '../../theme/colors';
import { ThemeColors } from '../../types/navigation';
import { useTranslation } from 'react-i18next';
import useBudgetsStore from '../../stores/useBudgetStore';

const FAB_SIZE = 62;
const ANIMATION_DURATION = 250;
const BACKDROP_OPACITY = 0.35;

// ==========================================
// Componente Hijo: InputOption (Memoizado)
// ==========================================

interface InputOptionProps {
    title: string;
    iconName: keyof typeof MaterialIcons.glyphMap;
    gradientColors: [string, string];
    index: number;
    onPress: () => void;
}

const InputOption = React.memo<InputOptionProps>(({
    title,
    iconName,
    gradientColors,
    onPress,
    index
}) => {
    return (
        <Animated.View
            entering={FadeInDown
                .delay(index * 50)
                .springify()
                .damping(12)
                .mass(0.8)
            }
            exiting={FadeOutDown.duration(150)}
            style={styles.cardContainer}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                style={styles.touchableOption}
            >
                {/* Texto */}
                <View style={styles.textWrapper}>
                    <Text style={styles.cardText}>{title}</Text>
                </View>

                {/* Icono */}
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
});

InputOption.displayName = 'InputOption';

// ==========================================
// Componente Principal
// ==========================================

export default function AddTransactionsButton() {
    const { theme } = useSettingsStore();
    const { t } = useTranslation();
    const colors: ThemeColors = useMemo(
        () => theme === 'dark' ? darkTheme : lightTheme,
        [theme]
    );

    const {
        isAddOptionsOpen,
        setIsAddOptionsOpen,
        setInputNameActive,
        isDateSelectorOpen
    } = useSettingsStore();

    const {
        allAccounts = [],
        setSelectedAccount,
        selectedAccount
    } = useDataStore();

    const [isOpen, setIsOpen] = React.useState(false);
    const setDataToTransact = useBudgetsStore(state => state.setToTransactBudget);

    // Shared Value para la rotación
    const animationProgress = useSharedValue(0);

    // Sincronizar animación con estado
    useEffect(() => {
        animationProgress.value = withTiming(
            isOpen ? 1 : 0,
            { duration: ANIMATION_DURATION }
        );
    }, [isOpen]);

    // Lógica de selección de cuenta por defecto
    useEffect(() => {
        if (allAccounts.length === 0) {
            if (selectedAccount !== null && selectedAccount !== '') {
                setSelectedAccount('');
            }
            return;
        }

        const currentAccountExists = allAccounts.some(
            acc => acc.id === selectedAccount
        );

        if (!currentAccountExists || !selectedAccount) {
            setSelectedAccount(allAccounts[0].id);
        }
    }, [allAccounts, selectedAccount, setSelectedAccount]);

    // Handlers optimizados
    const handleToggleOptions = useCallback(() => {
        if (!isOpen) {
            setDataToTransact(null);
        }
        setIsOpen(!isOpen);
    }, [isOpen, setDataToTransact]);

    // ✅ FUNCIÓN PARA CERRAR EL MODAL AL TOCAR FUERA
    const handleBackdropPress = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleSelectIncome = useCallback(() => {
        setIsOpen(false);
        setInputNameActive(InputNameActive.INCOME);
        setIsAddOptionsOpen(true);
    }, [setInputNameActive, setIsAddOptionsOpen]);

    const handleSelectExpense = useCallback(() => {
        setIsOpen(false);
        setInputNameActive(InputNameActive.SPEND);
        setIsAddOptionsOpen(true);
    }, [setInputNameActive, setIsAddOptionsOpen]);

    // Estilo animado para el FAB
    const fabAnimatedStyle = useAnimatedStyle(() => {
        const rotate = animationProgress.value * 45;
        const backgroundColor = interpolateColor(
            animationProgress.value,
            [0, 1],
            [colors.text, colors.surface]
        );

        return {
            transform: [{ rotate: `${rotate}deg` }],
            backgroundColor: backgroundColor
        };
    });

    // Estilos memoizados
    const backdropStyle = useMemo(() => [
        styles.backdrop,
        { backgroundColor: `rgba(0,0,0,${BACKDROP_OPACITY})` }
    ], []);

    const fabStyle = useMemo(() => [
        styles.fab,
        fabAnimatedStyle
    ], [fabAnimatedStyle]);

    return (
        <>
            {/* --- BACKDROP (FONDO OSCURO) --- */}
            {isOpen && (
                <Animated.View
                    style={backdropStyle}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                >
                    {/* ✅ PRESSABLE PARA CERRAR AL TOCAR FUERA */}
                    <Pressable
                        style={styles.backdropPressable}
                        onPress={handleBackdropPress}
                    />
                </Animated.View>
            )}

            {/* --- OPCIONES DEL MENÚ --- */}
            {isOpen && (
                <View style={styles.optionsContainer} pointerEvents="box-none">
                    <View style={styles.optionsWrapper}>
                        {/* Opción 1: Ingreso */}
                        <InputOption
                            title={t('common.addIncome')}
                            iconName="trending-up"
                            gradientColors={['#10b981', '#34d399']}
                            onPress={handleSelectIncome}
                            index={1}
                        />

                        {/* Opción 2: Gasto */}
                        <InputOption
                            title={t('common.addExpense')}
                            iconName="trending-down"
                            gradientColors={['#ec4899', '#f43f5e']}
                            onPress={handleSelectExpense}
                            index={0}
                        />
                    </View>
                </View>
            )}

            {/* --- BOTÓN FLOTANTE (FAB) --- */}
            {!isDateSelectorOpen && (
                <Animated.View
                    entering={ZoomIn.springify()}
                    style={styles.fabContainer}
                >
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleToggleOptions}
                    >
                        <Animated.View style={fabStyle}>
                            <MaterialIcons
                                name="add"
                                size={28}
                                color={colors.accent}
                            />
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    // Backdrop cubre toda la pantalla
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
        ...Platform.select({
            android: { elevation: 1 },
        }),
    },
    backdropPressable: {
        flex: 1,
        width: '100%',
        height: '100%',
    },

    // Contenedor de opciones
    optionsContainer: {
        position: 'absolute',
        bottom: 210,
        right: 38,
        zIndex: 1300,
        alignItems: 'flex-end',
    },
    optionsWrapper: {
        gap: 16,
        alignItems: 'flex-end',
    },

    // Contenedor del FAB
    fabContainer: {
        position: 'absolute',
        bottom: 120,
        right: 24,
        zIndex: 1301,
    },
    fab: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
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
        gap: 12,
    },
    textWrapper: {
        backgroundColor: '#FFF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        ...Platform.select({
            android: {
                elevation: 2
            },
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 2
            }
        })
    },
    cardText: {
        fontSize: 14,
        fontFamily: 'FiraSans-Regular',
        color: '#333',
    },
    avatarNoShadow: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            android: {
                elevation: 4
            },
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 3,
                shadowOffset: { width: 0, height: 2 }
            }
        })
    }
});