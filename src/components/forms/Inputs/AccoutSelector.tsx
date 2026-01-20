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

    const handleSelect = (id: string) => {
        setAccountSelected(id);
        setIsOpen(false);
        // Feedback opcional para lectores de pantalla
        if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility("Account selected");
    };

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
                    { backgroundColor: colors.background, borderColor: colors.border }
                ]}
                // Accesibilidad del Trigger
                accessibilityRole="button" // O "combobox" si prefieres
                accessibilityLabel={`${label}, ${selectedAccountObj ? selectedAccountObj.name : t('accounts.noSelectedAccount')}`}
                accessibilityHint="Double tap to change account"
            >
                <View style={styles.textContainer}>
                    <Text
                        style={[styles.inputText, { color: colors.text }]}
                        numberOfLines={1} // Mantiene 1 línea pero trunca con ...
                        ellipsizeMode="tail"
                    >
                        {selectedAccountObj ? selectedAccountObj.name : t('accounts.noSelectedAccount')}
                    </Text>

                    {selectedAccountObj && (
                        <Text
                            style={[styles.inputTypeText, { color: colors.textSecondary }]}
                            numberOfLines={1}
                        >
                            {selectedAccountObj.type}
                        </Text>
                    )}
                </View>

                <MaterialIcons
                    name="arrow-drop-down"
                    size={28}
                    color={colors.textSecondary}
                    importantForAccessibility="no"
                />
            </TouchableOpacity>

            {/* Modal de Selección */}
            <Modal
                visible={isOpen}
                transparent
                animationType="none" // Usamos Reanimated
                onRequestClose={() => setIsOpen(false)}
            >
                {/* Backdrop Oscuro */}
                <Animated.View 
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    style={styles.modalBackdrop}
                >
                    {/* Botón invisible para cerrar al tocar fuera */}
                    <TouchableOpacity 
                        style={StyleSheet.absoluteFill} 
                        onPress={() => setIsOpen(false)} 
                        activeOpacity={1}
                        accessibilityLabel="Close selector"
                        accessibilityRole="button"
                    />

                    {/* Contenedor de la Lista */}
                    <Animated.View 
                        entering={ZoomIn.duration(250)}
                        exiting={ZoomOut.duration(200)}
                        style={[
                            styles.modalContent,
                            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }
                        ]}
                        // Accesibilidad del Modal
                        accessibilityViewIsModal={true}
                        accessibilityRole="list"
                    >
                        {/* Header del Modal */}
                        <View
                            style={[styles.modalHeader, { backgroundColor: colors.surface }]}
                            accessibilityRole="header"
                        >
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{label}</Text>

                            {/* Botón de cierre explícito para mejor accesibilidad */}
                            <TouchableOpacity
                                onPress={() => setIsOpen(false)}
                                style={{ padding: 8, borderRadius: 20, backgroundColor: colors.text }}
                                accessibilityRole="button"
                                accessibilityLabel="Close"
                            >
                                <MaterialIcons name="close" size={24} color={colors.surface} />
                            </TouchableOpacity>
                        </View>

                        {/* Lista de Opciones */}
                        <FlatList
                            data={accounts}
                            keyExtractor={(item) => item.id}
                            style={{ backgroundColor: colors.surfaceSecondary }}
                            contentContainerStyle={{ paddingVertical: 8 }}
                            renderItem={({ item }) => {
                                const isSelected = accountSelected === item.id;
                                return (
                                    <TouchableOpacity 
                                        style={[
                                            styles.optionItem,
                                            { backgroundColor: colors.surfaceSecondary },
                                            isSelected && { backgroundColor: colors.surface }
                                        ]}
                                        onPress={() => handleSelect(item.id)}

                                        // Accesibilidad de los Ítems
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: isSelected }}
                                        accessibilityLabel={`${item.name}, ${item.type}`}
                                        accessibilityHint={isSelected ? "Selected" : "Double tap to select"}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={[
                                                styles.optionText,
                                                { color: isSelected ? colors.accent : colors.textSecondary },
                                                isSelected && [styles.optionTextSelected, { color: colors.accent }]
                                            ]}>
                                                {item.name === 'allAccounts' ? t('accounts.allAccounts') : item.name}
                                            </Text>
                                            <Text style={[
                                                styles.optionSubText,
                                                { color: isSelected ? colors.accent : colors.textSecondary }
                                            ]}>
                                                {item.type}
                                            </Text>
                                        </View>
                                        
                                        {isSelected && (
                                            <MaterialIcons
                                                name="check-circle"
                                                size={24}
                                                color={colors.accent}
                                                importantForAccessibility="no"
                                            />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </Animated.View>
                </Animated.View>
            </Modal>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        // CLAVE: minHeight en lugar de height para permitir crecimiento
        minHeight: 64,
        paddingVertical: 12, // Padding vertical para cuando el texto crece
        borderWidth: 1,
    },
    textContainer: {
        flex: 1,
        marginRight: 10, // Espacio para no chocar con la flecha
    },
    inputText: {
        fontSize: 16,
        fontFamily: 'FiraSans-Regular',
    },
    inputTypeText: {
        fontSize: 13,
        marginTop: 2,
    },
    
    // Estilos del Modal
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)', 
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '70%', 
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 0.5,
        overflow: 'hidden',
        // Sombra para elevación
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)'
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Tinos-Bold',
    },
    // Estilos de la Lista
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // Aumentamos padding vertical para mejor touch target
        paddingVertical: 18, 
        paddingHorizontal: 20,
    },
    optionText: {
        fontSize: 16,
    },
    optionTextSelected: {
        fontFamily: 'FiraSans-Bold',
    },
    optionSubText: {
        fontSize: 13,
        marginTop: 4,
        textTransform: 'capitalize',
    }
});