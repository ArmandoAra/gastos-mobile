import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
    AccessibilityInfo
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


import * as FileSystem from 'expo-file-system/legacy';
// File System Next API
import { File, Paths } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

import useDataStore from '../../../stores/useDataStore';
import { useAuthStore } from '../../../stores/authStore';
import { ThemeColors } from '../../../types/navigation';
import { useTranslation } from 'react-i18next';
import useMessage from '../../../stores/useMessage';
import { MessageType } from '../../../interfaces/message.interface';
import useBudgetStore from '../../../stores/useBudgetStore';
import useCategoriesStore from '../../../stores/useCategoriesStore';


interface DataManagementProps {
    colors: ThemeColors;
}

export default function DataManagementSection({ colors }: DataManagementProps) {
    const { t } = useTranslation();
    const [isDownloading, setIsDownloading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { showMessage } = useMessage();

    const { user, updateUser } = useAuthStore();
    const {
        getUserTransactions,
        getUserAccounts,
        setAllAccounts,
        syncAccountsWithTransactions,
        setTransactions
    } = useDataStore();
    const { getUserBudgets, getUserItems, setBudgets, setItems } = useBudgetStore();
    const { getUserCategories, setCategories } = useCategoriesStore();   

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

    const saveFileToDevice = async (): Promise<boolean> => {
        if (!user?.id) return false;

        const data = {
            user,
            accounts: getUserAccounts(),
            transactions: getUserTransactions(),
            budgets: getUserBudgets(),
            items: getUserItems(),
            categories: getUserCategories(),
            exportDate: new Date().toISOString()
        };

        const jsonData = JSON.stringify(data, null, 2);
        const fileName = `spendiary-backup-${Date.now()}.json`;

        try {
            if (Platform.OS === 'android') {
                const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

                if (!permissions.granted) {
                    return false; // El usuario canceló
                }

                const directoryUri = permissions.directoryUri;

                // 2. CREAR EL ARCHIVO
                // createFileAsync maneja automáticamente si el archivo ya existe (añade (1), (2), etc.)
                // mimeType 'application/json' es importante para que Android sepa cómo abrirlo.
                const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                    directoryUri,
                    fileName,
                    'application/json'
                );

                // 3. ESCRIBIR EL CONTENIDO
                await FileSystem.writeAsStringAsync(fileUri, jsonData, {
                    encoding: FileSystem.EncodingType.UTF8,
                });

                return true;

            } else {
                // PARA IOS:
                // iOS no tiene un "SAF" igual. Lo guardamos en documentos y luego
                // delegamos al usuario que decida qué hacer (Guardar en Archivos / Compartir).
                // Nota: En iOS normalmente se usa Sharing.shareAsync después de esto.
                const fileUri = FileSystem.documentDirectory + fileName;
                await FileSystem.writeAsStringAsync(fileUri, jsonData, {
                    encoding: FileSystem.EncodingType.UTF8,
                });

                // Aquí retornaríamos la URI o true para que el componente llame a Sharing
                return true;
            }
        } catch (error) {
            console.error('Error en saveFileToDevice:', error);
            return false;
        }
    };
    // --- EXPORTAR ---
    const handleDownloadData = async () => {
        if (!user?.id) return;
        setIsDownloading(true);
        if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(t('dataAndBackup.exporting'));

        try {
            const data = {
                user,
                accounts: getUserAccounts(),
                transactions: getUserTransactions(),
                budgets: getUserBudgets(),
                items: getUserItems(),
                categories: getUserCategories(),
                exportDate: new Date().toISOString()
            };

            const jsonData = JSON.stringify(data, null, 2);
            const fileName = `spendiary-backup-${Date.now()}.json`;

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
            showMessage(MessageType.SUCCESS, t('dataAndBackup.exportSuccess'));
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(t('dataAndBackup.exportSuccess'));
        } catch (error) {
            showMessage(MessageType.ERROR, t('dataAndBackup.exportError'));
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(t('accessibility.exportFailed'));
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
                t('dataAndBackup.restoreData', "Restore Data"),
                t('dataAndBackup.restoreWarning', "This will overwrite your current data. Do you want to proceed?"),
                [
                    { text: t('common.cancel'), style: "cancel", onPress: () => setIsUploading(false) },
                    { 
                        text: t('common.restore', "Restore"),
                        style: "destructive", 
                        onPress: () => {
                            if (parsedData.user) updateUser(parsedData.user);
                            setAllAccounts(parsedData.accounts);
                            setTransactions(parsedData.transactions);
                            setBudgets(parsedData.budgets || []);
                            setItems(parsedData.items || []);
                            setCategories(parsedData.categories || []);
                            handleSyncAccounts();
                            setIsUploading(false);
                            showMessage(MessageType.SUCCESS, t('dataAndBackup.importSuccess'));
                            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(t('dataAndBackup.importSuccess'));
                        }
                    }
                ]
            );
        } catch (error) {
            showMessage(MessageType.ERROR, t('dataAndBackup.importError'));
            setIsUploading(false);
        }
    };

    const handleSyncAccounts = () => {
        // Anuncio de inicio
        if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(t('dataAndBackup.syncing_accounts'));
        syncAccountsWithTransactions();
        setTimeout(() => {
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(t('dataAndBackup.sync_complete', "Sync complete"));
        }, 1000);
    }

    return (
        <Animated.View
            entering={FadeIn.duration(500)}
            layout={LinearTransition.springify()}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
            <View style={styles.headerRow} accessibilityRole="header">
                <Text
                    style={[styles.headerTitle, { color: colors.text }]}
                    maxFontSizeMultiplier={1.5}
                >
                    {t('dataAndBackup.tileHeader')}
                </Text>
            </View>

            <Text
                style={[styles.descriptionText, { color: colors.textSecondary }]}
                maxFontSizeMultiplier={1.5}
            >
                {t('dataAndBackup.backupSubtitle')}
            </Text>

            <View style={styles.actionsContainer}>
                {/* SAVE BUTTON */}
                <TouchableOpacity
                    onPress={saveFileToDevice}
                    disabled={isDownloading || isUploading}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={isDownloading ? t('dataAndBackup.saving') : t('dataAndBackup.save')}
                    accessibilityHint={t('accessibility.export_data', "Exports app data to a backup file")}
                    accessibilityState={{ busy: isDownloading, disabled: isDownloading || isUploading }}
                >
                    <View style={[styles.actionBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Animated.View
                            style={[styles.iconCircle, cloudStyle, { backgroundColor: colors.surfaceSecondary }]}
                            importantForAccessibility="no"
                        >
                            <MaterialIcons name="save" size={28} color={colors.income} />
                        </Animated.View>
                        <View style={styles.textWrapper}>
                            <Text
                                style={[styles.actionTitle, { color: colors.text }]}
                                maxFontSizeMultiplier={1.5}
                            >
                                {isDownloading ? t('dataAndBackup.saving') : t('dataAndBackup.save')}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* EXPORT BUTTON */}
                <TouchableOpacity
                    onPress={handleDownloadData}
                    disabled={isDownloading || isUploading}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={isDownloading ? t('dataAndBackup.Sharing') : t('dataAndBackup.share')}
                    accessibilityHint={t('accessibility.export_data', "Exports app data to a backup file")}
                    accessibilityState={{ busy: isDownloading, disabled: isDownloading || isUploading }}
                >
                    <View style={[styles.actionBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Animated.View
                            style={[styles.iconCircle, cloudStyle, { backgroundColor: colors.surfaceSecondary }]}
                            importantForAccessibility="no"
                        >
                            <MaterialIcons name="share" size={28} color={colors.income} />
                        </Animated.View>
                        <View style={styles.textWrapper}>
                            <Text
                                style={[styles.actionTitle, { color: colors.text }]}
                                maxFontSizeMultiplier={1.5}
                            >
                                {isDownloading ? t('dataAndBackup.sharing') : t('dataAndBackup.share')}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* IMPORT BUTTON */}
                <TouchableOpacity
                    onPress={handleImportData}
                    disabled={isDownloading || isUploading}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={isUploading ? t('dataAndBackup.importing') : t('dataAndBackup.import')}
                    accessibilityHint={t('accessibility.restore_data', "Imports data from a backup file, overwriting current data")}
                    accessibilityState={{ busy: isUploading, disabled: isDownloading || isUploading }}
                >
                    <View style={[styles.actionBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Animated.View
                            style={[styles.iconCircle, uploadStyle, { backgroundColor: colors.surfaceSecondary }]}
                            importantForAccessibility="no"
                        >
                            <MaterialIcons name="restore" size={28} color={colors.income} />
                        </Animated.View>
                        <View style={styles.textWrapper}>
                            <Text
                                style={[styles.actionTitle, { color: colors.text }]}
                                maxFontSizeMultiplier={1.5}
                            >
                                {isUploading ? t('dataAndBackup.importing') : t('dataAndBackup.import')}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 10,
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
        fontFamily: 'FiraSans-Regular',
    },
    descriptionText: {
        fontSize: 14, // Ligeramente más grande para legibilidad
        lineHeight: 20,
        marginBottom: 20,
    },
    actionsContainer: {
        gap: 12,
    },
    actionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16, 
        borderRadius: 12,
        borderWidth: 1,
        minHeight: 80
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16, // Espacio aumentado
        // Sutil sombra para el icono
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    textWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    actionTitle: {
        fontSize: 16,
        fontFamily: 'FiraSans-Bold',
        flexWrap: 'wrap', // Permite que el texto baje si es necesario
    },
});