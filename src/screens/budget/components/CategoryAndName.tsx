import { MaterialIcons } from '@expo/vector-icons'
import { i18n, t } from 'i18next'
import React from 'react'
import { View,  TextInput, Text, StyleSheet } from 'react-native'
import { FadeIn } from 'react-native-reanimated'
import { globalStyles } from '../../../theme/global.styles'
import { CategoryIconSelector } from './CategoryIconSelector'
import Animated from 'react-native-reanimated'
import { ThemeColors } from '../../../types/navigation'


interface CategoryAndNameProps {
    colors: ThemeColors;
    name: string;
    setName: (name: string) => void;
    selectedCategory: any;
    categorySelectorOpen: boolean;
    setCategorySelectorOpen: (open: boolean) => void;
    t: i18n['t'];
}

export const CategoryAndName = ({ 
    colors,
     name, 
     setName,
     categorySelectorOpen,
      setCategorySelectorOpen, 
      selectedCategory,
       t
     }: CategoryAndNameProps) => {
  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View>
                    <Animated.View entering={FadeIn.delay(200)}>
                        <Text style={[globalStyles.bodyTextSm, formStyles.categoryLabel, { color: colors.textSecondary }]}>
                            {t('transactions.category', 'CATEGORY')}
                        </Text>
                    </Animated.View>
                    <CategoryIconSelector
                        handleCategorySelector={() => setCategorySelectorOpen(!categorySelectorOpen)}
                        selectedCategory={selectedCategory}
                        colors={colors}
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <View style={formStyles.inputHeader}>
                        <Text style={[formStyles.label, { color: colors.textSecondary }]}>
                            {t('budget_form.fields.name_label')}
                        </Text>
                        <MaterialIcons name="edit" size={14} color={colors.textSecondary} />
                    </View>
                    <TextInput
                        style={[formStyles.inputLarge, { color: colors.text }]}
                        placeholder={t('budget_form.fields.name_placeholder')}
                        placeholderTextColor={colors.textSecondary}
                        value={name}
                        maxLength={60}
                        onChangeText={setName}
                        accessibilityLabel={t('budget_form.fields.name_label')}
                        multiline
                    />
                </View>
            </View>
    </>
  )
}

const formStyles = StyleSheet.create({
    categoryLabel: { fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
    inputHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    label: { fontSize: 11, fontFamily: 'FiraSans-Bold', letterSpacing: 0.8, textAlign: 'center' },
    inputLarge: { fontSize: 16, fontFamily: 'FiraSans-Medium', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }
});
