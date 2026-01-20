import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, AccessibilityInfo, KeyboardAvoidingView } from 'react-native';
import Animated, { 
    FadeIn, 
    FadeOut, 
    ZoomIn, 
    ZoomOut 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors } from '../../../types/navigation';
import useDataStore from '../../../stores/useDataStore';
import AccountSelector from '../../../components/forms/Inputs/AccoutSelector';
import { useTranslation } from 'react-i18next';

interface WarningProps {
    accountToDelete: string;
    onClose: () => void;
    colors: ThemeColors;
}

const InfoText = ({ errorText }: { errorText: string }) => (
    <Animated.View 
        entering={FadeIn.delay(200)} 
        exiting={FadeOut}
        style={styles.infoTextContainer}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
    >
        <Text
            style={styles.infoText}
            maxFontSizeMultiplier={1.5}
        >
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

    const account = allAccounts.find(acc => acc.id === accountToDelete);
    const accountName = account?.name || '';

    const onDeleteAnyWay = () => {
        if (allAccounts.length <= 1) {
            const msg = t('accounts.cannotDeleteOnlyAccount', 'Cannot delete the only account');
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(msg);
            return;
        }
        deleteAccountStore(accountToDelete);
        onClose();
    };

    const onTransferAndDelete = async () => {
        if (toNewAccount === '' || toNewAccount === accountToDelete) {
            setShowInfo(true);
            const errorMsg = t('accounts.selectDifferentAccount', "Please select a different account to transfer data");
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(errorMsg);
            return;
        }

        try {
            transferAllAccountTransactions(accountToDelete, toNewAccount);
            deleteAccountStore(accountToDelete);
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    const isTransferDisabled = toNewAccount === accountToDelete || toNewAccount === '';

    return (
        // 1. KeyboardAvoidingView para que el teclado no tape el modal
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            pointerEvents="box-none"
        >
            {/* 2. ScrollView con flexGrow para centrado inteligente */}
            <ScrollView
                contentContainerStyle={[styles.scrollContent]}
                showsVerticalScrollIndicator={false}
                bounces={false}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View 
                    entering={ZoomIn} 
                    exiting={ZoomOut.duration(200)}
                    style={[styles.toast, { backgroundColor: colors.surface, borderColor: colors.expense }]}
                    accessibilityViewIsModal={true}
                    accessibilityRole="alert" // Cambiado a alert para semántica correcta
                >
                    <View style={styles.content}>
                        <View accessible={true} accessibilityLabel={`${t('commonWarnings.warning')}. ${t('accounts.accountName')}: ${accountName}`}>
                            <Text
                                style={[styles.title, { color: colors.error }]}
                                accessibilityRole="header"
                                maxFontSizeMultiplier={1.5}
                            >
                                {t('commonWarnings.warning')}
                            </Text>
                            <Text
                                style={[styles.accountName, { color: colors.text }]}
                                maxFontSizeMultiplier={1.5}
                            >
                                {t('accounts.accountName')}: {accountName}
                            </Text>
                            <Text
                                style={[styles.message, { color: colors.textSecondary }]}
                                maxFontSizeMultiplier={1.8}
                            >
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

                        {showInfo && (
                            <InfoText errorText={t('accounts.errorSelectAccount', "Please select an account to transfer.")} />
                        )}

                        <View style={styles.actions}>
                            <TouchableOpacity
                                onPress={onTransferAndDelete}
                                disabled={isTransferDisabled}
                                style={styles.buttonWrapper}
                                accessibilityRole="button"
                                accessibilityLabel={t('accounts.transferAndDelete')}
                                accessibilityState={{ disabled: isTransferDisabled }}
                            >
                                <LinearGradient
                                    colors={isTransferDisabled ? [colors.border, colors.border] : ['#14b8a6', '#10b981']}
                                    style={styles.button}
                                >
                                    <Text
                                        style={[styles.buttonText, { color: isTransferDisabled ? colors.textSecondary : colors.surface }]}
                                        maxFontSizeMultiplier={1.2}
                                    >
                                        {t('accounts.transferAndDelete')}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onDeleteAnyWay}
                                style={styles.buttonWrapper}
                                accessibilityRole="button"
                                accessibilityLabel={t('accounts.justDelete')}
                            >
                                <LinearGradient
                                    colors={['#ef4444', '#f87171']}
                                    style={styles.button}
                                >
                                    <Text
                                        style={[styles.buttonText, { color: colors.surface }]}
                                        maxFontSizeMultiplier={1.2}
                                    >
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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)', // Backdrop visual para dar contexto de modal
        zIndex: 999,
        justifyContent: 'center', // Alineación por defecto
    },
    scrollContent: {
        flexGrow: 1, 
        justifyContent: 'center', // Mantiene el modal centrado si es pequeño
        padding: 24,
        width: '100%',
    },
    toast: {
        width: "100%",
        maxWidth: 500,
        alignSelf: 'center',
        borderRadius: 24,
        borderWidth: 2,
        overflow: 'hidden',
        // Sombras
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    content: {
        padding: 24,
        alignItems: 'stretch'
    },
    title: {
        fontSize: 26,
        fontFamily: 'FiraSans-Bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    accountName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    selectorWrapper: {
        width: '100%',
        marginBottom: 20,
    },
    infoTextContainer: {
        width: '100%',
        marginBottom: 15,
        padding: 12,
        backgroundColor: 'rgba(255, 69, 58, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 69, 58, 0.2)',
    },
    infoText: {
        color: '#ff453a',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'FiraSans-Bold',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        gap: 12,
        flexWrap: 'wrap',
    },
    buttonWrapper: {
        flex: 1,
        minWidth: 140,
    },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 60, 
    },
    buttonText: {
        fontFamily: 'Tinos-Bold',
        fontSize: 14,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    closeBtn: {
        width: "100%",
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    closeBtnText: {
        fontSize: 16,
        fontFamily: 'Tinos-Bold',
    }
});