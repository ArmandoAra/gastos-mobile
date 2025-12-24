// ACCOUNT FORM COMPONENT
// ============================================
import { useState } from 'react';
import { TextInput, TouchableOpacity, View, Text, StyleSheet } from 'react-native';

interface AccountFormProps {
    initialValues?: {
        name: string;
        type: 'checking' | 'savings' | 'cash';
    };
    onSubmit: (values: { name: string; type: 'checking' | 'savings' | 'cash' }) => void;
    onCancel?: () => void;
    submitText?: string;
}

export const AccountForm: React.FC<AccountFormProps> = ({
    initialValues,
    onSubmit,
    onCancel,
    submitText = 'Guardar',
}) => {
    const [name, setName] = useState(initialValues?.name || '');
    const [type, setType] = useState<'checking' | 'savings' | 'cash'>(
        initialValues?.type || 'checking'
    );
    const [errors, setErrors] = useState({ name: '' });

    const handleSubmit = () => {
        if (!name.trim()) {
            setErrors({ name: 'El nombre es requerido' });
            return;
        }

        onSubmit({ name, type });
    };

    return (
        <View style={accountFormStyles.container}>
            <View style={accountFormStyles.inputGroup}>
                <Text style={accountFormStyles.label}>Nombre de la cuenta</Text>
                <TextInput
                    style={[accountFormStyles.input, errors.name && accountFormStyles.inputError]}
                    placeholder="Ej: Cuenta Principal"
                    value={name}
                    onChangeText={(text) => {
                        setName(text);
                        setErrors({ name: '' });
                    }}
                />
                {errors.name ? (
                    <Text style={accountFormStyles.errorText}>{errors.name}</Text>
                ) : null}
            </View>

            <View style={accountFormStyles.inputGroup}>
                <Text style={accountFormStyles.label}>Tipo de cuenta</Text>
                <View style={accountFormStyles.typeSelector}>
                    <TouchableOpacity
                        style={[
                            accountFormStyles.typeBtn,
                            type === 'checking' && accountFormStyles.typeBtnActive,
                        ]}
                        onPress={() => setType('checking')}
                    >
                        <Text style={accountFormStyles.typeBtnIcon}>💳</Text>
                        <Text style={accountFormStyles.typeBtnText}>Corriente</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            accountFormStyles.typeBtn,
                            type === 'savings' && accountFormStyles.typeBtnActive,
                        ]}
                        onPress={() => setType('savings')}
                    >
                        <Text style={accountFormStyles.typeBtnIcon}>🏦</Text>
                        <Text style={accountFormStyles.typeBtnText}>Ahorros</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            accountFormStyles.typeBtn,
                            type === 'cash' && accountFormStyles.typeBtnActive,
                        ]}
                        onPress={() => setType('cash')}
                    >
                        <Text style={accountFormStyles.typeBtnIcon}>💵</Text>
                        <Text style={accountFormStyles.typeBtnText}>Efectivo</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={accountFormStyles.buttons}>
                {onCancel && (
                    <TouchableOpacity
                        style={[accountFormStyles.button, accountFormStyles.buttonCancel]}
                        onPress={onCancel}
                    >
                        <Text style={accountFormStyles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[accountFormStyles.button, accountFormStyles.buttonSubmit]}
                    onPress={handleSubmit}
                >
                    <Text style={[accountFormStyles.buttonText, { color: 'white' }]}>
                        {submitText}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const accountFormStyles = StyleSheet.create({
    container: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#424242',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
    },
    inputError: {
        borderColor: '#EF5350',
    },
    errorText: {
        color: '#EF5350',
        fontSize: 12,
        marginTop: 4,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 8,
    },
    typeBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    typeBtnActive: {
        backgroundColor: '#E8DEF8',
        borderColor: '#6200EE',
    },
    typeBtnIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    typeBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#424242',
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonCancel: {
        backgroundColor: '#F5F5F5',
    },
    buttonSubmit: {
        backgroundColor: '#6200EE',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#424242',
    },
});