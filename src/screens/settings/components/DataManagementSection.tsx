import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import Animated, {
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    cancelAnimation,
    LinearTransition
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

// File System Next API
import { File, Paths } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

import useDataStore from '../../../stores/useDataStore';
import { useAuthStore } from '../../../stores/authStore';
import { ThemeColors } from '../../../types/navigation';

interface DataManagementProps {
    colors: ThemeColors;
}

export default function DataManagementSection({ colors }: DataManagementProps) {
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

    // --- EXPORTAR ---
    const handleDownloadData = async () => {
        if (!user?.id) return;
        setIsDownloading(true);
        try {
            const data = {
                user,
                accounts: getAllAccountsByUserId(user.id),
                transactions: getAllTransactionsByUserId(user.id),
                exportDate: new Date().toISOString()
            };

            const jsonData = JSON.stringify(data, null, 2);
            const fileName = `spendiary-backup-${Date.now()}.json`;

            // Usando File System Next
            const file = new File(Paths.cache, fileName);
            file.create();
            file.write(jsonData);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri, {
                    mimeType: 'application/json',
                    dialogTitle: 'Export Backup',
                    UTI: 'public.json'
                });
            }
        } catch (error) {
            Alert.alert("Error", "Failed to export data.");
        } finally {
            setIsDownloading(false);
        }
    };

    // --- IMPORTAR ---
    const handleImportData = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/json', 'public.json'],
                copyToCacheDirectory: true
            });

            if (result.canceled) return;
            setIsUploading(true);

            const file = new File(result.assets[0].uri);
            const jsonContent = await file.text();
            const parsedData = JSON.parse(jsonContent);

            if (!parsedData.accounts || !parsedData.transactions) {
                throw new Error("Invalid format");
            }

            Alert.alert(
                "Restore Data",
                "This will overwrite your current data. Do you want to proceed?",
                [
                    { text: "Cancel", style: "cancel", onPress: () => setIsUploading(false) },
                    { 
                        text: "Restore",
                        style: "destructive", 
                        onPress: () => {
                            if (parsedData.user) updateUser(parsedData.user);
                            setAllAccounts(parsedData.accounts);
                            setTransactions(parsedData.transactions);
                            setIsUploading(false);
                            Alert.alert("Success", "Data restored successfully.");
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert("Error", "Invalid backup file.");
            setIsUploading(false);
        }
    };

    return (
        <Animated.View
            entering={FadeIn.duration(500)}
            layout={LinearTransition.springify()}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
            <View style={styles.headerRow}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Data & Backup</Text>
            </View>

            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                Secure your information. Export a JSON backup or restore a previous session.
            </Text>

            <View style={styles.actionsContainer}>
                {/* EXPORT */}
                <TouchableOpacity
                    onPress={handleDownloadData}
                    disabled={isDownloading || isUploading}
                    activeOpacity={0.7}
                >
                    <View style={[styles.actionBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Animated.View style={[styles.iconCircle, cloudStyle, { backgroundColor: colors.surface }]}>
                            <MaterialIcons name="save" size={28} color={colors.income} />
                        </Animated.View>
                        <View style={styles.textWrapper}>
                            <Text style={[styles.actionTitle, { color: colors.text }]}>
                                {isDownloading ? 'Exporting...' : 'Export Data'}
                            </Text>
                            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Save to device</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* IMPORT */}
                <TouchableOpacity
                    onPress={handleImportData}
                    disabled={isDownloading || isUploading}
                    activeOpacity={0.7}
                >
                    <View style={[styles.actionBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Animated.View style={[styles.iconCircle, uploadStyle, { backgroundColor: colors.surface }]}>
                            <MaterialIcons name="restore" size={28} color={colors.income} />
                        </Animated.View>
                        <View style={styles.textWrapper}>
                            <Text style={[styles.actionTitle, { color: colors.text }]}>
                                {isUploading ? 'Restoring...' : 'Import Data'}
                            </Text>
                            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Restore backup</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 0.5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '300',
    },
    descriptionText: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 20,
    },
    actionsContainer: {
        gap: 12,
    },
    actionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        // Sutil sombra para el icono
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    textWrapper: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    actionSubtitle: {
        fontSize: 12,
    }
});