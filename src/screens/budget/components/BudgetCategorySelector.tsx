import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeOut,
  interpolateColor,
  SlideInDown,
  SlideInUp,
  SlideOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { ICON_OPTIONS, IconKey, IconOption } from "../../../constants/icons";
import { ThemeColors } from "../../../types/navigation";
import { useTranslation } from "react-i18next";
import { InputNameActive } from "../../../interfaces/settings.interface";
import { useSettingsStore } from "../../../stores/settingsStore";
import { Category, TransactionType } from "../../../interfaces/data.interface";

import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import { MyCustomCategories } from "../../../components/forms/Inputs/myCustomCategories";
import CategoryFormInput from "../../../components/forms/Inputs/CategoryFormInput";


interface BudgetCategorySelectorProps {
  closeCategorySelector: () => void;
  selectedCategory: Category | null;
  handleSelectCategory: (category: Category) => void;
  colors: ThemeColors;
  defaultCategories: Category[];
  userCategories: Category[];
}

export default function BudgetCategorySelector({
    closeCategorySelector,
  selectedCategory,
  handleSelectCategory,
  colors,
  defaultCategories,
  userCategories,
}: BudgetCategorySelectorProps) {
  const { t } = useTranslation();
  const { inputNameActive } = useSettingsStore();
  const [iconsKey, setIconsKey] = React.useState<TransactionType>(TransactionType.EXPENSE);
  const [addingNewCategory, setAddingNewCategory] = React.useState<boolean>(false);
  const [selectingMyCategories, setSelectingMyCategories] = React.useState<boolean>(false);

  useEffect(() => {
    return inputNameActive === InputNameActive.INCOME
      ? setIconsKey(TransactionType.INCOME)
      : setIconsKey(TransactionType.EXPENSE)
       
  }, [inputNameActive]);

  const handleToggleOptions = () => {
    setAddingNewCategory(!addingNewCategory);
  }

  // Shared Value para la rotación (0 a 1)
  const animationProgress = useSharedValue(0);

  // Sincronizar animación con estado
  useEffect(() => {
    animationProgress.value = withTiming(addingNewCategory ? 1 : 0, { duration: 250 });
  }, [addingNewCategory]);


  const fabAnimatedStyle = useAnimatedStyle(() => {
    const rotate = animationProgress.value * 45; // 0 a 45 grados
    const backgroundColor = interpolateColor(
      animationProgress.value,
      [0, 1],
      [colors.text, colors.surface] // De oscuro a claro (o según tu tema)
    );

    return {
      transform: [{ rotate: `${rotate}deg` }],
      backgroundColor: backgroundColor
    };
  });


  const handleToggleCategoriesSelection = () => {
    setSelectingMyCategories(!selectingMyCategories);
  }

  return (
        <Animated.View
          entering={SlideInUp.duration(100)}
          exiting={SlideOutUp.duration(50)}
          style={[styles.popoverContent, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t("transactions.categories")}</Text>

            <View style={{ position: 'absolute', left: 25, top: 20 }}>
              <MyCustomCategories colors={colors}
                value={selectingMyCategories}
                onAction={handleToggleCategoriesSelection}
              />
            </View>
            <View style={{ position: 'absolute', right: 25, bottom: 10, width: 32, height: 32, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.text, borderRadius: 25 }}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleToggleOptions}
              >
                <Animated.View style={[styles.addUserCategory, fabAnimatedStyle, { borderColor: colors.border }]}>
                  <MaterialIcons
                    name="add"
                    size={28}
                    color={colors.accent}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
{
  addingNewCategory ? (

              <CategoryFormInput 
                type={iconsKey}
                closeInput={handleToggleOptions}
              />

  ) : <View style={styles.gridContainer}>
            <FlatList
                  data={
                    selectingMyCategories ? userCategories : defaultCategories
                  }
              keyExtractor={(item) => item.id}
              numColumns={3}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: colors.text }}>No icons found</Text>
                </View>
              }

              renderItem={({ item }) => {
                const isSelected = selectedCategory?.id === item.id;
                const { icon: IconComponent } = ICON_OPTIONS.filter((icon) => icon.label === item.icon)[0]

                return (
                  <View style={styles.gridItemWrapper}>
                    <TouchableOpacity
                      onPress={() => {
                        handleSelectCategory(item); 
                        closeCategorySelector();
                    }}
                      activeOpacity={0.7}
                      style={[
                        styles.iconItem,
                        isSelected && { ...styles.iconItemSelected, borderColor: colors.accent },
                      ]}
                    >
                      <View
                        style={[styles.avatar, { backgroundColor: item.color, borderColor: colors.border }]}
                      >

                        {IconComponent && <IconComponent size={24} color={colors.text} style={{
                          backgroundColor: colors.surfaceSecondary,
                          borderRadius: 50,
                          padding: 5,
                        }} />}
                      </View>

                      <Text
                        style={[
                          styles.iconLabel,
                          { color: colors.textSecondary },
                          isSelected && { ...styles.iconLabelSelected, color: colors.accent },
                        ]}
                        numberOfLines={1}
                      >
                        {selectingMyCategories ? item.name : t(`icons.${item.name}`)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>

          
}
        </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popoverContent: {
   height: 500,
    borderRadius: 20,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    width: "100%",
    height: 80,
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#667eea",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  gridContainer: {
    flex: 1,
    width: "100%",
  },
  listContent: {
    padding: 16,
    paddingBottom: 24, // Espacio extra abajo
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  // Wrapper externo: Define el ancho de la columna (30% * 3 ≈ 90% + espacios)
  gridItemWrapper: {
    width: "30%", 
  },
  // Item interno: Llena el wrapper
  iconItem: {
    width: "100%",
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "transparent",
  },
  iconItemSelected: {
    borderColor: "#667eea",
    backgroundColor: "rgba(102, 126, 234, 0.08)",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24, // Círculo
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  iconLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    textAlign: "center",
  },
  iconLabelSelected: {
    color: "#667eea",
    fontWeight: "700",
  },
  addUserCategory: {
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
  },

});