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
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { ICON_OPTIONS } from "../../../constants/icons";
import { ThemeColors } from "../../../types/navigation";
import { useTranslation } from "react-i18next";
import { InputNameActive } from "../../../interfaces/settings.interface";
import { useSettingsStore } from "../../../stores/settingsStore";
import { Category, TransactionType } from "../../../interfaces/data.interface";
import CategoryFormInput from "./CategoryFormInput";
import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import { MyCustomCategories } from "./myCustomCategories";
import { set } from "date-fns";

interface CategorySelectorPopoverProps {
  popoverOpen: boolean;
  anchorEl?: any; // Se mantiene por compatibilidad de tipos, aunque no se use en móvil
  handleClosePopover: () => void;
  selectedCategory: Category | null;
  handleSelectCategory: (category: Category) => void;
  colors: ThemeColors;
  defaultCategories: Category[];
  userCategories: Category[];
}

export default function CategorySelectorPopover({
  popoverOpen,
  handleClosePopover,
  selectedCategory,
  handleSelectCategory,
  colors,
  defaultCategories,
  userCategories,
}: CategorySelectorPopoverProps) {
  const { t } = useTranslation();
  const inputNameActive = useSettingsStore(state => state.inputNameActive);
  const iconsOptions = useSettingsStore(state => state.iconsOptions);
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
    <Modal
      visible={popoverOpen}
      transparent
      animationType="none"
      onRequestClose={handleClosePopover}
      statusBarTranslucent
    >
      {/* 1. ANIMACIÓN DEL FONDO (Backdrop) */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.backdrop}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={handleClosePopover}
          activeOpacity={1}
        />

        {/* 2. ANIMACIÓN DEL POPUP (Zoom In) */}
        <Animated.View
          entering={ZoomIn.duration(250)}
          exiting={ZoomOut.duration(200)}
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
                setSelectingMyCategories={setSelectingMyCategories}
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
                const { icon: IconComponent } = ICON_OPTIONS[iconsOptions].filter((icon) => icon.label === item.icon)[0]

                return (
                  <View style={styles.gridItemWrapper}>
                    <TouchableOpacity
                      onPress={() => handleSelectCategory(item)}
                      activeOpacity={0.7}
                      style={[
                        styles.iconItem,
                        isSelected && { ...styles.iconItemSelected, borderColor: colors.accent },
                      ]}
                    >
                      <View
                        style={[styles.avatar, {
                          borderColor: iconsOptions === 'painted' ? 'transparent' : colors.border,
                          padding: iconsOptions === 'painted' ? 0 : 12,
                          backgroundColor: iconsOptions === 'painted' ? 'transparent' : item.color || colors.surface
                        }]}
                      >

                        {IconComponent && <IconComponent color={colors.text} style={{
                          width: iconsOptions === 'painted' ? 60 : 32,
                          height: iconsOptions === 'painted' ? 60 : 32,
                          backgroundColor: iconsOptions === 'painted' ? 'transparent' : colors.surface,
                          borderRadius: iconsOptions === 'painted' ? 0 : 50,
                          padding: iconsOptions === 'painted' ? 0 : 4,
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
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popoverContent: {
    flex: 1,
    width: "95%",
    maxHeight: "60%", // Altura máxima del modal
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
    fontFamily: 'Tinos-Italic',
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
    fontFamily: 'FiraSans-Regular',
    color: "#888",
    textAlign: "center",
  },
  iconLabelSelected: {
    color: "#667eea",
    fontFamily: 'FiraSans-Bold',
  },
  addUserCategory: {
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
  },

});