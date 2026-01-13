import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { ICON_OPTIONS, IconKey, IconOption } from "../../../constants/icons";
import { ThemeColors } from "../../../types/navigation";
import { Trans, useTranslation } from "react-i18next";
import { InputNameActive } from "../../../interfaces/settings.interface";
import { useSettingsStore } from "../../../stores/settingsStore";
import { defaultCategories } from '../../../constants/categories';
import { Category, TransactionType } from "../../../interfaces/data.interface";
import { setBorderColorAsync } from "expo-navigation-bar";
import CategoryFormInput from "./CategoryFormInput";

interface CategorySelectorPopoverProps {
  popoverOpen: boolean;
  anchorEl?: any; // Se mantiene por compatibilidad de tipos, aunque no se use en móvil
  handleClosePopover: () => void;
  selectedCategory: Category | null;
  handleSelectCategory: (category: Category) => void;
  colors: ThemeColors;
  allCategories: Category[];
}

export default function CategorySelectorPopover({
  popoverOpen,
  handleClosePopover,
  selectedCategory,
  handleSelectCategory,
  colors,
  allCategories,
}: CategorySelectorPopoverProps) {
  const { t } = useTranslation();
  const { inputNameActive } = useSettingsStore();
  const [iconsKey, setIconsKey] = React.useState<TransactionType>(TransactionType.EXPENSE);
  const [addingNewCategory, setAddingNewCategory] = React.useState<boolean>(false);

  useEffect(() => {
    return inputNameActive === InputNameActive.INCOME
      ? setIconsKey(TransactionType.INCOME)
      : setIconsKey(TransactionType.EXPENSE)
       
  }, [inputNameActive]);

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
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t("common.selectCategory")}</Text>
          </View>
{
  addingNewCategory ? (
              <CategoryFormInput 
                type={iconsKey}
              />

  ) : <View style={styles.gridContainer}>
            <FlatList
              data={allCategories}
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
                const categoryName = item.userId ? item.name : t(`icons.${item.icon}`);

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
                        style={[styles.avatar, { backgroundColor: item.color, borderColor: colors.border }]}
                      >

                        {IconComponent && <IconComponent size={24} color={colors.text} />}
                      </View>

                      <Text
                        style={[
                          styles.iconLabel,
                          { color: colors.textSecondary },
                          isSelected && { ...styles.iconLabelSelected, color: colors.accent },
                        ]}
                        numberOfLines={1}
                      >{
                        // TODO: Separar las categorias y no ponerlas todas juntas para que traduzca solo las que estan por defecto
                        // Mostrar el nombre del la categoria si el icono no fue creado por el usuario, de lo contrario mostrar el nombre personalizado
                       categoryName
                      }
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
    maxHeight: "60%", // Altura máxima del modal
    borderRadius: 20,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  header: {
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
    borderWidth: 1,
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
});