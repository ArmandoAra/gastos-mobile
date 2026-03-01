import { MaterialIcons } from "@expo/vector-icons";
import { View, TextInput ,Text,StyleSheet} from "react-native";
import { formatCurrency } from "../../../utils/helpers";
import { ThemeColors } from "../../../types/navigation";
import { i18n } from "i18next";


interface BudgetFormSectionProps {
    colors: ThemeColors;
    name: string;
    setName: (name: string) => void;
    budgetedAmount: string;
    setBudgetedAmount: (amount: string) => void;
    totalSpent: number;
    isOverBudget: boolean;
    currencySymbol: string;
    selectedCategory: any;
    categorySelectorOpen: boolean;
    setCategorySelectorOpen: (open: boolean) => void;
    t: i18n['t'];
}

export const BudgetFormSection = ({
    colors,
    budgetedAmount,
    setBudgetedAmount,
    totalSpent,
    isOverBudget,
    currencySymbol,
    t
}: BudgetFormSectionProps) => (
            <View style={formStyles.rowWrap}>
                <View style={[formStyles.totalBlock, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                    <View style={formStyles.inputHeader}>
                        <Text style={[formStyles.label, { color: colors.textSecondary }]}>
                    {t('budget_form.fields.target_amount_label')}
                        </Text>
                        <MaterialIcons name="edit" size={14} color={colors.textSecondary} />
                    </View>
                    <View style={formStyles.currencyRow}>
                        <Text style={[formStyles.label, { color: colors.textSecondary, marginBottom: 4 }]}>
                            {currencySymbol}
                        </Text>
                        <TextInput
                            style={[formStyles.inputMedium, { color: colors.text, backgroundColor: colors.primary }]}
                            placeholder={t('budget_form.fields.target_placeholder')}
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="decimal-pad"
                            value={budgetedAmount}
                            onChangeText={(val) => setBudgetedAmount(val.replace(/,/g, '.'))}
                            accessibilityLabel={t('budget_form.fields.target_amount_label')}
                        />
                    </View>
                </View>

                <View style={[formStyles.totalBlock, {
                    backgroundColor: (isOverBudget ? colors.expense : colors.income) + '14',
                    borderColor: (isOverBudget ? colors.expense : colors.income) + '35',
                }]}>
                    <Text style={[formStyles.label, { color: colors.textSecondary }]}>
                        {t('budget_form.fields.current_total_label')}
                    </Text>
                    <Text style={[formStyles.displayTotal, { color: isOverBudget ? colors.expense : colors.income }]}>
                        {currencySymbol}{formatCurrency(totalSpent)}
                    </Text>
                </View>
            </View>

);

const formStyles = StyleSheet.create({
    categoryLabel: { fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
    inputHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    label: { fontSize: 11, fontFamily: 'FiraSans-Bold', letterSpacing: 0.8, textAlign: 'center' },
    inputLarge: { fontSize: 18, flex: 1, fontFamily: 'FiraSans-Regular', minHeight: 48, textAlignVertical: 'center' },
    inlineDivider: { height: 1, marginVertical: 2 },
    rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'stretch',marginBottom: 12 },
    currencyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    inputMedium: { paddingHorizontal: 14, fontSize: 16, fontFamily: 'FiraSans-Bold', minHeight: 48, minWidth: '80%', borderRadius: 50, textAlign: 'center' },
    totalBlock: { flex: 1, minWidth: 130, borderRadius: 14, borderWidth: 0.5, paddingHorizontal: 14, paddingVertical: 12, justifyContent: 'center' },
    displayTotal: { fontSize: 20, fontFamily: 'FiraSans-Bold', marginTop: 4, paddingVertical: 6, textAlign: 'center' },
});