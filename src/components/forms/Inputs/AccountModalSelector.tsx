import { MaterialIcons } from "@expo/vector-icons";
import { t } from "i18next";
import { Modal, TouchableOpacity, View, FlatList,Text,StyleSheet, Platform, AccessibilityInfo } from "react-native";
import { FadeIn, FadeOut, ZoomIn, ZoomOut } from "react-native-reanimated";
import Animated from "react-native-reanimated";
import { ThemeColors } from "../../../types/navigation";
import { globalStyles } from "../../../theme/global.styles";

interface AccountModalSelectorProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    accounts: { id: string; name: string; type: string }[];
    accountSelected: string;
    setAccountSelected: (id: string) => void;
    colors: ThemeColors;
    label: string;
}

export function AccountModalSelector({
    isOpen,
     setIsOpen,
      accounts,
       accountSelected,
        setAccountSelected,
         colors, label
        }: AccountModalSelectorProps) {

    const handleSelect = (id: string) => {
            setAccountSelected(id);
            setIsOpen(false);
            // Feedback opcional para lectores de pantalla
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility("Account selected");
        };

    return (
        <>
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
                            style={[styles.modalHeader, { backgroundColor: colors.surfaceSecondary }]}
                            accessibilityRole="header"
                        >
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{label}</Text>
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
                                            isSelected && { backgroundColor: colors.accentSecondary }
                                        ]}
                                        onPress={() => handleSelect(item.id)}

                                        // Accesibilidad de los Ítems
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: isSelected }}
                                        accessibilityLabel={`${item.name}, ${item.type}`}
                                        accessibilityHint={isSelected ? "Selected" : "Double tap to select"}
                                    >
                                        <View style={globalStyles.accountSelectorTextContainer}>
                                            <Text style={[
                                                styles.optionText,
                                                { color: colors.text },
                                                isSelected && [styles.optionTextSelected, { color: colors.text }]
                                            ]}>
                                                {item.name === 'allAccounts' ? t('accounts.allAccounts') : item.name}
                                            </Text>
                                            <Text style={[
                                                styles.optionSubText,
                                                { color: colors.textSecondary }
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
        </>
    );
}

const styles = StyleSheet.create({
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
        borderWidth: 0.3,
        overflow: 'hidden',
        paddingHorizontal: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)'
    },
    modalTitle: {
        fontSize: 22,
        fontFamily: 'Tinos-Bold',
    },
    // Estilos de la Lista
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 50,
        // Aumentamos padding vertical para mejor touch target
        paddingVertical: 18, 
        paddingHorizontal: 25,
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