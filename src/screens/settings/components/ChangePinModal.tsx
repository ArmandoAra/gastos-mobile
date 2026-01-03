import React, { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Modal, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    Platform,
    TextInput
} from 'react-native';
import Animated, { ZoomIn, ZoomOut, FadeIn, FadeOut } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeColors } from '../../../types/navigation';

interface ChangePinModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (oldPin: string, newPin: string) => void;
    colors: ThemeColors;
}

export default function ChangePinModal({ visible, onClose, onSave, colors }: ChangePinModalProps) {
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        if (oldPin.length < 4 || newPin.length < 4) {
            setError("PIN must be 4 digits");
            return;
        }
        if (oldPin === newPin) {
            setError("New PIN must be different");
            return;
        }
        onSave(oldPin, newPin);
        setOldPin('');
        setNewPin('');
        setError(null);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                {/* Backdrop */}
                <TouchableOpacity 
                    style={StyleSheet.absoluteFill} 
                    activeOpacity={1} 
                    onPress={onClose}
                >
                    <View style={styles.backdrop} />
                </TouchableOpacity>

                <Animated.View 
                    entering={ZoomIn.duration(300)}
                    exiting={ZoomOut.duration(200)}
                    style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.accent + '15' }]}>
                            <MaterialIcons name="lock-reset" size={28} color={colors.accent} />
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>Change PIN</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Enter your current PIN and choose a new one.
                        </Text>
                    </View>

                    {/* Inputs */}
                    <View style={styles.form}>
                        {error && (
                            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Current PIN</Text>
                            <TextInput
                                style={[styles.pinInput, { 
                                    backgroundColor: colors.surfaceSecondary, 
                                    color: colors.text,
                                    borderColor: colors.border 
                                }]}
                                value={oldPin}
                                onChangeText={(val) => setOldPin(val.replace(/[^0-9]/g, ''))}
                                maxLength={4}
                                keyboardType="number-pad"
                                secureTextEntry
                                placeholder="****"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>New PIN</Text>
                            <TextInput
                                style={[styles.pinInput, { 
                                    backgroundColor: colors.surfaceSecondary, 
                                    color: colors.text,
                                    borderColor: colors.border 
                                }]}
                                value={newPin}
                                onChangeText={(val) => setNewPin(val.replace(/[^0-9]/g, ''))}
                                maxLength={4}
                                keyboardType="number-pad"
                                secureTextEntry
                                placeholder="****"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity 
                            onPress={onClose}
                            style={styles.cancelBtn}
                        >
                            <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={handleSave}
                            style={[styles.saveBtn, { backgroundColor: colors.accent }]}
                        >
                            <Text style={styles.saveBtnText}>Update PIN</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalContent: {
        width: '100%',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    form: {
        gap: 16,
        marginBottom: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 4,
    },
    pinInput: {
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        textAlign: 'center',
        fontSize: 24,
        letterSpacing: 10,
        fontWeight: 'bold',
    },
    errorText: {
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveBtn: {
        flex: 2,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 15,
    }
});