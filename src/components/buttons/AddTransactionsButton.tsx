// AddTransactionsButton.tsx
import React, { useMemo } from "react";
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Pressable,
    Text,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
    useAnimatedStyle,
    interpolateColor,
    ZoomIn,
    FadeIn,
    FadeOut,
    FadeInDown,
    FadeOutDown,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { darkTheme, lightTheme } from "../../theme/colors";
import { useAddTransactions } from "../../hooks/useAddTransactions";
import { LinearGradient } from "expo-linear-gradient";
import { useSettingsStore } from "../../stores/settingsStore";
import { ThemeColors } from "../../types/navigation";

interface InputOptionProps {
    title: string;
    iconName: keyof typeof MaterialIcons.glyphMap;
    gradientColors: [string, string];
    index: number;
    onPress: () => void;
}
const InputOption = React.memo<InputOptionProps>(
    ({ title, iconName, gradientColors, onPress, index }) => {
        const theme = useSettingsStore((state) => state.theme);
        const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;
        return (
            <Animated.View
                entering={FadeInDown.delay(index * 50)
                    .springify()
                    .damping(12)
                    .mass(0.8)}
                exiting={FadeOutDown.duration(150)}
                style={styles.cardContainer}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={onPress}
                    style={styles.touchableOption}
                >
                    {/* Texto */}
                    <View style={[styles.textWrapper, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.cardText, { color: colors.text }]}>{title}</Text>

                    <LinearGradient
                        colors={gradientColors}
                        style={styles.avatarNoShadow}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <MaterialIcons name={iconName} size={20} color="#FFF" />
                    </LinearGradient>
                    </View>

                </TouchableOpacity>
            </Animated.View>
        );
    },
);

InputOption.displayName = "InputOption";

const FAB_SIZE = 62;
const BACKDROP_OPACITY = 0.35;

export default function AddTransactionsButton() {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    // Consumimos el custom hook
    const { theme, isDateSelectorOpen, isOpen, animationProgress, handlers } =
        useAddTransactions();

    const colors = useMemo(
        () => (theme === "dark" ? darkTheme : lightTheme),
        [theme],
    );

    const fabAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${animationProgress.value * 45}deg` }],
            backgroundColor: interpolateColor(
                animationProgress.value,
                [0, 1],
                [colors.text, colors.surface],
            ),
        };
    });

    const fabStyle = useMemo(
        () => [styles.fab, fabAnimatedStyle],
        [fabAnimatedStyle],
    );

    return (
        <>
            {isOpen && (
                <Animated.View
                    style={styles.backdrop}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                >
                    <Pressable
                        style={styles.backdropPressable}
                        onPress={handlers.handleBackdropPress}
                    />
                </Animated.View>
            )}

            {isOpen && (
                <View
                    style={[styles.optionsContainer, { bottom: insets.bottom + 160 }]}
                    pointerEvents="box-none"
                >
                    <View style={styles.optionsWrapper}>
                        <InputOption
                            title={t("common.addIncome")}
                            iconName="trending-up"
                            gradientColors={["#10b981", "#34d399"]}
                            onPress={handlers.handleSelectIncome}
                            index={1}
                        />
                        <InputOption
                            title={t("common.addExpense")}
                            iconName="trending-down"
                            gradientColors={["#ec4899", "#f43f5e"]}
                            onPress={handlers.handleSelectExpense}
                            index={0}
                        />
                    </View>
                </View>
            )}

            {!isDateSelectorOpen && (
                <Animated.View
                    entering={ZoomIn.springify()}
                    style={[styles.fabContainer, { bottom: insets.bottom + 70 }]}
                >
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handlers.handleToggleOptions}
                    >
                        <Animated.View style={fabStyle}>
                            <MaterialIcons name="add" size={28} color={colors.accent} />
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: `rgba(0,0,0,${BACKDROP_OPACITY})`, // <-- Movido directamente aquí
        zIndex: 1000,
        ...Platform.select({ android: { elevation: 1 } }),
    },
    backdropPressable: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    optionsContainer: {
        position: "absolute",
        bottom: 210,
        right: 38,
        zIndex: 1300,
        alignItems: "flex-end",
    },
    optionsWrapper: {
        gap: 16,
        alignItems: "flex-end",
    },
    fabContainer: {
        position: "absolute",
        right: 24,
        zIndex: 1301,
    },
    fab: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        justifyContent: "center",
        alignItems: "center",
        ...Platform.select({
            android: {
                elevation: 6,
            },
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
            },
        }),
    },
    cardContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    touchableOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 12,
    },

    textWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 50,
        ...Platform.select({
            android: {
                elevation: 2,
            },
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
        }),
    },
    cardText: {
        fontSize: 14,
        fontFamily: "FiraSans-Regular",
        color: "#333",
    },

    avatarNoShadow: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
});
