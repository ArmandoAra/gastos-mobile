import React from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    StyleSheet 
} from 'react-native';
import Animated, { FadeIn, FadeInLeft } from 'react-native-reanimated';

interface DescriptionInputProps {
    description: string;
    setDescription: (desc: string) => void;
}
const MAX_LENGTH = 120;

export default function DescriptionInput({ 
    description,
    setDescription
}: DescriptionInputProps) {


    return (
        <Animated.View 
            layout={FadeInLeft}

            // Animación escalonada (entra después de Category/Amount)
            entering={FadeInLeft.duration(300).delay(50)}
            style={styles.container}
        >
            {/* Label Superior */}
            <Text style={styles.label}>DESCRIPTION</Text>

            <View style={styles.inputWrapper}>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Add a description..."
                    placeholderTextColor="#9E9E9E"
                    multiline={true}
                    numberOfLines={3}
                    maxLength={MAX_LENGTH}
                    style={styles.input}
                    // Propiedades importantes para multiline en Android
                    textAlignVertical="top"
                    scrollEnabled={false} // Evita scroll interno si cabe en la altura
                />
                
                {/* Contador de caracteres discreto */}
                <Text style={styles.counter}>
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
        color: '#666', // text.secondary
        marginBottom: 4,
        fontWeight: '600',
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputWrapper: {
        width: '100%',
        backgroundColor: '#F5F5F7', // Gris muy claro (Estilo iOS)
        borderRadius: 16,
        padding: 16,
        // CERO SOMBRAS
        borderWidth: 1,
        borderColor: 'transparent',
    },
    input: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        minHeight: 80, // Altura mínima para simular rows={3}
        paddingTop: 0, // Reset padding nativo para alinear con el borde superior
    },
    counter: {
        position: 'absolute',
        bottom: 8,
        right: 12,
        fontSize: 10,
        color: '#AAA',
        fontWeight: '500',
    }
});