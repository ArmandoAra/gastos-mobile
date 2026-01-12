

import { MaterialIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { styles } from "../../../theme/styles";
import { CategoryLabel } from "../../../api/interfaces";
import { Transaction } from "../../../interfaces/data.interface";
import { transactions_icons } from "../../../constants/icons";

export function IconCategory({ transaction }: { transaction: Transaction }) {
    const iconConfig = transactions_icons[transaction.category_name as CategoryLabel];
    const IconComponent = iconConfig ? iconConfig.icon : null;
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