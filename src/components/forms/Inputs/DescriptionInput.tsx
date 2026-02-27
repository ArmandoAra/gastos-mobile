import React from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    StyleSheet,
} from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { ThemeColors } from '../../../types/navigation';
import { useTranslation } from 'react-i18next';
import { globalStyles } from '../../../theme/global.styles';

interface DescriptionInputProps {
    isReady?: boolean;
    description: string;
    setDescription: (desc: string) => void;
    colors: ThemeColors;
}

const MAX_LENGTH = 120;

export default function DescriptionInput({ 
    isReady = true,
    description,
    setDescription,
    colors
}: DescriptionInputProps) {
    const { t } = useTranslation();

    return (
        <View 
            style={styles.container}
        >
            {/* Label Superior */}
            <Text
                style={[globalStyles.bodyTextSm, { color: colors.textSecondary, fontWeight: 'bold', marginBottom: 8, marginLeft: 4 }]}
                maxFontSizeMultiplier={1.5} // Evita que la etiqueta se vuelva gigante y rompa el ritmo
                numberOfLines={1}
            >
                {t('transactions.description', 'DESCRIPTION')}
            </Text>

            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {isReady &&
                    <Animated.View
                        entering={FadeInLeft.duration(300)}
                    >
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder={t('transactions.descriptionPlaceholder', 'Enter a description...')}
                    placeholderTextColor={colors.textSecondary}
                    multiline={true}
                    numberOfLines={3}
                    maxLength={MAX_LENGTH}
                            style={[globalStyles.inputLg, { color: colors.text }]}
                    textAlignVertical="top"
                    // Permitir scroll si el texto es muy grande para la caja
                    scrollEnabled={true}

                    // Accesibilidad
                    accessibilityLabel={t('transactions.description', 'Description')}
                    accessibilityHint={t('accessibility.description_hint', `Max ${MAX_LENGTH} characters`)}
                    // Importante para formularios en iOS
                            returnKeyType="default"
                />
                
                {/* Contador de caracteres */}
                {/* Usamos importantForAccessibility="no" para que TalkBack no lea "10 barra 120" cada vez que tocas el área */}
                <View
                    style={styles.counterContainer}
                    importantForAccessibility="no-hide-descendants"
                >
                    <Text
                                style={[globalStyles.amountXs, { color: colors.textSecondary }]}
                                maxFontSizeMultiplier={1.2}
                    >
                        {description.length}/{MAX_LENGTH}
                            </Text>
                        </View>
                    </Animated.View>

                }
            </View>


        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 0, // Separación del input anterior
    },
    inputWrapper: {
        minHeight: 120,
        width: '100%',
        borderRadius: 18,
        padding: 16,
        borderWidth: 0.5,
        position: 'relative',
    },
    counterContainer: {
        position: 'absolute',
        bottom: 8,
        right: 16,
        backgroundColor: 'transparent', // Asegura que no tape nada raro
    },
    counter: {
        fontSize: 10,
        fontFamily: 'FiraSans-Bold',
        opacity: 0.8,
    }
});