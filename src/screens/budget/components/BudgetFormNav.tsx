import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity,Text, View ,StyleSheet} from "react-native";




export const BudgetFormNav = ({
    colors, dynamicIconSize, fontScale, isEditMode, isFavorite, setMenuVisible, onClose, onSave, setCategorySelectorOpen, t
}: any) => (
    <View style={[headerStyles.header]}>
        <TouchableOpacity
            onPress={() => { setCategorySelectorOpen(false); onClose(); }}
            style={[headerStyles.headerIconBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
        >
            <MaterialIcons name="close" size={dynamicIconSize} color={colors.text} />
        </TouchableOpacity>

        <Text style={[headerStyles.headerTitle, { color: colors.text }]} numberOfLines={2} adjustsFontSizeToFit>
            {isEditMode ? t('budget_form.title_edit') : t('budget_form.title_new')}
        </Text>

        <View style={headerStyles.headerActions}>
            {isFavorite && <MaterialIcons name="star" size={20 * fontScale} color={colors.warning} />}
            {isEditMode && (
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={[headerStyles.headerIconBtn, { borderColor: colors.border }]}>
                    <MaterialIcons name="more-vert" size={dynamicIconSize} color={colors.text} />
                </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onSave} style={[headerStyles.headerIconBtn, { backgroundColor: colors.accent, borderColor: 'transparent' }]}>
                <MaterialIcons name="check" size={dynamicIconSize} color={colors.surface} />
            </TouchableOpacity>
        </View>
    </View>
);

export const headerStyles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,  zIndex: 10, minHeight: 64, gap: 10 },
    headerTitle: { fontSize: 16, fontFamily: 'FiraSans-Bold', flex: 1, textAlign: 'center' },
    headerIconBtn: { width: 40, height: 40, borderRadius: 50, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    menuBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 },
    popupMenu: { position: 'absolute', top: 70, right: 16, width: 230, borderRadius: 16, borderWidth: 1, paddingVertical: 6, zIndex: 100, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 8 },
    menuOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, minHeight: 48, gap: 12 },
    menuOptionIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    menuOptionText: { fontSize: 14, fontFamily: 'FiraSans-Regular', flex: 1 },
    menuDivider: { height: 1, marginVertical: 4, marginHorizontal: 14 },
}); 



