import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
    FadeIn, 
    FadeOut, 
    SlideInUp, 
    SlideOutUp, 
    ZoomIn, 
    ZoomOut 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';


// Componentes
import { ThemeColors } from '../../../types/navigation';
import useDataStore from '../../../stores/useDataStore';
import AccountSelector from '../../../components/forms/Inputs/AccoutSelector';

const { width } = Dimensions.get('window');

interface WarningProps {
    accountToDelete: string;
    message: string;
    onClose: () => void;
    colors: ThemeColors;
}

const InfoText = () => (
    <Animated.View 
        entering={FadeIn.delay(200)} 
        exiting={FadeOut}
        style={styles.infoTextContainer}
    >
        <Text style={styles.infoText}>
            Please select an account to transfer the transactions to.
        </Text>
    </Animated.View>
);

export default function WarningAccountDeleteMessage({
    accountToDelete,
    message,
    onClose,
    colors
}: WarningProps) {
    const { 
        allAccounts, 
        deleteAccountStore, 
        updateAccountBalance, 
        transferAllAccountTransactions,
        setTransactions 
    } = useDataStore();
    
    const [toNewAccount, setToNewAccount] = useState<string>('');
    const [showInfo, setShowInfo] = useState<boolean>(false);

    const accountName = allAccounts.find(acc => acc.id === accountToDelete)?.name;

    const onDeleteAnyWay = () => {
        if (allAccounts.length <= 1) return;
        deleteAccountStore(accountToDelete);
        onClose();
    };

    const onTransferAndDelete = async () => {
        console.log(toNewAccount)
        if (toNewAccount === '' || toNewAccount === accountToDelete) {
            setShowInfo(true);
            return;
        }

        try {
            transferAllAccountTransactions(accountToDelete, toNewAccount);
            updateAccountBalance(toNewAccount, 0); // Ajustar saldo si es necesario
            deleteAccountStore(accountToDelete);
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    const isTransferDisabled = toNewAccount === accountToDelete || toNewAccount === '';

    return (
            <View style={[styles.container]}>
                <Animated.View 
                    entering={ZoomIn} 
                    exiting={ZoomOut.duration(200)}
                    style={[styles.toast, { backgroundColor: colors.surface, borderColor: colors.expense }]}
                >
                        <View style={styles.content}>
                            <Text style={[styles.title, { color: colors.error }]}>Warning</Text>
                            <Text style={[styles.accountName, { color: colors.error }]}>Account: {accountName}</Text>
                            <Text style={[styles.message, { color: colors.error }]}>{message}</Text>

                            <View style={styles.selectorWrapper}>
                                <AccountSelector
                                    label="Select Target Account"
                                    accountSelected={toNewAccount}
                                    setAccountSelected={setToNewAccount}
                                    accounts={allAccounts.filter(a => a.id !== accountToDelete)}
                                    colors={colors}
                                />
                            </View>

                            {showInfo && <InfoText />}

                            <View style={styles.actions}>
                                <TouchableOpacity
                                    onPress={onTransferAndDelete}
                                    style={styles.buttonWrapper}
                                >
                                    <LinearGradient
                                        colors={isTransferDisabled ? [colors.textSecondary, colors.textSecondary] : ['#14b8a6', '#10b981']}
                                        style={styles.button}
                                    >
                                        <Text style={[styles.buttonText, { color: colors.text }]}>Transfer & Delete</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={onDeleteAnyWay}
                                    style={styles.buttonWrapper}
                                >
                                    <LinearGradient
                                        colors={['#ef4444', '#f87171']}
                                        style={styles.button}
                                    >
                                        <Text style={[styles.buttonText, { color: colors.text }]}>Delete Anyway</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                            
                            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, {backgroundColor: colors.income}]}>
                                <Text style={{color: colors.surface, fontSize: 18, fontWeight: '500'}}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                </Animated.View>
            </View>);
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        flex: 1,
        position: 'absolute',
        top: 150,
        padding: 8,
    },
    toast: {
        width: "100%",
        borderRadius: 20,
        borderWidth: 0.5,
        paddingHorizontal: 5,
        borderColor: 'rgba(215, 35, 35, 0.8)',
        overflow: 'hidden',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    accountName: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
    },
    message: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    selectorWrapper: {
        width: '100%',
        marginBottom: 15,
    },
    infoTextContainer: {
        width: '100%',
        marginBottom: 15,
    },
    infoText: {
        color: '#ff453a',
        fontSize: 13,
        textAlign: 'center',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 10,
    },
    buttonWrapper: {
        flex: 1,
    },
    button: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 13,
    },
    closeBtn: {
        width: "100%",
        height: 64,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        padding: 10,
    }
});