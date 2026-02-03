import React, { useEffect, useMemo, useCallback } from "react";
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

// --- CONSTANTES ---
const JIGGLE_CONFIG = {
  sequence: [-2, 2, -1, 1, 0],
  duration: 120,
  easing: Easing.linear,
} as const;

const ANIMATION_DURATION = {
  fab: 250,
  modal: 200,
  zoom: 250,
  jiggle: 200,
} as const;

// --- 1. COMPONENTE ITEM OPTIMIZADO CON MEMO ---
interface CategoryGridItemProps {
  item: Category;
  isSelected: boolean;
  isEditing: boolean;
  iconsOptions: string;
  colors: ThemeColors;
  categoryLabel: string; // Pre-computed label
  IconComponent: React.ComponentType<any> | null;
  onSelect: (item: Category) => void;
  onDelete: (id: string) => void;
  onEdit: (item: Category) => void;
  onLongPress: () => void;
}

const CategoryGridItem = React.memo<CategoryGridItemProps>(
  ({
    item,
    isSelected,
    isEditing,
    iconsOptions,
    colors,
    categoryLabel,
    IconComponent,
    onSelect,
    onDelete,
    onEdit,
    onLongPress,
  }) => {
    const rotation = useSharedValue(0);

    // Lógica del "Jiggle" optimizada
    useEffect(() => {
      if (isEditing) {
        rotation.value = withRepeat(
          withSequence(
            ...JIGGLE_CONFIG.sequence.map((angle) =>
              withTiming(angle, {
                duration: JIGGLE_CONFIG.duration,
                easing: JIGGLE_CONFIG.easing,
              })
            )
          ),
          -1,
          true
        );
      } else {
        rotation.value = withTiming(0, { duration: ANIMATION_DURATION.jiggle });
      }
    }, [isEditing]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));

    // Estilos computados para evitar re-renders
    const iconItemStyle = useMemo(
      () => [
        styles.iconItem,
        isSelected && {
          ...styles.iconItemSelected,
          borderColor: colors.accent,
        },
        isEditing && styles.iconItemEditing,
      ],
      [isSelected, isEditing, colors.accent]
    );

    const avatarStyle = useMemo(
      () => [
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
      ],
      [iconsOptions, colors.border, colors.surface, item.color]
    );

    const iconStyle = useMemo(
      () => ({
        width: iconsOptions === "painted" ? 60 : 32,
        height: iconsOptions === "painted" ? 60 : 32,
        backgroundColor:
          iconsOptions === "painted" ? "transparent" : colors.surface,
        borderRadius: iconsOptions === "painted" ? 0 : 50,
        padding: iconsOptions === "painted" ? 0 : 4,
      }),
      [iconsOptions, colors.surface]
    );

    const labelStyle = useMemo(
      () => [
        styles.iconLabel,
        { color: colors.textSecondary },
        isSelected && {
          ...styles.iconLabelSelected,
          color: colors.accent,
        },
      ],
      [isSelected, colors.textSecondary, colors.accent]
    );

    const badgeDeleteStyle = useMemo(
      () => [
        styles.badgeCircle,
        { backgroundColor: colors.surface, borderColor: colors.error },
      ],
      [colors.surface, colors.error]
    );

    const badgeEditStyle = useMemo(
      () => [
        styles.badgeCircle,
        { backgroundColor: colors.surface, borderColor: colors.text },
      ],
      [colors.surface, colors.text]
    );

    // Handlers optimizados con useCallback
    const handleSelect = useCallback(() => onSelect(item), [onSelect, item]);
    const handleDelete = useCallback(() => onDelete(item.id), [onDelete, item.id]);
    const handleEdit = useCallback(() => onEdit(item), [onEdit, item]);

    return (
      <View style={styles.gridItemWrapper}>
        <Animated.View style={[styles.iconItemContainer, animatedStyle]}>
          <TouchableOpacity
            onPress={handleSelect}
            onLongPress={onLongPress}
            activeOpacity={0.7}
            style={iconItemStyle}
          >
            {/* Avatar / Icono Principal */}
            <View style={avatarStyle}>
              {IconComponent && (
                <IconComponent color={colors.text} style={iconStyle} />
              )}
            </View>

            {/* Etiqueta */}
            <Text style={labelStyle} numberOfLines={1}>
              {categoryLabel}
            </Text>
          </TouchableOpacity>

          {/* --- BOTONES DE EDICIÓN (BADGES) --- */}
          {isEditing && (
            <>
              {/* Botón Eliminar */}
              <Animated.View
                entering={ZoomIn.duration(300).delay(50)}
                exiting={ZoomOut.duration(200)}
                style={styles.badgeDelete}
              >
                <TouchableOpacity onPress={handleDelete} activeOpacity={0.7}>
                  <View style={badgeDeleteStyle}>
                    <MaterialIcons name="close" size={16} color={colors.error} />
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {/* Botón Editar */}
              <Animated.View
                entering={ZoomIn.duration(300).delay(100)}
                exiting={ZoomOut.duration(200)}
                style={styles.badgeEdit}
              >
                <TouchableOpacity onPress={handleEdit} activeOpacity={0.7}>
                  <View style={badgeEditStyle}>
                    <MaterialIcons name="edit" size={14} color={colors.text} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </>
          )}
        </Animated.View>
      </View>
    );
  },
  // Función de comparación personalizada para React.memo
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isEditing === nextProps.isEditing &&
      prevProps.iconsOptions === nextProps.iconsOptions &&
      prevProps.categoryLabel === nextProps.categoryLabel &&
      prevProps.colors === nextProps.colors
    );
  }
);

CategoryGridItem.displayName = "CategoryGridItem";

// --- 2. HOOK PERSONALIZADO PARA LÓGICA DE CATEGORÍAS ---
const useCategoryLogic = (
  inputNameActive: InputNameActive,
  defaultCategories: Category[],
  userCategories: Category[],
  selectingMyCategories: boolean,
  iconsOptions: string,
  t: any
) => {
  // Determinar tipo de transacción
  const iconsKey = useMemo(
    () =>
      inputNameActive === InputNameActive.INCOME
        ? TransactionType.INCOME
        : TransactionType.EXPENSE,
    [inputNameActive]
  );

  // Categorías filtradas
  const categories = useMemo(
    () => (selectingMyCategories ? userCategories : defaultCategories),
    [selectingMyCategories, userCategories, defaultCategories]
  );

  // Pre-computar iconos y labels para evitar cálculos en render
  const enrichedCategories = useMemo(() => {
    return categories.map((item) => {
      const iconData =
        ICON_OPTIONS[iconsOptions as keyof typeof ICON_OPTIONS]?.find(
          (icon) => icon.label === item.icon
        );

      const label =
        item.userId && item.userId !== "default"
          ? item.name
          : t(`icons.${item.name}`);

      return {
        ...item,
        IconComponent: iconData?.icon || null,
        categoryLabel: label,
      };
    });
  }, [categories, iconsOptions, t]);

  return { iconsKey, enrichedCategories };
};

// --- 3. COMPONENTE PRINCIPAL OPTIMIZADO ---
interface CategorySelectorPopoverProps {
  popoverOpen: boolean;
  anchorEl?: any;
  handleClosePopover: () => void;
  selectedCategory: Category | null;
  handleSelectCategory: (category: Category) => void;
  handleDisableCategory: (categoryId: string) => void;
  colors: ThemeColors;
  defaultCategories: Category[];
  userActivesCategories: Category[];
}

export default function CategorySelectorPopover({
  selectedCategory,
  popoverOpen,
  handleClosePopover,
  handleSelectCategory,
  handleDisableCategory,
  colors,
  defaultCategories,
  userActivesCategories,
}: CategorySelectorPopoverProps) {
  const { t } = useTranslation();
  const inputNameActive = useSettingsStore((state) => state.inputNameActive);
  const iconsOptions = useSettingsStore((state) => state.iconsOptions);

  // Estados locales
  const [addingNewCategory, setAddingNewCategory] = React.useState(false);
  const [categoryToEdit, setCategoryToEdit] = React.useState<Category | null>(null);
  const [selectingMyCategories, setSelectingMyCategories] = React.useState(false);
  const [toolsOpen, setToolsOpen] = React.useState(false);

  // Hook personalizado
  const { iconsKey, enrichedCategories } = useCategoryLogic(
    inputNameActive,
    defaultCategories,
    userActivesCategories,
    selectingMyCategories,
    iconsOptions,
    t
  );

  // Animación del FAB
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withTiming(addingNewCategory ? 1 : 0, {
      duration: ANIMATION_DURATION.fab,
    });
  }, [addingNewCategory]);

  // Resetear toolsOpen cuando cambian ciertos estados
  useEffect(() => {
    setToolsOpen(false);
  }, [selectingMyCategories, popoverOpen]);

  // Handlers optimizados
  const handleToggleOptions = useCallback(() => {
    setAddingNewCategory((prev) => {
      if (prev) {
        setCategoryToEdit(null); // Limpiamos al cerrar
      }
      return !prev;
    });
  }, []);

  const handleEditClick = useCallback((category: Category) => {
    setCategoryToEdit(category);
    setAddingNewCategory(true);
    setToolsOpen(false);
  }, []);

  const handleToggleCategoriesSelection = useCallback(() => {
    setSelectingMyCategories((prev) => !prev);
  }, []);

  const handleBackdropPress = useCallback(() => {
    if (toolsOpen) {
      setToolsOpen(false);
      return true;
    }
    return false;
  }, [toolsOpen]);

  // Callbacks para FlatList
  const handleItemSelect = useCallback(
    (cat: Category) => {
      if (toolsOpen) {
        setToolsOpen(false);
      } else {
        handleSelectCategory(cat);
      }
    },
    [toolsOpen, handleSelectCategory]
  );

  const handleItemLongPress = useCallback(() => {
    if (selectingMyCategories) {
      setToolsOpen(true);
    }
  }, [selectingMyCategories]);

  // Estilos animados
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

  // Estilos computados
  const popoverContentStyle = useMemo(
    () => [
      styles.popoverContent,
      {
        backgroundColor: colors.surfaceSecondary,
        borderColor: colors.border,
      },
    ],
    [colors.surfaceSecondary, colors.border]
  );

  const headerStyle = useMemo(
    () => [styles.header, { backgroundColor: colors.surface }],
    [colors.surface]
  );

  const headerTitleStyle = useMemo(
    () => [styles.headerTitle, { color: colors.text }],
    [colors.text]
  );

  const hintTextStyle = useMemo(
    () => [styles.hintText, { color: colors.textSecondary }],
    [colors.textSecondary]
  );

  // KeyExtractor optimizado
  const keyExtractor = useCallback((item: any) => item.id, []);

  // RenderItem optimizado
  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <CategoryGridItem
        item={item}
        isSelected={selectedCategory?.id === item.id}
        isEditing={selectingMyCategories && toolsOpen}
        iconsOptions={iconsOptions}
        colors={colors}
        categoryLabel={item.categoryLabel}
        IconComponent={item.IconComponent}
        onSelect={handleItemSelect}
        onDelete={handleDisableCategory}
        onEdit={handleEditClick}
        onLongPress={handleItemLongPress}
      />
    ),
    [
      selectedCategory?.id,
      selectingMyCategories,
      toolsOpen,
      iconsOptions,
      colors,
      handleItemSelect,
      handleDisableCategory,
      handleEditClick,
      handleItemLongPress,
    ]
  );

  // ListEmptyComponent optimizado
  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={{ color: colors.text }}>
          {t("transactions.noCategories", "No categories found")}
        </Text>
      </View>
    ),
    [colors.text, t]
  );

  return (
    <Modal
      visible={popoverOpen}
      transparent
      animationType="none"
      onRequestClose={handleClosePopover}
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn.duration(ANIMATION_DURATION.modal)}
        exiting={FadeOut.duration(ANIMATION_DURATION.modal)}
        style={styles.backdrop}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={handleClosePopover}
          activeOpacity={1}
        />

        <Animated.View
          entering={ZoomIn.duration(ANIMATION_DURATION.zoom)}
          exiting={ZoomOut.duration(ANIMATION_DURATION.modal)}
          style={popoverContentStyle}
        >
          {/* Header */}
          <View style={headerStyle}>
            <Text style={headerTitleStyle}>{t("transactions.categories")}</Text>

            {/* Switch de categorías */}
            <View style={styles.switchContainer}>
              <MyCustomCategoriesSwitch
                colors={colors}
                value={selectingMyCategories}
                onAction={handleToggleCategoriesSelection}
              />
            </View>

            {/* FAB para agregar */}
            <View style={styles.fabContainer}>
              <TouchableOpacity activeOpacity={0.9} onPress={handleToggleOptions}>
                <Animated.View
                  style={[
                    styles.addUserCategory,
                    fabAnimatedStyle,
                    { borderColor: colors.border },
                  ]}
                >
                  <MaterialIcons name="add" size={28} color={colors.accent} />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contenido */}
          {addingNewCategory ? (
            <CategoryFormInput
              type={iconsKey}
              closeInput={handleToggleOptions}
              setSelectingMyCategories={setSelectingMyCategories}
              categoryToEdit={categoryToEdit}
            />
          ) : (
            <View style={styles.gridContainer}>
                <View
                  style={styles.listWrapper}
                  onStartShouldSetResponder={handleBackdropPress}
                >
                <FlatList
                    data={enrichedCategories}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    numColumns={3}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={ListEmptyComponent}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={9}
                    windowSize={5}
                    initialNumToRender={12}
                    getItemLayout={(data, index) => ({
                      length: 100,
                      offset: 100 * Math.floor(index / 3),
                      index,
                    })}
                  />
                </View>

                {/* Mensaje de ayuda */}
                {selectingMyCategories && !toolsOpen && (
                  <Text style={hintTextStyle}>
                    {t("transactions.longPressToEdit", "Long press to edit categories")}
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
  switchContainer: {
    position: "absolute",
    left: 25,
    top: 20,
  },
  fabContainer: {
    position: "absolute",
    right: 25,
    bottom: 10,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
  gridContainer: {
    flex: 1,
    width: "100%",
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
  gridItemWrapper: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
  },
  iconItemContainer: {
    width: "100%",
    alignItems: "center",
    position: "relative",
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
  iconItemEditing: {
    opacity: 0.9,
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
    width: 32,
    height: 32,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
  },
  badgeDelete: {
    position: "absolute",
    top: -5,
    left: 5,
    zIndex: 10,
  },
  badgeEdit: {
    position: "absolute",
    top: -5,
    right: 5,
    zIndex: 10,
  },
  badgeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  hintText: {
    textAlign: "center",
    fontSize: 10,
    paddingVertical: 5,
    opacity: 0.6,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
});