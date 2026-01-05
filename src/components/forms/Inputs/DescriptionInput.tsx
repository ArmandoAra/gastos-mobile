import React from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    StyleSheet,
    Platform
} from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { ThemeColors } from '../../../types/navigation';
import { useTranslation } from 'react-i18next';

interface DescriptionInputProps {
    description: string;
    setDescription: (desc: string) => void;
    colors: ThemeColors;
}

const MAX_LENGTH = 120;

export default function DescriptionInput({ 
    description,
    setDescription,
    colors
}: DescriptionInputProps) {
    const { t } = useTranslation();

    return (
        <Animated.View 
            layout={FadeInLeft} // Maneja cambios de layout suaves
            entering={FadeInLeft.duration(300).delay(50)}
            style={styles.container}
        >
            {/* Label Superior */}
            <Text
                style={[styles.label, { color: colors.textSecondary }]}
                maxFontSizeMultiplier={1.5} // Evita que la etiqueta se vuelva gigante y rompa el ritmo
                numberOfLines={1}
            >
                {t('transactions.description', 'DESCRIPTION')}
            </Text>

            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder={t('transactions.descriptionPlaceholder', 'Enter a description...')}
                    placeholderTextColor={colors.textSecondary}
                    multiline={true}
                    numberOfLines={3}
                    maxLength={MAX_LENGTH}
                    style={[styles.input, { color: colors.text }]}
                    textAlignVertical="top"
                    // Permitir scroll si el texto es muy grande para la caja
                    scrollEnabled={true}

                    // Accesibilidad
                    accessibilityLabel={t('transactions.description', 'Description')}
                    accessibilityHint={t('accessibility.description_hint', `Max ${MAX_LENGTH} characters`)}
                    // Importante para formularios en iOS
                    returnKeyType="default"
                    blurOnSubmit={true} 
                />
                
                {/* Contador de caracteres */}
                {/* Usamos importantForAccessibility="no" para que TalkBack no lea "10 barra 120" cada vez que tocas el área */}
                <View
                    style={styles.counterContainer}
                    importantForAccessibility="no-hide-descendants"
                >
                    <Text
                        style={[styles.counter, { color: colors.textSecondary }]}
                        maxFontSizeMultiplier={1.2}
                    >
                        {description.length}/{MAX_LENGTH}
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 0, // Separación del input anterior
    },
    label: {
        fontSize: 11, // Aumentado de 8px a 11px para legibilidad mínima
        fontWeight: '800',
        marginBottom: 6,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputWrapper: {
        width: '100%',
        borderRadius: 18,
        padding: 16,
        borderWidth: 1.5,
        // Eliminamos shadow para consistencia con el diseño plano
        position: 'relative',
    },
    input: {
        fontSize: 16,
        fontWeight: '500',
        minHeight: 80, // Altura base
        // CLAVE: Padding bottom extra para que el texto nunca escriba ENCIMA del contador
        paddingBottom: 20,
        paddingTop: 0,
    },
    counterContainer: {
        position: 'absolute',
        bottom: 8,
        right: 16,
        backgroundColor: 'transparent', // Asegura que no tape nada raro
    },
    counter: {
        fontSize: 10,
        fontWeight: '600',
        opacity: 0.8,
    }
});