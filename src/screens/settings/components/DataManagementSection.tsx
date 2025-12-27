import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform
} from 'react-native';
import Animated, {
    FadeIn,
    Layout,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
    cancelAnimation,
    LinearTransition
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function DataManagementSection() {
    // 1. Estado
    const [isDownloading, setIsDownloading] = useState(false);

    // 2. Valores de Animación (Icono de Nube)
    const cloudY = useSharedValue(0);

    // 3. Efecto para la animación de rebote cuando descarga
    useEffect(() => {
        if (isDownloading) {
            cloudY.value = withRepeat(
                withSequence(
                    withTiming(-5, { duration: 500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) })
                ),
                -1, // Infinito
                true // Reverse
            );
        } else {
            cancelAnimation(cloudY);
            cloudY.value = withTiming(0);
        }
    }, [isDownloading]);

    const cloudAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: cloudY.value }]
    }));

    // 4. Lógica de Descarga (File System + Sharing)
    const handleDownloadData = async () => {
        setIsDownloading(true);

        try {
            // Simular retardo de red/procesamiento
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Datos de ejemplo (Igual que en tu código web)
            const data = {
                user: {
                    name: "Armando Arano",
                    email: "armandoaranopla@gmail.com",
                    created: new Date().toISOString()
                },
                accounts: [
                    { name: "Main Checking", type: "Checking", balance: 5420.50 },
                    { name: "Savings", type: "Savings", balance: 15000.00 }
                ],
                transactions: [
                    { date: "2024-01-15", description: "Grocery", amount: -85.50 },
                    { date: "2024-01-14", description: "Salary", amount: 3000.00 }
                ],
                exportDate: new Date().toISOString()
            };
            const fileName = `expense-tracker-data-${new Date().toISOString()}.json`;
            const file = new File(Paths.document, fileName );
            file.create()
            Alert.alert("Success", "Data exported successfully!");

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to export data");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Animated.View
            entering={FadeIn.duration(500)}
            layout={LinearTransition.springify()}
            style={styles.card}
        >
            {/* Header de Sección */}
            <View style={styles.headerRow}>
                <MaterialIcons name="storage" size={24} color="#667eea" style={{ marginRight: 8 }} />
                <Text style={styles.headerTitle}>Data Management</Text>
            </View>

            <Text style={styles.descriptionText}>
                Export all your data including accounts, transactions, and settings. Your data will be downloaded as a JSON file.
            </Text>

            {/* Tarjeta de Acción (Botón Gigante) */}
            <TouchableOpacity
                onPress={handleDownloadData}
                disabled={isDownloading}
                activeOpacity={0.9}
            >
                <Animated.View style={[
                    styles.downloadCard,
                    isDownloading && styles.downloadCardDisabled
                ]}>
                    {/* Icono Circular */}
                    <View style={styles.iconCircle}>
                        <Animated.View style={cloudAnimatedStyle}>
                            <MaterialIcons name="cloud-download" size={32} color="#667eea" />
                        </Animated.View>
                    </View>

                    {/* Textos */}
                    <View style={styles.textContainer}>
                        <Text style={styles.actionTitle}>
                            {isDownloading ? 'Preparing your data...' : 'Download All Data'}
                        </Text>
                        <Text style={styles.actionSubtitle}>
                            Export your complete data in JSON format
                        </Text>
                    </View>

                    {/* Botón Pequeño */}
                    <View style={[
                        styles.smallButton,
                        isDownloading ? styles.smallButtonDisabled : styles.smallButtonActive
                    ]}>
                        <MaterialIcons name="download" size={18} color="#FFF" style={{ marginRight: 4 }} />
                        <Text style={styles.smallButtonText}>
                            {isDownloading ? 'Downloading...' : 'Download'}
                        </Text>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        // Sombras
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    descriptionText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
        lineHeight: 20,
    },
    // Zona de descarga
    downloadCard: {
        backgroundColor: '#F8F9FA', // background.default
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#667eea',
        borderStyle: 'dashed', // Borde discontinuo
        padding: 16,
        flexDirection: 'column', // En móvil, columna suele ser mejor si hay poco espacio, o row si hay suficiente
        alignItems: 'center',
        gap: 16,
    },
    downloadCardDisabled: {
        borderColor: '#BDBDBD',
        backgroundColor: '#FAFAFA',
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(102, 126, 234, 0.1)', // primary.light + opacity
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
        textAlign: 'center',
    },
    actionSubtitle: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
    },
    // Botón interno
    smallButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    smallButtonActive: {
        backgroundColor: '#667eea',
    },
    smallButtonDisabled: {
        backgroundColor: '#BDBDBD',
    },
    smallButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    // Info Box
    infoBox: {
        marginTop: 24,
        padding: 16,
        backgroundColor: 'rgba(33, 150, 243, 0.08)', // info light opacity
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(33, 150, 243, 0.3)',
    },
    infoText: {
        fontSize: 12,
        color: '#0c5460', // info dark
        lineHeight: 18,
    },
});