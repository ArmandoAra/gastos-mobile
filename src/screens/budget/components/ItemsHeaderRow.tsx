import { MaterialIcons } from "@expo/vector-icons";
import { View, TouchableOpacity,Text , StyleSheet} from "react-native";
import { ThemeColors } from "../../../types/navigation";




export const ItemsHeaderRow = ({
    colors,
    itemCount,
    fontScale,
    title,
    addLabel,
    onAddItem,
}: {
    colors: ThemeColors;
    itemCount: number;
    fontScale: number;
    title: string;
    addLabel: string;
    onAddItem: () => void;
}) => (
    <View style={[stickyStyles.row, { backgroundColor: colors.surfaceSecondary }]}>
        <View style={stickyStyles.left}>
            <Text style={[stickyStyles.title, { color: colors.text }]} accessibilityRole="header">
                {title}
            </Text>
            <View style={[stickyStyles.counter, { backgroundColor: colors.accent + '28', borderColor: colors.accent + '44' }]}>
                <Text style={[stickyStyles.counterText, { color: colors.text }]}>
                    {itemCount}
                </Text>
            </View>
        </View>
        <TouchableOpacity
            onPress={onAddItem}
            style={[stickyStyles.addBtn, { backgroundColor: colors.accent }]}
            accessibilityRole="button"
            accessibilityLabel={addLabel}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
            <MaterialIcons name="add" size={16 * fontScale} color={colors.text} />
            <Text style={[stickyStyles.addBtnText, { color: colors.text }]}>
                {addLabel}
            </Text>
        </TouchableOpacity>
    </View>
);

const stickyStyles = StyleSheet.create({
    row: { 
        flexDirection: 'row',
         justifyContent: 'space-between', 
         alignItems: 'center', 
         paddingHorizontal: 12,
          paddingVertical: 12, 
          marginBottom: 8,
           borderRadius: 12,
            },
    left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    title: { fontSize: 16, fontFamily: 'FiraSans-Bold' },
    counter: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99, borderWidth: 1, minWidth: 28, alignItems: 'center' },
    counterText: { fontSize: 12, fontFamily: 'FiraSans-Bold', lineHeight: 16 },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99, minHeight: 38 },
    addBtnText: { fontFamily: 'FiraSans-Bold', fontSize: 13 },
});