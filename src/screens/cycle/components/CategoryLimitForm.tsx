import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { t } from "i18next";
import React, { act, useCallback, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
  ScrollView,
  Text,
} from "react-native";
import { SlideInDown, FadeIn, SlideOutDown } from "react-native-reanimated";
import { globalStyles } from "../../../theme/global.styles";
import Animated from "react-native-reanimated";
import { ThemeColors } from "../../../types/navigation";
import { styles } from "./FixedTranasactionsManager";
import CategoryAndAmountInput from "../../../components/forms/Inputs/CategoryAndAmountInput";
import { useTransactionForm } from "../../transactions/constants/hooks/useTransactionForm";
import { useCalculator } from "../../../hooks/useCalculator";
import CalculatorSheet from "../../../components/forms/Inputs/CalculatorSheet";
import CategorySelectorPopover from "../../../components/forms/Inputs/CategorySelector";
import SubmitButton from "../../../components/buttons/submitButton";
import * as Haptics from "expo-haptics";
import { useAuthStore } from "../../../stores/authStore";
import { useCycleStore } from "../../../stores/useCycleStore";
import { useCreditCycleScreen } from "../hooks/useCreditCycleScreen";
import { formStyles } from "./FixedTransactionForm";

interface CategoryLimitFormProps {
  visible: boolean;
  setFormVisible: (visible: boolean) => void;
  colors: ThemeColors;
}

export const CategoryLimitForm = ({
  visible,
  setFormVisible,
  colors,
}: CategoryLimitFormProps) => {
    const setCategoryLimit = useCycleStore((s) => s.setCategoryLimit);
    const { activeCycle} = useCreditCycleScreen();
  const [formError, setFormError] = useState<string | null>(null);
  const currentUserId = useAuthStore((s) => s.user?.id);

  const {
    amount,
    setAmount,
    selectedCategory,
    handleCategoryClick,
    popoverOpen,
    defaultCategoriesOptions,
    handleClosePopover,
    handleSelectCategory,
    handleDisableCategory,
    userActivesCategoriesOptions,
  } = useTransactionForm();
  const { isCalculatorOpen, handleOpenCalculator, setIsCalculatorOpen } =
    useCalculator();

  const handleClose = useCallback(() => {
    setFormVisible(false);
    setFormError(null);
    setAmount("");
  }, [setFormVisible, setFormError, setAmount]);

  const handleSave = () => {
    console.log("Validando gasto fijo:", amount);

    if (!currentUserId) {
      setFormError(t("fixed_tx.error_user", "Usuario no autenticado"));
      return;
    }

    if (parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
      setFormError(t("fixed_tx.error_amount", "Ingresa un monto válido"));
      return;
    }

    if(!activeCycle?.id) return;

    setCategoryLimit({
        cycleId: activeCycle.id,
      limitAmount: Math.abs(parseFloat(amount)),
      categoryId: selectedCategory.id,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFormVisible(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => setFormVisible(false)}
      style={{ flex: 1 }}
    >
      {/* Backdrop - cierra al tocar fuera */}
      <Pressable
        style={styles.backdrop}
        onPress={() => setFormVisible(false)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.kavWrapper}
        pointerEvents="box-none"
      >
        <Animated.View
          entering={SlideInDown.springify()}
          onStartShouldSetResponder={() => true}
          style={[
            styles.sheet,
            styles.formSheet,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={formStyles.formContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.sheetHeader}>
              <Text
                style={[globalStyles.headerTitleSm, { color: colors.text }]}
              >
                {t("cycle_screen.category_limit", "Límite de categoría")}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                style={[globalStyles.btnClose, { backgroundColor: colors.text, borderColor: colors.border }]}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
              >
                <MaterialIcons name="close" size={24} color={colors.surface} />
              </TouchableOpacity>
            </View>

            <View style={{ height: 8 }} />

            <CategoryAndAmountInput
              isReady={true}
              selectedCategory={selectedCategory}
              amount={amount}
              onOpenCalculator={handleOpenCalculator}
              setAmount={setAmount}
              handleCategoryClick={handleCategoryClick}
              colors={colors}
            />

            <View style={{ height: 18 }} />

            <SubmitButton
              disabled={!amount || !selectedCategory}
              handleSave={() => handleSave()}
              selectedCategory={selectedCategory}
              loading={false}
              colors={colors}
            />
          </ScrollView>
        </Animated.View>

        {/* Calculadora */}
        {isCalculatorOpen && (
          <Animated.View
            entering={SlideInDown.duration(300)}
            exiting={SlideOutDown.duration(200)}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              borderTopWidth: 1,
              borderColor: colors.border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 20,
              backgroundColor: colors.surface,
            }}
          >
            <CalculatorSheet
              colors={colors}
              value={amount}
              onChange={(value) => setAmount(value)}
              onClose={() => setIsCalculatorOpen(false)}
            />
          </Animated.View>
        )}

        {/* Popover Categorías */}
        {popoverOpen && (
          <CategorySelectorPopover
            popoverOpen={popoverOpen}
            handleClosePopover={handleClosePopover}
            handleSelectCategory={handleSelectCategory}
            handleDisableCategory={handleDisableCategory}
            selectedCategory={selectedCategory}
            colors={colors}
            defaultCategories={defaultCategoriesOptions}
            userActivesCategories={userActivesCategoriesOptions}
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};
