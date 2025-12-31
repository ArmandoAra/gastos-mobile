import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Modal, 
    Platform 
} from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { ThemeColors } from '../../../types/navigation';

// Tipos definidos en tu app
type ViewMode = 'day' | 'month' | 'year';

interface FilterFloatingButtonProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    filter: string; // 'all' | 'income' | 'expense'
    setFilter: (filter: string) => void;
    colors: ThemeColors;
}

const COLORS = {
    glassBg: 'rgba(30, 41, 59, 0.9)', 
    modalBg: '#0f172a',
    border: 'rgba(255, 255, 255, 0.1)',
    text: '#ffffff',
    textMuted: '#94a3b8',
    activeGradient: ['#f97316', '#dc2626'] as [string, string], // Naranja a Rojo
};

export default function FilterFloatingButton({ 
    viewMode, 
    setViewMode, 
    filter, 
    setFilter,
    colors,
}: FilterFloatingButtonProps) {
    
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* --- BOTÓN FLOTANTE (Abajo Izquierda) --- */}
            <Animated.View 
                entering={FadeIn.delay(200)} 
                style={styles.floatingContainer}
            >
                <TouchableOpacity 
                    activeOpacity={0.8}
                    onPress={() => setIsOpen(true)}
                    style={[styles.fabButton, {
                        backgroundColor: isOpen ? colors.surface : colors.text,
                        borderColor: isOpen ? colors.text : colors.surface,
                        borderWidth: 0.4
                    }]}
                >
                    <Ionicons name="filter" size={24} color={colors.accent} />
                </TouchableOpacity>
            </Animated.View>

            {/* --- MODAL DE FILTROS --- */}
            <Modal
                visible={isOpen}
                transparent
                animationType="none"
                onRequestClose={() => setIsOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    {/* Backdrop */}
                    <TouchableOpacity 
                        style={StyleSheet.absoluteFill} 
                        activeOpacity={1} 
                        onPress={() => setIsOpen(false)}
                    >
                         {Platform.OS === 'ios' ? (
                            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        ) : (
                            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }} />
                        )}
                    </TouchableOpacity>

                    {/* Contenido */}
                    <Animated.View 
                        entering={ZoomIn.duration(200)}
                        exiting={ZoomOut.duration(200)}
                        style={[styles.modalContent, { borderColor: colors.border, backgroundColor: colors.surface }]}
                    >
                        <View style={styles.header}>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>Filters & View</Text>
                            <TouchableOpacity onPress={() => setIsOpen(false)}>
                                <Ionicons name="close-circle" size={32} color={colors.error} />
                            </TouchableOpacity>
                        </View>

                        {/* SECCIÓN 1: VIEW MODE */}
                        <Text style={[styles.sectionLabel, { color: colors.text }]}>Time Period</Text>
                        <View style={styles.selectorContainer}>
                            {(['day', 'month', 'year'] as ViewMode[]).map((mode) => {
                                const isActive = viewMode === mode;
                                return (
                                    <TouchableOpacity
                                        key={mode}
                                        onPress={() => {setViewMode(mode); setIsOpen(false);}}
                                        style={styles.optionWrapper}
                                    >
                                        {isActive ? (
                                            <LinearGradient
                                                colors={[colors.accent, colors.primary]}
                                                style={[styles.optionActive, { borderColor: colors.border }]}
                                            >
                                                <Text style={[styles.textActive, { color: colors.text }]}>
                                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                                </Text>
                                            </LinearGradient>
                                        ) : (
                                            <View style={styles.optionInactive}>
                                                    <Text style={[styles.textInactive, { color: colors.textSecondary }]}>
                                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* SECCIÓN 2: TIPO DE TRANSACCIÓN */}
                        <Text style={[styles.sectionLabel, { marginTop: 20 }, { color: colors.text }]}>Transaction Type</Text>
                        <View style={styles.selectorContainer}>
                            {['all', 'income', 'expense'].map((f) => {
                                const isActive = filter === f;
                                return (
                                    <TouchableOpacity
                                        key={f}
                                        onPress={() => {setFilter(f); setIsOpen(false);}}
                                        style={styles.optionWrapper}
                                    >
                                        {isActive ? (
                                            <LinearGradient
                                                colors={[colors.accent, colors.primary]}
                                                style={[styles.optionActive, { borderColor: colors.border }]}
                                            >
                                                <Text style={[styles.textActive, { color: colors.text }]}>
                                                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
                                                </Text>
                                            </LinearGradient>
                                        ) : (
                                            <View style={styles.optionInactive}>
                                                    <Text style={[styles.textInactive, { color: colors.textSecondary }]}>
                                                     {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    // Botón Flotante
    floatingContainer: {
        zIndex: 50,
    },
    fabButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    fabGradient: {
        flex: 1,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },

    // Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 24,
        padding: 24,
        borderWidth: 0.4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        marginBottom: 10,
        letterSpacing: 1,
    },
    
    // Selectores
    selectorContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    optionWrapper: {
        flex: 1,
        height: 40,
        borderRadius: 12,
    },
    optionActive: {
        borderWidth: 0.4,
        flex: 1,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionInactive: {
        flex: 1,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    textActive: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13,
    },
    textInactive: {
        fontWeight: '600',
        fontSize: 13,
    },
    // Footer
    applyButton: {
        marginTop: 24,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    }
});