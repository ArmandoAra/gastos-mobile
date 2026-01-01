import React from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Platform,
    Switch
} from 'react-native';
import Animated, { 
    FadeIn, 
    Layout, 
    useAnimatedStyle, 
    withTiming, 
    interpolateColor 
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeColors } from '../../../types/navigation';

interface SecuritySectionProps {
    colors: ThemeColors;
    isPinEnabled: boolean;
    isBiometricEnabled: boolean;
    onTogglePin: () => void;
    onToggleBiometrics: () => void;
}

export default function SecuritySection({ 
    colors, 
    isPinEnabled, 
    isBiometricEnabled,
    onTogglePin,
    onToggleBiometrics 
}: SecuritySectionProps) {

    // --- Componente interno para los items de seguridad ---
    const SecurityItem = ({ 
        label, 
        icon, 
        value, 
        onToggle,
        showChevron = false 
    }: { 
        label: string; 
        icon: keyof typeof MaterialIcons.glyphMap; 
        value?: boolean; 
        onToggle: () => void;
        showChevron?: boolean;
    }) => (
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.itemLeft}>
                <View style={[styles.iconBg, { backgroundColor: colors.surfaceSecondary }]}>
                    <MaterialIcons name={icon} size={20} color={colors.income} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
            </View>
            
            {showChevron ? (
                <TouchableOpacity onPress={onToggle}>
                    <MaterialIcons name="chevron-right" size={24} color={colors.accent} />
                </TouchableOpacity>
            ) : (
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: colors.border, true: colors.income + '80' }}
                    thumbColor={value ? colors.accent : colors.textSecondary}
                    ios_backgroundColor={colors.border}
                />
            )}
        </View>
    );

    return (
        <Animated.View 
            entering={FadeIn.duration(500)}
            style={[
                styles.card, 
                { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border 
                }
            ]}
        >
            {/* --- HEADER --- */}
            <View style={styles.headerRow}>
                <View style={styles.titleContainer}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Security</Text>
                </View>
            </View>

            {/* --- ITEMS --- */}
            <View style={styles.listContainer}>
                <SecurityItem 
                    label="Security PIN" 
                    icon="lock-outline" 
                    value={isPinEnabled} 
                    onToggle={onTogglePin} 
                />
                
                <SecurityItem 
                    label="Enable Biometrics" 
                    icon="fingerprint" 
                    value={isBiometricEnabled} 
                    onToggle={onToggleBiometrics} 
                />

                {/* Opción extra: Cambiar PIN (solo si está habilitado) */}
                {isPinEnabled && (
                    <Animated.View entering={FadeIn}>
                        <SecurityItem 
                            label="Change PIN Code" 
                            icon="password" 
                            onToggle={() => {}} // Aquí iría tu lógica de navegación
                            showChevron={true}
                        />
                    </Animated.View>
                )}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 0.5,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
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
        marginTop: 5,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
});