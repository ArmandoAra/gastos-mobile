import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Platform,
    Switch,
} from 'react-native';

import { ThemeColors } from '../../../types/navigation';
import { useTranslation } from 'react-i18next';
import { set } from 'date-fns';


// --- SUBCOMPONENTE REFACTORIZADO ---
interface MyCustomCategoriesProps {
    colors: ThemeColors;
    value?: boolean; 
    onAction: () => void;
}

export const MyCustomCategories = ({
    colors,
    value,
    onAction,
}: MyCustomCategoriesProps) => {
    const { t } = useTranslation();


    // Renderizado condicional basado en el tipo
        return (
            <View style={[styles.settingItemColumn, { borderBottomColor: colors.border }]}>
                {/* 1. Label e Icono Arriba */}
                 <Text
                    style={[styles.settingLabel, { color: colors.text }]}
                    maxFontSizeMultiplier={2}
                >
                    {t("common.my", "My Custom Categories")}
                </Text>
                
                {/* 2. Switch Abajo */}
                <View style={styles.switchContainer}>
                    <Switch
                        value={value}
                        onValueChange={onAction}
                        trackColor={{ false: colors.border, true: colors.income + '80' }}
                        thumbColor={value ? colors.accent : colors.textSecondary}
                        ios_backgroundColor={colors.border}
                        accessibilityLabel="Custom Categories Toggle"
                        accessibilityHint={"Double tap to toggle setting"}
                    />
                </View>
            </View>
        );
    }

const styles = StyleSheet.create({
    

    
    // Estilo para el Switch (Vertical / Columna)
    settingItemColumn: {
        flexDirection: 'column',
        width: 80 ,
        height: 80,
        alignItems: 'center', // Alineado a la izquierda
        gap: 3, // Espacio vertical entre el texto y el switch
        zIndex: 1,
    },

    // Estilo para el Botón (Horizontal / Fila)
    settingItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        minHeight: 60,
    },

    // --- ELEMENTOS INTERNOS ---
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1, 
        paddingRight: 12,
    },
    iconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    textContainer: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontFamily: 'FiraSans-Regular',
        flexWrap: 'wrap',
    },
    switchContainer: {
        // Contenedor para el switch cuando está abajo
        alignSelf: 'center', // Switch alineado a la izquierda debajo del texto
        // Si prefieres el switch a la derecha debajo del texto, usa 'flex-end'
        marginLeft: 0, 
    }
});