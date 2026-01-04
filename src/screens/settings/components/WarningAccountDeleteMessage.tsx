import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, AccessibilityInfo } from 'react-native';
import Animated, { 
    FadeIn, 
    FadeOut, 
    ZoomIn, 
    ZoomOut 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

// Componentes
import { ThemeColors } from '../../../types/navigation';
import useDataStore from '../../../stores/useDataStore';
import AccountSelector from '../../../components/forms/Inputs/AccoutSelector';
import { useTranslation } from 'react-i18next';

interface WarningProps {
    accountToDelete: string;
    onClose: () => void;
    colors: ThemeColors;
}

// Subcomponente de error con Live Region para accesibilidad
const InfoText = ({ errorText }: { errorText: string }) => (
    <Animated.View 
        entering={FadeIn.delay(200)} 
        exiting={FadeOut}
        style={styles.infoTextContainer}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
    >
        <Text style={styles.infoText}>
            {errorText}
        </Text>
    </Animated.View>
);

export default function WarningAccountDeleteMessage({
    accountToDelete,
    onClose,
    colors
}: WarningProps) {
    const { 
        allAccounts, 
        deleteAccountStore, 
        updateAccountBalance, 
        transferAllAccountTransactions
    } = useDataStore();
    const { t } = useTranslation();
    const [toNewAccount, setToNewAccount] = useState<string>('');
    const [showInfo, setShowInfo] = useState<boolean>(false);

    const accountName = allAccounts.find(acc => acc.id === accountToDelete)?.name;

    const onDeleteAnyWay = () => {
        if (allAccounts.length <= 1) {
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility("Cannot delete the only account");
            return;
        }
        deleteAccountStore(accountToDelete);
        onClose();
    };

    const onTransferAndDelete = async () => {
        if (toNewAccount === '' || toNewAccount === accountToDelete) {
            setShowInfo(true);
            // Anuncio para lector de pantalla
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility("Please select a different account to transfer data");
            return;
        }

        try {
            transferAllAccountTransactions(accountToDelete, toNewAccount);
            updateAccountBalance(toNewAccount, 0); 
            deleteAccountStore(accountToDelete);
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    const isTransferDisabled = toNewAccount === accountToDelete || toNewAccount === '';

    return (
        <View style={styles.container} pointerEvents="box-none">
            {/* Usamos ScrollView por si el contenido crece mucho con texto grande */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View 
                    entering={ZoomIn} 
                    exiting={ZoomOut.duration(200)}
                    style={[styles.toast, { backgroundColor: colors.surface, borderColor: colors.expense }]}
                    accessibilityViewIsModal={true}
                    accessibilityRole="alert"
                >
                    <View style={styles.content}>
                        {/* Bloque de Texto Agrupado para lectura fluida */}
                        <View accessible={true}>
                            <Text
                                style={[styles.title, { color: colors.error }]}
                                accessibilityRole="header"
                            >
                                {t('commonWarnings.warning')}
                            </Text>
                            <Text style={[styles.accountName, { color: colors.error }]}>
                                {t('accounts.accountName')}: {accountName}
                            </Text>
                            <Text style={[styles.message, { color: colors.textSecondary }]}>
                                {t('accounts.deleteWarning')}
                            </Text>
                        </View>

                        <View style={styles.selectorWrapper}>
                            <AccountSelector
                                label={t('accounts.transferToAccount')}
                                accountSelected={toNewAccount}
                                setAccountSelected={setToNewAccount}
                                accounts={allAccounts.filter(a => a.id !== accountToDelete)}
                                colors={colors}
                            />
                        </View>

                        {showInfo && <InfoText errorText="Please select an account to transfer the transactions to." />}

                        <View style={styles.actions}>
                            <TouchableOpacity
                                onPress={onTransferAndDelete}
                                disabled={isTransferDisabled}
                                style={styles.buttonWrapper}
                                accessibilityRole="button"
                                accessibilityLabel={t('accounts.transferAndDelete')}
                                accessibilityHint="Transfers all transactions to selected account and deletes this one"
                                accessibilityState={{ disabled: isTransferDisabled }}
                            >
                                <LinearGradient
                                    colors={isTransferDisabled ? [colors.textSecondary, colors.textSecondary] : ['#14b8a6', '#10b981']}
                                    style={styles.button}
                                >
                                    <Text style={[styles.buttonText, { color: colors.surface }]}>
                                        {t('accounts.transferAndDelete')}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onDeleteAnyWay}
                                style={styles.buttonWrapper}
                                accessibilityRole="button"
                                accessibilityLabel={t('accounts.justDelete')}
                                accessibilityHint="Permanently deletes account and its transactions"
                            >
                                <LinearGradient
                                    colors={['#ef4444', '#f87171']}
                                    style={styles.button}
                                >
                                    <Text style={[styles.buttonText, { color: colors.surface }]}>
                                        {t('accounts.justDelete')}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={onClose}
                            style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
                            accessibilityRole="button"
                            accessibilityLabel={t('common.cancel')}
                        >
                            <Text style={[styles.closeBtnText, { color: colors.text }]}>
                                {t('common.cancel')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center', // Centrado vertical
        alignItems: 'center',

        zIndex: 999,
        // Eliminamos el top fijo para permitir centrado dinámico
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        maxWidth: 500, // Limite para tablets
    },
    toast: {
        width: "100%",
        borderRadius: 20,
        borderWidth: 1, // Borde más visible (antes 0.5)
        paddingHorizontal: 5,
        overflow: 'hidden',
        // Sombra para elevación
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 24, // Texto grande
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    accountName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22, // Mejor legibilidad
    },
    selectorWrapper: {
        width: '100%',
        marginBottom: 20,
    },
    infoTextContainer: {
        width: '100%',
        marginBottom: 15,
        padding: 10,
        backgroundColor: 'rgba(255, 69, 58, 0.1)', // Fondo rojo muy suave
        borderRadius: 8,
    },
    infoText: {
        color: '#ff453a',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        maxHeight: 70,
        gap: 12,
        flexWrap: 'wrap', // CLAVE: Permite que los botones se apilen si el texto es grande
    },
    buttonWrapper: {
        flex: 1,
        minWidth: 140, // Ancho mínimo antes de hacer wrap
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 8,
        height: '100%',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50, 
    },
    buttonText: {
        fontWeight: '700',
        fontSize: 14,
        textAlign: 'center',
    },
    closeBtn: {
        width: "100%",
        minHeight: 56, // Altura táctil
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        padding: 10,
    },
    closeBtnText: {
        fontSize: 16,
        fontWeight: '600'
    }
});