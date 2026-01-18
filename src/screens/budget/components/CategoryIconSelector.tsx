import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import { ICON_OPTIONS } from "../../../constants/icons";

export const CategoryIconSelector = ({ handleCategorySelector, selectedCategory, colors }: any) => {
    const { icon: IconCategory } = ICON_OPTIONS.find(icon => icon.label === selectedCategory?.icon) || {};
    return (
        <TouchableOpacity 
            onPress={handleCategorySelector} 
            activeOpacity={0.8}
            style={{ minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center' }} // Hit slop natural
            accessibilityRole="button"
            accessibilityLabel="Seleccionar icono de categoría"
        >
            <View style={[{ width: 44, height: 44, borderRadius: 22, borderWidth: 0.5, justifyContent: 'center', alignItems: 'center' }, { borderColor: colors.border, backgroundColor: selectedCategory?.color || colors.primary }]}>
                {selectedCategory && IconCategory ? <IconCategory size={24} color={colors.text} /> : <MaterialIcons name="category" size={24} color={colors.textSecondary} />}
            </View>
        </TouchableOpacity>
    );
};