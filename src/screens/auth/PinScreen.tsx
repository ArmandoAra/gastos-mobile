
// ============================================
// PIN SCREEN

import { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useSettingsStore } from "../../stores/settingsStore";
import { styles } from "../../theme/styles2";

// ============================================
export const PinScreen = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const { setUnlocked } = useSettingsStore();

    const handlePinPress = (digit: string) => {
        if (pin.length < 4) {
            const newPin = pin + digit;
            setPin(newPin);

            if (newPin.length === 4) {
                // Validar PIN (demo: cualquier PIN de 4 dígitos funciona)
                setTimeout(() => {
                    if (newPin === '1234' || newPin.length === 4) {
                        setUnlocked(true);
                    } else {
                        setError('PIN incorrecto');
                        setPin('');
                    }
                }, 300);
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
        setError('');
    };

    return (
        <View style={styles.pinContainer}>
            <Text style={styles.pinTitle}>Ingresa tu PIN</Text>
            <Text style={styles.pinSubtitle}>Para acceder a tu información</Text>

            {/* PIN Dots */}
            <View style={styles.pinDots}>
                {[0, 1, 2, 3].map(index => (
                    <View
                        key={index}
                        style={[
                            styles.pinDot,
                            pin.length > index && styles.pinDotFilled
                        ]}
                    />
                ))}
            </View>

            {error ? <Text style={styles.pinError}>{error}</Text> : null}

            {/* PIN Keypad */}
            <View style={styles.pinKeypad}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <TouchableOpacity
                        key={num}
                        style={styles.pinKey}
                        onPress={() => handlePinPress(num.toString())}
                    >
                        <Text style={styles.pinKeyText}>{num}</Text>
                    </TouchableOpacity>
                ))}
                <View style={styles.pinKey} />
                <TouchableOpacity
                    style={styles.pinKey}
                    onPress={() => handlePinPress('0')}
                >
                    <Text style={styles.pinKeyText}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.pinKey}
                    onPress={handleDelete}
                >
                    <Text style={styles.pinKeyText}>⌫</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.pinBiometric}>
                <Text style={styles.pinBiometricText}>🔒 Usar biometría</Text>
            </TouchableOpacity>
        </View>
    );
};