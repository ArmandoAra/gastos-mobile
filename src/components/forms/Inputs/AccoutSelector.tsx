import React, { useState, useMemo } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Modal, 
    FlatList,
    Platform,
    AccessibilityInfo
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { ThemeColors } from '../../../types/navigation';
import { useTranslation } from 'react-i18next';
import { Account } from '../../../interfaces/data.interface';
import { AccountModalSelector } from './AccountModalSelector';
import { globalStyles } from '../../../theme/global.styles';


interface AccountSelectorProps {
    label: string;
    accountSelected: string;
    setAccountSelected: (account: string) => void;
    accounts: Account[];
    colors: ThemeColors;
}

export default function AccountSelector({
    label,
    accountSelected,
    setAccountSelected,
    accounts,
    colors
}: AccountSelectorProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    // Memoizar la cuenta seleccionada
    const selectedAccountObj = useMemo(() => {
        return accounts.find(acc => acc.id === accountSelected);
    }, [accountSelected, accounts]);

    return (
        <View style={styles.container}>
            {/* Label Superior */}
            <Text
                style={[styles.label, { color: colors.textSecondary }]}
                maxFontSizeMultiplier={1.5}
                importantForAccessibility="no"
            >
                {label}
            </Text>

            {/* Trigger (Botón que abre el modal) */}
            <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setIsOpen(true)}
                style={[
                    styles.inputTrigger,
                    { backgroundColor: colors.accentSecondary, borderColor: colors.border }
                ]}
                // Accesibilidad del Trigger
                accessibilityRole="button" // O "combobox" si prefieres
                accessibilityLabel={`${label}, ${selectedAccountObj ? selectedAccountObj.name : t('accounts.noSelectedAccount')}`}
                accessibilityHint="Double tap to change account"
            >
                <View style={globalStyles.accountSelectorTextContainer}>
                    <Text
                        style={[styles.inputText, { color: colors.text }]}
                        numberOfLines={1} // Mantiene 1 línea pero trunca con ...
                        ellipsizeMode="tail"
                    >
                        {selectedAccountObj?.name !== 'allAccounts' ? selectedAccountObj?.name : t('accounts.allAccounts')}
                    </Text>

                    {selectedAccountObj && (
                        <Text
                            style={[styles.inputTypeText, { color: colors.textSecondary }]}
                            numberOfLines={1}
                        >
                            {selectedAccountObj?.name !== 'allAccounts' ? selectedAccountObj.type : '--'}
                        </Text>
                    )}
                </View>

            </TouchableOpacity>

            {/* Modal de Selección */}
            <AccountModalSelector
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                accounts={accounts}
                accountSelected={accountSelected}
                setAccountSelected={setAccountSelected}
                colors={colors}
                label={label}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        // Aumentado de 8 a 12 para legibilidad mínima
        fontSize: 12,
        marginBottom: 6,
        fontFamily: 'FiraSans-Bold',
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Estilo del Input Trigger
    inputTrigger: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        paddingHorizontal: 16,
        minHeight: 64,
        paddingVertical: 12, // Padding vertical para cuando el texto crece
        borderWidth: 0.3,
    },
    inputText: {
        fontSize: 16,
        fontFamily: 'FiraSans-Regular',
    },
    inputTypeText: {
        fontSize: 13,
        marginTop: 2,
    },
    

});