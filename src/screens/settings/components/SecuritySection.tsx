import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Platform,
    Switch,
    AccessibilityInfo
} from 'react-native';
import Animated, { 
    FadeIn,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeColors } from '../../../types/navigation';
import ChangePinModal from './ChangePinModal';
import { useAuthStore } from '../../../stores/authStore';
import useMessage from '../../../stores/useMessage';
import { MessageType } from '../../../interfaces/message.interface';
import { useTranslation } from 'react-i18next';

interface SecuritySectionProps {
    colors: ThemeColors;
}

export default function SecuritySection({ colors }: SecuritySectionProps) {
    const { t } = useTranslation();
    const { changePin, isBiometricEnabled, toggleBiometrics, isPinEnabled, togglePin } = useAuthStore();
    const [isChangePinModalVisible, setChangePinModalVisible] = useState(false);
    const { showMessage } = useMessage();

    const handleChangePin = (oldPin: string, newPin: string) => {
        changePin(oldPin, newPin);
        setChangePinModalVisible(false);
        if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(t('security.changedSuccessfully'));
        showMessage(MessageType.SUCCESS, t('security.changedSuccessfully'));
    }

    return (
        <Animated.View 
            entering={FadeIn.duration(500)}
            style={[
                styles.card, 
                { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
        >
            {/* --- HEADER --- */}
            <View style={styles.headerRow} accessibilityRole="header">
                <View style={styles.titleContainer}>
                    <Text
                        style={[styles.headerTitle, { color: colors.text }]}
                        maxFontSizeMultiplier={1.5}
                    >
                        {t('security.titleHeader')}
                    </Text>
                </View>
            </View>

            {/* --- ITEMS --- */}
            <View style={styles.listContainer}>

                {/* 1. Switch PIN */}
                <SecurityItem 
                    colors={colors}
                    label={t('security.enablePin')} 
                    icon="lock-outline" 
                    value={isPinEnabled} 
                    onAction={togglePin}
                    type="switch"
                />
                
                {/* 2. Switch Biometría */}
                <SecurityItem 
                    colors={colors}
                    label={t('security.enableBiometrics')}
                    icon="fingerprint" 
                    value={isBiometricEnabled} 
                    onAction={toggleBiometrics}
                    type="switch"
                />

                {/* 3. Botón Cambiar PIN (Condicional) */}
                {isPinEnabled && (
                    <Animated.View entering={FadeIn}>
                        <SecurityItem 
                            colors={colors}
                            label={t('security.changePin')} 
                            icon="password" 
                            onAction={() => setChangePinModalVisible(true)}
                            type="button"
                            accessibilityHint="Opens a dialog to change your current PIN"
                        />
                    </Animated.View>
                )}
            </View>

            <ChangePinModal
                visible={isChangePinModalVisible}
                onClose={() => setChangePinModalVisible(false)}
                onSave={handleChangePin}
                colors={colors}
            />
        </Animated.View>
    );
}

// --- SUBCOMPONENTE REFACTORIZADO ---
interface SecurityItemProps {
    colors: ThemeColors;
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    value?: boolean; // Solo para switch
    onAction: () => void;
    type: 'switch' | 'button';
    accessibilityHint?: string;
}

const SecurityItem = ({
    colors,
    label,
    icon,
    value,
    onAction,
    type,
    accessibilityHint
}: SecurityItemProps) => {

    // Renderizado del contenido interno para reutilizar
    const InnerContent = () => (
        <>
            <View style={styles.itemLeft}>
                <View style={[styles.iconBg, { backgroundColor: colors.surfaceSecondary }]}>
                    <MaterialIcons
                        name={icon}
                        size={22}
                        color={colors.income}
                        importantForAccessibility="no"
                    />
                </View>
                <View style={styles.textContainer}>
                    <Text
                        style={[styles.settingLabel, { color: colors.text }]}
                        maxFontSizeMultiplier={2} // Permite crecer pero no romper infinitamente
                    >
                        {label}
                    </Text>
                </View>
            </View>

            {type === 'switch' ? (
                <Switch
                    value={value}
                    onValueChange={onAction}
                    trackColor={{ false: colors.border, true: colors.income + '80' }}
                    thumbColor={value ? colors.accent : colors.textSecondary}
                    ios_backgroundColor={colors.border}
                    // Accesibilidad del Switch
                    accessibilityLabel={label}
                    accessibilityHint={accessibilityHint || "Double tap to toggle setting"}
                />
            ) : (
                <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={colors.accent}
                    importantForAccessibility="no"
                />
            )}
        </>
    );

    // Si es tipo botón, envolvemos todo en TouchableOpacity
    if (type === 'button') {
        return (
            <TouchableOpacity
                onPress={onAction}
                style={[styles.settingItem, { borderBottomColor: colors.border }]}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityHint={accessibilityHint}
            >
                <InnerContent />
            </TouchableOpacity>
        );
    }

    // Si es switch, usamos View (el Switch maneja el touch)
    return (
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <InnerContent />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 10,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            }
        }),
        borderWidth: 0.5,
    },
    headerRow: {
        marginBottom: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '300',
    },
    listContainer: {
        gap: 4,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16, // Aumentado ligeramente para mejor área táctil
        borderBottomWidth: StyleSheet.hairlineWidth,
        minHeight: 60, // Altura mínima para accesibilidad
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16, // Espacio entre icono y texto
        flex: 1, // CLAVE: Permite que el texto ocupe el espacio y empuje al switch
        paddingRight: 12, // Evita que el texto toque el switch
    },
    iconBg: {
        width: 40, // Tamaño fijo para alineación
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0, // Evita que el icono se aplaste
    },
    textContainer: {
        flex: 1, // Permite que el texto haga wrap
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
        flexWrap: 'wrap', // Permite múltiples líneas
    },
});