import React from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    StyleSheet 
} from 'react-native';
import Animated, { FadeIn, FadeInLeft } from 'react-native-reanimated';
import { ThemeColors } from '../../../types/navigation';

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


    return (
        <Animated.View 
            layout={FadeInLeft}

            // Animación escalonada (entra después de Category/Amount)
            entering={FadeInLeft.duration(300).delay(50)}
            style={styles.container}
        >
            {/* Label Superior */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>DESCRIPTION</Text>

            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Add a description..."
                    placeholderTextColor={colors.textSecondary}
                    multiline={true}
                    numberOfLines={3}
                    maxLength={MAX_LENGTH}
                    style={[styles.input, { color: colors.text }]}
                    textAlignVertical="top"
                    scrollEnabled={false} // Evita scroll interno si cabe en la altura
                />
                
                {/* Contador de caracteres discreto */}
                <Text style={[styles.counter, { color: colors.textSecondary }]}>
                    {description.length}/{MAX_LENGTH}
                </Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        fontSize: 8,
        marginBottom: 4,
        fontWeight: '600',
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputWrapper: {
        width: '100%',
        borderRadius: 16,
        padding: 16,
        // CERO SOMBRAS
        borderWidth: 1,
        borderColor: 'transparent',
    },
    input: {
        fontSize: 16,
        fontWeight: '500',
        minHeight: 80, // Altura mínima para simular rows={3}
        paddingTop: 0, // Reset padding nativo para alinear con el borde superior
    },
    counter: {
        position: 'absolute',
        bottom: 8,
        right: 12,
        fontSize: 10,
        fontWeight: '500',
    }
});