

import { MaterialIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { styles } from "../../../theme/styles";
import { CategoryLabel } from "../../../api/interfaces";
import { Transaction } from "../../../interfaces/data.interface";
import { transactions_icons } from "../../../constants/icons";

export function IconCategory({ transaction }: { transaction: Transaction }) {
    // 1. Obtener la configuración del icono basada en el nombre de la categoría
    const iconConfig = transactions_icons[transaction.category_name as CategoryLabel];

    // 2. Extraer el componente Icono (si existe)
    const IconComponent = iconConfig ? iconConfig.icon : null;

    // 3. Definir el color (puedes usar el del config o uno fijo gris '#555')
    // Si quieres usar el color original de la categoría: iconConfig.color
    // Si quieres usar gris fijo como tenías: '#555'
    const iconColor = iconConfig ? iconConfig.color : '#555';

    return (
        <>
            {/* ÍCONO */}
            <View style={styles.transactionIcon}>
                {IconComponent ? (
                    // Renderizamos el componente del icono encontrado
                    <IconComponent size={24} color={iconColor} />
                ) : (
                    // Fallback si no encuentra el icono por nombre
                    <MaterialIcons name="category" size={24} color="#555" />
                )}
            </View>
        </>
    );
}