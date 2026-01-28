import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  ZoomIn,
  ZoomOut,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { ICON_OPTIONS } from "../../../constants/icons";
import { ThemeColors } from "../../../types/navigation";
import { useTranslation } from "react-i18next";
import { InputNameActive } from "../../../interfaces/settings.interface";
import { useSettingsStore } from "../../../stores/settingsStore";
import { Category, TransactionType } from "../../../interfaces/data.interface";
import CategoryFormInput from "./CategoryFormInput";
import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import { MyCustomCategoriesSwitch } from "./myCustomCategories";

// --- 1. NUEVO COMPONENTE: ITEM ANIMADO ---
// Extraemos el renderItem para manejar sus propias animaciones sin afectar el rendimiento global
interface CategoryGridItemProps {
  item: Category;
  isSelected: boolean;
  isEditing: boolean;
  iconsOptions: string;
  colors: ThemeColors;
  t: any;
  onSelect: (item: Category) => void;
  onDelete: (id: string) => void;
  onEdit: (item: Category) => void;
  onLongPress: () => void;
}

const CategoryGridItem = ({
  item,
  isSelected,
  isEditing,
  iconsOptions,
  colors,
  t,
  onSelect,
  onDelete,
  onEdit,
  onLongPress,
}: CategoryGridItemProps) => {
  const rotation = useSharedValue(0);

  // Lógica del "Jiggle" (Temblor)
  useEffect(() => {
    if (isEditing) {
      // Rota entre -2 y 2 grados aleatoriamente o en secuencia
      rotation.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 120, easing: Easing.linear }),
          withTiming(2, { duration: 120, easing: Easing.linear }),
          withTiming(-1, { duration: 120, easing: Easing.linear }),
          withTiming(1, { duration: 120, easing: Easing.linear }),
          withTiming(0, { duration: 120, easing: Easing.linear })
        ),
        -1, // Infinito
        true // Reverse
      );
    } else {
      rotation.value = withTiming(0, { duration: 200 });
    }
  }, [isEditing]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const { icon: IconComponent } = ICON_OPTIONS[iconsOptions as keyof typeof ICON_OPTIONS].filter(
    (icon) => icon.label === item.icon
  )[0] || { icon: null };

  return (
    <View style={styles.gridItemWrapper}>
      <Animated.View style={[styles.iconItemContainer, animatedStyle]}>
        <TouchableOpacity
          onPress={() => onSelect(item)}
          onLongPress={onLongPress}
          activeOpacity={0.7}
          style={[
            styles.iconItem,
            isSelected && {
              ...styles.iconItemSelected,
              borderColor: colors.accent,
            },
            isEditing && { opacity: 0.9 } // Feedback visual extra
          ]}
        >
          {/* Avatar / Icono Principal */}
          <View
            style={[
              styles.avatar,
              {
                borderColor:
                  iconsOptions === "painted" ? "transparent" : colors.border,
                padding: iconsOptions === "painted" ? 0 : 12,
                backgroundColor:
                  iconsOptions === "painted"
                    ? "transparent"
                    : item.color || colors.surface,
              },
            ]}
          >
            {IconComponent && (
              <IconComponent
                color={colors.text}
                style={{
                  width: iconsOptions === "painted" ? 60 : 32,
                  height: iconsOptions === "painted" ? 60 : 32,
                  backgroundColor:
                    iconsOptions === "painted"
                      ? "transparent"
                      : colors.surface,
                  borderRadius: iconsOptions === "painted" ? 0 : 50,
                  padding: iconsOptions === "painted" ? 0 : 4,
                }}
              />
            )}
          </View>

          {/* Etiqueta */}
          <Text
            style={[
              styles.iconLabel,
              { color: colors.textSecondary },
              isSelected && {
                ...styles.iconLabelSelected,
                color: colors.accent,
              },
            ]}
            numberOfLines={1}
          >
            {/* Si es custom mostramos el nombre, si es default traducimos */}
            {item.userId && item.userId !== 'default' ? item.name : t(`icons.${item.name}`)}
          </Text>
        </TouchableOpacity>

        {/* --- BOTONES DE EDICIÓN (BADGES) --- */}
        {isEditing && (
          <>
            {/* Botón Eliminar (Arriba Izquierda) */}
            <Animated.View
              entering={ZoomIn.duration(300).delay(50)}
              exiting={ZoomOut.duration(200)}
              style={styles.badgeDelete}
            >
              <TouchableOpacity onPress={() => onDelete(item.id)}>
                <View style={[styles.badgeCircle, { backgroundColor: colors.surface, borderColor: colors.error }]}>
                  <MaterialIcons name="close" size={16} color={colors.error} />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Botón Editar (Arriba Derecha) */}
            <Animated.View
              entering={ZoomIn.duration(300).delay(100)}
              exiting={ZoomOut.duration(200)}
              style={styles.badgeEdit}
            >
              <TouchableOpacity onPress={() => onEdit(item)}>
                <View style={[styles.badgeCircle, { backgroundColor: colors.surface, borderColor: colors.text }]}>
                  <MaterialIcons name="edit" size={14} color={colors.text} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </Animated.View>
    </View>
  );
};

// --- COMPONENTE PRINCIPAL ---

interface CategorySelectorPopoverProps {
  popoverOpen: boolean;
  anchorEl?: any;
  handleClosePopover: () => void;
  selectedCategory: Category | null;
  handleSelectCategory: (category: Category) => void;
  handleDeleteCategory: (categoryId: string) => void;
  colors: ThemeColors;
  defaultCategories: Category[];
  userCategories: Category[];
}

export default function CategorySelectorPopover({
  popoverOpen,
  handleClosePopover,
  selectedCategory,
  handleSelectCategory,
  handleDeleteCategory,
  colors,
  defaultCategories,
  userCategories,
}: CategorySelectorPopoverProps) {
  const { t } = useTranslation();
  const inputNameActive = useSettingsStore((state) => state.inputNameActive);
  const iconsOptions = useSettingsStore((state) => state.iconsOptions);
  const [iconsKey, setIconsKey] = React.useState<TransactionType>(
    TransactionType.EXPENSE
  );
  const [addingNewCategory, setAddingNewCategory] = React.useState<boolean>(false);
  const [categoryToEdit, setCategoryToEdit] = React.useState<Category | null>(null);
  const [selectingMyCategories, setSelectingMyCategories] = React.useState<boolean>(false);
  const [toolsOpen, setToolsOpen] = React.useState<boolean>(false);

  useEffect(() => {
    return inputNameActive === InputNameActive.INCOME
      ? setIconsKey(TransactionType.INCOME)
      : setIconsKey(TransactionType.EXPENSE);
  }, [inputNameActive]);

  // Resetear toolsOpen cuando cambia el modo de selección
  useEffect(() => {
    setToolsOpen(false);
  }, [selectingMyCategories, popoverOpen]);

  const handleToggleOptions = () => {
    if (addingNewCategory) {
      // Si estamos cerrando, limpiamos la categoría a editar
      setCategoryToEdit(null);
    }
    setAddingNewCategory(!addingNewCategory);
  };

  const handleEditClick = (category: Category) => {
    setCategoryToEdit(category); // 1. Guardamos la categoría
    setAddingNewCategory(true);  // 2. Abrimos el formulario
    setToolsOpen(false);         // 3. Cerramos el modo "jiggle"
  };

  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withTiming(addingNewCategory ? 1 : 0, {
      duration: 250,
    });
  }, [addingNewCategory]);

  const fabAnimatedStyle = useAnimatedStyle(() => {
    const rotate = animationProgress.value * 45;
    const backgroundColor = interpolateColor(
      animationProgress.value,
      [0, 1],
      [colors.text, colors.surface]
    );

    return {
      transform: [{ rotate: `${rotate}deg` }],
      backgroundColor: backgroundColor,
    };
  });

  const handleToggleCategoriesSelection = () => {
    setSelectingMyCategories(!selectingMyCategories);
  };

  return (
    <Modal
      visible={popoverOpen}
      transparent
      animationType="none"
      onRequestClose={handleClosePopover}
      statusBarTranslucent
    >
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

        <Animated.View
          entering={ZoomIn.duration(250)}
          exiting={ZoomOut.duration(200)}
          style={[
            styles.popoverContent,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t("transactions.categories")}
            </Text>

            <View style={{ position: "absolute", left: 25, top: 20 }}>
              <MyCustomCategoriesSwitch
                colors={colors}
                value={selectingMyCategories}
                onAction={handleToggleCategoriesSelection}
              />
            </View>
            <View
              style={{
                position: "absolute",
                right: 25,
                bottom: 10,
                width: 32,
                height: 32,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: colors.text,
                borderRadius: 25,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleToggleOptions}
              >
                <Animated.View
                  style={[
                    styles.addUserCategory,
                    fabAnimatedStyle,
                    { borderColor: colors.border },
                  ]}
                >
                  <MaterialIcons
                    name="add"
                    size={28}
                    color={colors.accent}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {addingNewCategory ? (
            <CategoryFormInput
              type={iconsKey}
              closeInput={handleToggleOptions}
              setSelectingMyCategories={setSelectingMyCategories}
              categoryToEdit={categoryToEdit}
            />
          ) : (
            <View style={styles.gridContainer}>
              <View style={{ flex: 1 }} onStartShouldSetResponder={() => {
                // Si tocamos el fondo y las herramientas están abiertas, las cerramos
                if (toolsOpen) setToolsOpen(false);
                return false;
              }}>
                <FlatList
                    data={selectingMyCategories ? userCategories : defaultCategories}
                    keyExtractor={(item) => item.id}
                    numColumns={3}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                      <View style={{ padding: 20, alignItems: "center" }}>
                        <Text style={{ color: colors.text }}>No icons found</Text>
                      </View>
                    }
                    renderItem={({ item }) => (
                      <CategoryGridItem
                        item={item}
                        isSelected={selectedCategory?.id === item.id}
                        isEditing={selectingMyCategories && toolsOpen} // Solo editable si son custom
                        iconsOptions={iconsOptions}
                        colors={colors}
                        t={t}
                        onSelect={(cat) => {
                          if (toolsOpen) {
                            setToolsOpen(false); // Seleccionar cierra modo edición
                          } else {
                            handleSelectCategory(cat);
                          }
                        }}
                        onDelete={handleDeleteCategory}
                        onEdit={(cat) => handleEditClick(cat)}
                        onLongPress={() => {
                          // Solo activar si estamos en "Mis Categorías"
                          if (selectingMyCategories) setToolsOpen(true);
                        }}
                      />
                    )}
                  />
                </View>

                {/* Mensaje de ayuda visual si estamos en custom */}
                {selectingMyCategories && !toolsOpen && (
                  <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                    {t('transactions.longPressToEdit', 'Long press to edit categories')}
                  </Text>
                )}
              </View>
          )}
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
    maxHeight: "60%",
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
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: "Tinos-Italic",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  gridContainer: {
    flex: 1,
    width: "100%",
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 20, // Aumentado para dar espacio a los botones flotantes
  },
  gridItemWrapper: {
    width: "30%",
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconItemContainer: {
    width: '100%',
    alignItems: 'center',
    // Necesario para posicionamiento absoluto de los badges
    position: 'relative',
  },
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
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  iconLabel: {
    fontSize: 12,
    fontFamily: "FiraSans-Regular",
    textAlign: "center",
  },
  iconLabelSelected: {
    fontFamily: "FiraSans-Bold",
  },
  addUserCategory: {
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
  },
  // --- ESTILOS DE BADGES (Botones flotantes) ---
  badgeDelete: {
    position: 'absolute',
    top: -5,
    left: 5, // Ajusta según el ancho de tu columna
    zIndex: 10,
  },
  badgeEdit: {
    position: 'absolute',
    top: -5,
    right: 5,
    zIndex: 10,
  },
  badgeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  hintText: {
    textAlign: 'center',
    fontSize: 10,
    paddingVertical: 5,
    opacity: 0.6
  }
});