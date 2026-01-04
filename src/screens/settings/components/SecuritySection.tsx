import React, { useState } from 'react';
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
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeColors } from '../../../types/navigation';
import ChangePinModal from './ChangePinModal';
import { useAuthStore } from '../../../stores/authStore';
import useMessage from '../../../stores/useMessage';
import { MessageType } from '../../../interfaces/message.interface';
import { useSettingsStore } from '../../../stores/settingsStore';


interface SecuritySectionProps {
    colors: ThemeColors;
}


export default function SecuritySection({ 
    colors, 

}: SecuritySectionProps) {
    const { changePin, isBiometricEnabled, toggleBiometrics, isPinEnabled, togglePin, } = useAuthStore();


    const [isChangePinModalVisible, setChangePinModalVisible] = useState(false);
    const { showMessage } = useMessage();

    const handleChangePin = (oldPin: string, newPin: string) => {
        changePin(oldPin, newPin);
        setChangePinModalVisible(false);
        showMessage(MessageType.SUCCESS, 'PIN changed successfully');
        // Activar el modal de mensaje de exito o error si es necesario
    }

    // --- Componente interno para los items de seguridad ---


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
                    colors={colors}
                    label="Security PIN" 
                    icon="lock-outline" 
                    value={isPinEnabled} 
                    onToggle={togglePin} 
                />
                
                <SecurityItem 
                    colors={colors}
                    label="Enable Biometrics" 
                    icon="fingerprint" 
                    value={isBiometricEnabled} 
                    onToggle={toggleBiometrics} 
                />

                {/* Opción extra: Cambiar PIN (solo si está habilitado) */}
                {isPinEnabled && (
                    <TouchableOpacity onPress={() => setChangePinModalVisible(true)}>
                    <Animated.View entering={FadeIn}>
                        <SecurityItem 
                                colors={colors}
                            label="Change PIN Code" 
                            icon="password" 
                            onToggle={() => {}} // Aquí iría tu lógica de navegación
                            showChevron={true}
                        />
                    </Animated.View>
                    </TouchableOpacity>
                )}
            </View>

            <ChangePinModal
                visible={isChangePinModalVisible}
                onClose={() => setChangePinModalVisible(false)}
                onSave={handleChangePin}
                colors={colors} />
        </Animated.View>
    );
}

const SecurityItem = ({
    colors,
    label,
    icon,
    value,
    onToggle,
    showChevron = false
}: {
    colors: ThemeColors;
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