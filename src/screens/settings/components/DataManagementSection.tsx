import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView
} from 'react-native';
import Animated, {
    FadeIn,
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

// Imports de Archivos
import { File, Paths } from 'expo-file-system/next';
import * as FileSystem from 'expo-file-system'; // Necesario para leer URIs externas
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker'; // <--- NUEVO

import useDataStore from '../../../stores/useDataStore';
import { useAuthStore } from '../../../stores/authStore';

export default function DataManagementSection() {
    // Estados para controlar carga de botones independientemente
    const [isDownloading, setIsDownloading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const { user, updateUser } = useAuthStore();
    const {
        getAllTransactionsByUserId,
        getAllAccountsByUserId,
        setAllAccounts,
        setTransactions
    } = useDataStore();

    // --- ANIMACIONES ---
    const cloudY = useSharedValue(0);
    const uploadArrowY = useSharedValue(0);

    // Animación Descarga
    useEffect(() => {
        if (isDownloading) {
            cloudY.value = withRepeat(
                withSequence(withTiming(-5, { duration: 500 }), withTiming(0, { duration: 500 })),
                -1, true
            );
        } else {
            cancelAnimation(cloudY);
            cloudY.value = withTiming(0);
        }
    }, [isDownloading]);

    // Animación Subida (Importar)
    useEffect(() => {
        if (isUploading) {
            uploadArrowY.value = withRepeat(
                withSequence(withTiming(-5, { duration: 500 }), withTiming(0, { duration: 500 })),
                -1, true
            );
        } else {
            cancelAnimation(uploadArrowY);
            uploadArrowY.value = withTiming(0);
        }
    }, [isUploading]);

    const cloudStyle = useAnimatedStyle(() => ({ transform: [{ translateY: cloudY.value }] }));
    const uploadStyle = useAnimatedStyle(() => ({ transform: [{ translateY: uploadArrowY.value }] }));

    // ==========================================
    // 1. EXPORTAR DATOS (Tu código anterior)
    // ==========================================
    const handleDownloadData = async () => {
        setIsDownloading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!user?.id) return;

            const allAccounts = getAllAccountsByUserId(user.id);
            const allTransactions = getAllTransactionsByUserId(user.id);

            const data = {
                user,
                accounts: allAccounts,
                transactions: allTransactions,
                exportDate: new Date().toISOString()
            };

            const jsonData = JSON.stringify(data, null, 2);
            const fileName = `expense-backup-${new Date().getTime()}.json`;
            const file = new File(Paths.document, fileName);
            file.create();
            file.write(jsonData);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri, {
                    mimeType: 'application/json',
                    dialogTitle: 'Guardar Backup',
                    UTI: 'public.json'
                });
                Alert.alert("Éxito", "Backup exportado correctamente.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Falló la exportación.");
        } finally {
            setIsDownloading(false);
        }
    };

    // ==========================================
    // 2. IMPORTAR DATOS (NUEVO)
    // ==========================================
    const handleImportData = async () => {
        try {
            // 1. Abrir selector de archivos
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/json', 'public.json'],
                copyToCacheDirectory: true // Importante: copia el archivo a una ruta accesible (cache)
            });

            if (result.canceled) return;

            setIsUploading(true);

            // Obtenemos la URI del archivo seleccionado (que está en la caché de la app)
            const fileUri = result.assets[0].uri;
            console.log("Selected file URI:", fileUri);

            // 

            // 2. USO DE LA NUEVA API: Instanciar el objeto File
            // Pasamos la URI directamente. Al tener 'file://', la API sabe localizarlo.
            const file = new File(fileUri);

            // Leer el contenido como texto usando el método .text()
            const jsonContent = await file.text();

            console.log("Contenido leído con éxito");

            // 3. Parsear JSON
            const parsedData = JSON.parse(jsonContent);
            console.log("Datos parseados:", parsedData);

            // 4. Validar estructura básica
            if (!parsedData.accounts || !parsedData.transactions || !parsedData.user) {
                throw new Error("Formato de archivo inválido");
            }

            // 5. Confirmar acción
            Alert.alert(
                "Restaurar Datos",
                `Se importarán ${parsedData.accounts.length} cuentas y ${parsedData.transactions.length} transacciones. Esto sobrescribirá los datos actuales. ¿Continuar?`,
                [
                    { text: "Cancelar", style: "cancel", onPress: () => setIsUploading(false) },
                    {
                        text: "Restaurar",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                // 6. ACTUALIZAR STORES
                                if (parsedData.user) updateUser(parsedData.user);
                                if (Array.isArray(parsedData.accounts)) setAllAccounts(parsedData.accounts);
                                if (Array.isArray(parsedData.transactions)) setTransactions(parsedData.transactions);

                                await new Promise(resolve => setTimeout(resolve, 1000));
                                Alert.alert("Éxito", "Los datos han sido restaurados correctamente.");
                            } catch (e) {
                                Alert.alert("Error", "Hubo un problema procesando los datos.");
                            } finally {
                                setIsUploading(false);
                            }
                        }
                    }
                ]
            );

        } catch (error) {
            console.error("Error importando:", error);
            Alert.alert("Error", "No se pudo leer el archivo o el formato es incorrecto.");
            setIsUploading(false);
        }
    };

    return (
        <Animated.View
            entering={FadeIn.duration(500)}
            layout={LinearTransition.springify()}
            style={styles.container}
        >
            <View style={styles.headerRow}>
                <MaterialIcons name="storage" size={24} color="#667eea" style={{ marginRight: 8 }} />
                <Text style={styles.headerTitle}>Data Management</Text>
            </View>

            <Text style={styles.descriptionText}>
                Manage your application data locally. Export to keep a backup or import to restore your history.
            </Text>

            {/* BOTÓN DE DESCARGAR (EXPORT) */}
            <TouchableOpacity
                onPress={handleDownloadData}
                disabled={isDownloading || isUploading}
                activeOpacity={0.9}
                style={{ marginBottom: 16 }}
            >
                <Animated.View style={[
                    styles.actionCard,
                    styles.exportCard,
                    isDownloading && styles.cardDisabled
                ]}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(102, 126, 234, 0.1)' }]}>
                        <Animated.View style={cloudStyle}>
                            <MaterialIcons name="cloud-download" size={32} color="#667eea" />
                        </Animated.View>
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.actionTitle}>
                            {isDownloading ? 'Exporting...' : 'Export Backup'}
                        </Text>
                        <Text style={styles.actionSubtitle}>Save JSON file</Text>
                    </View>

                    <MaterialIcons name="chevron-right" size={24} color="#AAA" />
                </Animated.View>
            </TouchableOpacity>

            {/* BOTÓN DE SUBIR (IMPORT) */}
            <TouchableOpacity
                onPress={handleImportData}
                disabled={isDownloading || isUploading}
                activeOpacity={0.9}
            >
                <Animated.View style={[
                    styles.actionCard,
                    styles.importCard,
                    isUploading && styles.cardDisabled
                ]}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                        <Animated.View style={uploadStyle}>
                            <MaterialIcons name="cloud-upload" size={32} color="#10b981" />
                        </Animated.View>
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.actionTitle}>
                            {isUploading ? 'Restoring...' : 'Restore Backup'}
                        </Text>
                        <Text style={styles.actionSubtitle}>Import JSON file</Text>
                    </View>

                    <MaterialIcons name="chevron-right" size={24} color="#AAA" />
                </Animated.View>
            </TouchableOpacity>

        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        // Sutil elevación
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    descriptionText: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 20,
        lineHeight: 20,
    },
    // Tarjetas de Acción
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    exportCard: {
        backgroundColor: '#F8FAFC',
        borderColor: '#E2E8F0',
    },
    importCard: {
        backgroundColor: '#F0FDF4', // Verde muy claro
        borderColor: '#BBF7D0',
    },
    cardDisabled: {
        opacity: 0.6,
        backgroundColor: '#F1F5F9',
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#94a3b8',
    },
});