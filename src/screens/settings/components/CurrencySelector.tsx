import React, { useState, useMemo } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Modal, 
    FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { ThemeColors } from '../../../types/navigation';
import i18n from '../../../i18n';

// 1. Definimos la interfaz para las opciones de moneda
export interface CurrencyOption {
    code: string;
    symbol: string;
    name: string;
}

// 2. Props del componente
interface CurrencySelectorProps {
    label: string;
    currencySelected: string; // Recibe el código (ej: 'USD')
    setCurrencySelected: (currencyCode: string) => void;
    currencies: CurrencyOption[]; // Pasamos el array de monedas
    colors: ThemeColors;
}

export default function CurrencySelector({
    label,
    currencySelected,
    setCurrencySelected,
    currencies,
    colors
}: CurrencySelectorProps) {
    const { t } = i18n;
    const [isOpen, setIsOpen] = useState(false);

    // Buscamos el objeto de la moneda seleccionada para mostrar en el trigger
    const selectedCurrencyObj = useMemo(() => {
        return currencies.find(c => c.code === currencySelected) || currencies[0];
    }, [currencySelected, currencies]);

    const handleSelect = (code: string) => {
        setCurrencySelected(code);
        setIsOpen(false);
    };

    return (
        <View style={styles.container}>
            {/* Label Superior */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>

            {/* Trigger (Botón Input) */}
            <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setIsOpen(true)}
                style={[styles.inputTrigger, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
                <View style={[styles.textContainer, { backgroundColor: colors.surface }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {/* Círculo con el símbolo de la moneda */}
                        <View style={[styles.symbolCircle, { backgroundColor: colors.surfaceSecondary }]}>
                            <Text style={[styles.symbolText, { color: colors.accent }]}>
                                {selectedCurrencyObj?.symbol}
                            </Text>
                        </View>
                        <View>
                            <Text style={[styles.inputText, { color: colors.text }]} numberOfLines={1}>
                                {selectedCurrencyObj ? selectedCurrencyObj.code : "Select Currency"}
                            </Text>
                            {selectedCurrencyObj && (
                                <Text style={[styles.inputTypeText, { color: colors.textSecondary }]}>
                                    {selectedCurrencyObj.name}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
                <MaterialIcons name="arrow-drop-down" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Modal de Selección */}
            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                {/* Backdrop Oscuro */}
                <Animated.View 
                    layout={FadeIn}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    style={styles.modalBackdrop}
                >
                    <TouchableOpacity 
                        style={StyleSheet.absoluteFill} 
                        onPress={() => setIsOpen(false)} 
                        activeOpacity={1}
                    />

                    {/* Contenedor de la Lista */}
                    <Animated.View 
                        layout={FadeIn}
                        entering={ZoomIn.duration(250)}
                        exiting={ZoomOut.duration(200)}
                        style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    >
                        {/* Header del Modal */}
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{label}</Text>
                            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>{t('currency.subtitle')}</Text>
                        </View>

                        {/* Lista de Opciones */}
                        <FlatList
                            data={currencies}
                            keyExtractor={(item) => item.code}
                            contentContainerStyle={{ paddingVertical: 8 }}
                            // 1. Indica que esta es una lista de selección
                            accessibilityRole="list"
                            renderItem={({ item }) => {
                                const isSelected = currencySelected === item.code;
                                return (
                                    <TouchableOpacity 
                                        // 2. Definir el rol como botón o radio button
                                        accessibilityRole="button"
                                        // 3. Informar el estado de selección al lector de pantalla
                                        accessibilityState={{ selected: isSelected }}
                                        // 4. Etiqueta descriptiva unificada
                                        accessibilityLabel={`${item.name}, moneda ${item.code}, símbolo ${item.symbol}`}
                                        // 5. Sugerencia de acción
                                        accessibilityHint={isSelected ? "" : "Toca dos veces para seleccionar esta moneda"}

                                        style={[
                                            styles.optionItem,
                                            isSelected && { backgroundColor: colors.surfaceSecondary }
                                        ]}
                                        onPress={() => handleSelect(item.code)}
                                    >
                                        <View
                                            // 6. Evitar que el lector de pantalla se detenga en cada texto interno
                                            // Tratamos el contenedor como una sola unidad
                                            importantForAccessibility="no-hide-descendants"
                                            style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
                                        >
                                            <View style={[
                                                styles.symbolCircleSmall,
                                                { backgroundColor: isSelected ? colors.accent : colors.surfaceSecondary }
                                            ]}>
                                                <Text style={[
                                                    styles.symbolTextSmall,
                                                    { color: isSelected ? '#FFF' : colors.text }
                                                ]}>
                                                    {item.symbol}
                                                </Text>
                                            </View>

                                            <View>
                                                <Text style={[
                                                    styles.optionText,
                                                    { color: isSelected ? colors.accent : colors.text },
                                                    isSelected && styles.optionTextSelected
                                                ]}>
                                                    {item.code}
                                                </Text>
                                                <Text style={[styles.optionSubText, { color: colors.textSecondary }]}>
                                                    {t(`currency.${item.code}`)}
                                                </Text>
                                            </View>
                                        </View>

                                        {isSelected && (
                                            <MaterialIcons
                                                name="check-circle"
                                                size={20}
                                                color={colors.accent}
                                                // El icono es decorativo porque el estado ya se lee en el Touchable
                                                accessibilityElementsHidden={true}
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
    },
    label: {
        fontSize: 10, // Un poco más legible que 8
        marginBottom: 6,
        fontWeight: '600',
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
        paddingHorizontal: 12, // Ajustado padding
        paddingVertical: 10,
        minHeight: 64,
        borderWidth: 1,
    },
    textContainer: {
        flex: 1,
    },
    inputText: {
        fontSize: 16,
        fontWeight: '600',
    },
    inputTypeText: {
        fontSize: 12,
        marginTop: 0,
    },
    // Estilos visuales extra para moneda
    symbolCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    symbolText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    
    // Estilos del Modal
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24, // Un poco más de margen lateral
    },
    modalContent: {
        width: '100%',
        maxHeight: '65%',
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
        // Sombra suave para darle profundidad sobre el backdrop
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    modalSubtitle: {
        position: 'relative',
        marginVertical: 4,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '400',
    },

    // Estilos de la Lista
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    symbolCircleSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    symbolTextSmall: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    optionText: {
        fontSize: 16,
    },
    optionTextSelected: {
        fontWeight: '700',
    },
    optionSubText: {
        fontSize: 12,
        marginTop: 2,
    }
});