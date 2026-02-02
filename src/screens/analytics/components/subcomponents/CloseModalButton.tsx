import { TouchableOpacity,Text,StyleSheet } from "react-native";
import { ThemeColors } from "../../../../types/navigation";

export default function CloseModalButton({ handleCloseModal, colors,  t }: { handleCloseModal: () => void; colors: ThemeColors; t: any }) {
    return (
        <TouchableOpacity 
                      onPress={handleCloseModal}
                      style={[styles.closeBtn, { backgroundColor: colors.textSecondary }]}
                      accessibilityRole="button"
                      accessibilityLabel="Close"
                    >
                      <Text style={[styles.closeText, { color: colors.text }]} maxFontSizeMultiplier={1.3}>
                        {t('common.close')}
                      </Text>
                    </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
     closeBtn: {
    height: 60,
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeText: { fontSize: 16, fontFamily: 'FiraSans-Bold', lineHeight: 20 }
});