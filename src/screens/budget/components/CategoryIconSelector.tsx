import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import { ICON_OPTIONS } from "../../../constants/icons";
import { useSettingsStore } from "../../../stores/settingsStore";

export const CategoryIconSelector = ({ handleCategorySelector, selectedCategory, colors }: any) => {
    const iconsOptions = useSettingsStore(state => state.iconsOptions);
    const { icon: IconCategory } = ICON_OPTIONS[iconsOptions].find(icon => icon.label === selectedCategory?.icon) || {};
    return (
        <TouchableOpacity 
            onPress={handleCategorySelector} 
            activeOpacity={0.8}
            style={{ minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center' }} 
            accessibilityRole="button"
            accessibilityLabel="Seleccionar icono de categoría"
        >
            <View style={[{ width: 44, height: 44, borderRadius: 22, borderWidth: 0.5, justifyContent: 'center', alignItems: 'center' }, { borderColor: colors.border, backgroundColor: selectedCategory?.color || colors.primary }]}>
                {selectedCategory && IconCategory ? <IconCategory size={24} color={colors.text} style={{
                    width: iconsOptions === 'painted' ? 52 : 32,
                    height: iconsOptions === 'painted' ? 52 : 32,
                    backgroundColor: iconsOptions === 'painted' ? 'transparent' : colors.surface,
                    borderRadius: iconsOptions === 'painted' ? 0 : 50,
                    padding: iconsOptions === 'painted' ? 0 : 4,
                }} /> : <MaterialIcons name="category" size={24} color={colors.textSecondary} />}
            </View>
        </TouchableOpacity>
    );
};