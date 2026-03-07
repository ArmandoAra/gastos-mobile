import { MaterialCommunityIcons } from "@expo/vector-icons";
import { t } from "i18next";
import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Text,
} from "react-native";
import { SlideInDown, FadeIn, SlideOutDown } from "react-native-reanimated";
import { ICON_OPTIONS } from "../../../constants/icons";
import { globalStyles } from "../../../theme/global.styles";
import Animated from "react-native-reanimated";
import { FixedTransaction } from "../../../interfaces/cycle.interface";
import { ThemeColors } from "../../../types/navigation";
import { styles } from "./FixedTranasactionsManager";
import CategoryAndAmountInput from "../../../components/forms/Inputs/CategoryAndAmountInput";
import { useTransactionForm } from "../../transactions/constants/hooks/useTransactionForm";
import { useCalculator } from "../../../hooks/useCalculator";
import CalculatorSheet from "../../../components/forms/Inputs/CalculatorSheet";
import CategorySelectorPopover from "../../../components/forms/Inputs/CategorySelector";
import SubmitButton from "../../../components/buttons/submitButton";
import {
  CategoryLabelSpanish,
  CategoryLabelPortuguese,
} from "../../../interfaces/categories.interface";
import * as Haptics from "expo-haptics";
import { set } from "date-fns";
import { TransactionType } from "../../../interfaces/data.interface";
import { useAuthStore } from "../../../stores/authStore";
import { useCycleStore } from "../../../stores/useCycleStore";
import { DayAndDescriptionInput } from "./DayAndDescriptionInput";

interface FixedTransactionFormProps {
  visible: boolean;
  setFormVisible: (visible: boolean) => void;
  form: Omit<
    FixedTransaction,
    | "id"
    | "isActive"
    | "created_at"
    | "updated_at"
    | "isPaid"
    | "date"
    | "slug_category_name"
  >;
  setForm: (
    form:
      | Omit<
          FixedTransaction,
          | "id"
          | "isActive"
          | "created_at"
          | "updated_at"
          | "isPaid"
          | "date"
          | "slug_category_name"
        >
      | ((
          prev: Omit<
            FixedTransaction,
            | "id"
            | "isActive"
            | "created_at"
            | "updated_at"
            | "isPaid"
            | "date"
            | "slug_category_name"
          >,
        ) => Omit<
          FixedTransaction,
          | "id"
          | "isActive"
          | "created_at"
          | "updated_at"
          | "isPaid"
          | "date"
          | "slug_category_name"
        >),
  ) => void;
  colors: ThemeColors;
}

export const FixedTransactionForm = ({
  visible,
  setFormVisible,
  form,
  setForm,
  colors,
}: FixedTransactionFormProps) => {
  const [formError, setFormError] = useState<string | null>(null);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const accountSelected = useCycleStore((s) => s.selectedCycleAccount);
  const addFixedTransaction = useCycleStore((s) => s.addFixedTransaction);
  const [day, setDay] = useState(form.dayOfMonth);
  const [description, setDescription] = useState(form.description);

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
    setDay(1);
    setDescription("");
  }, [setFormVisible, setFormError, setAmount, setDay, setDescription]);

  const handleDayChange = (newDay: number) => {
    setDay(newDay);
    setForm((prev) => ({ ...prev, dayOfMonth: newDay }));
  }

  const handleDescriptionChange = (newDesc: string) => {
    setDescription(newDesc);
    setForm((prev) => ({ ...prev, description: newDesc }));
  }

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
    const day = form.dayOfMonth; //Tengo que validar el dia que si el mes tiene 30 dias no se pueda poner 31, etc
    if (isNaN(day) || day < 1 || day > 31) {
      setFormError(t("fixed_tx.error_day", "Día inválido (1-31)"));
      return;
    }

    // Gestión de slugs para categorías
    const defaultCategoriesSlug: string[] = [
      CategoryLabelSpanish[
        selectedCategory.name as keyof typeof CategoryLabelSpanish
      ] || "",
      CategoryLabelPortuguese[
        selectedCategory.name as keyof typeof CategoryLabelPortuguese
      ] || "",
    ];
    const isNewCategory = !defaultCategoriesSlug.includes(
      selectedCategory.name as string,
    );

    const now = new Date().toISOString();
    addFixedTransaction({
      type: TransactionType.EXPENSE,
      amount: Math.abs(parseFloat(amount)),
      account_id: accountSelected,
      user_id: currentUserId,
      description: form.description,
      category_icon_name: selectedCategory.icon,
      categoryId: selectedCategory.id,
      isPaid: false,
      isActive: true,
      dayOfMonth: form.dayOfMonth,
      slug_category_name: isNewCategory
        ? [selectedCategory.name as string, ...defaultCategoriesSlug]
        : defaultCategoriesSlug,
      date: now,
      created_at: now,
      updated_at: now,
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
                {t("fixed_tx.new", "Nuevo gasto fijo")}
              </Text>
              <TouchableOpacity
                onPress={() => setFormVisible(false)}
                style={styles.closeBtn}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <CategoryAndAmountInput
              isReady={true}
              selectedCategory={selectedCategory}
              amount={amount}
              onOpenCalculator={handleOpenCalculator}
              setAmount={setAmount}
              handleCategoryClick={handleCategoryClick}
              colors={colors}
            />

            <DayAndDescriptionInput 
              isReady={true}
              dayOfMonth={form.dayOfMonth}
              onDayChange={handleDayChange}
              description={form.description}
              onDescriptionChange={handleDescriptionChange}
              colors={colors}
            />

            <SubmitButton
              disabled={!amount || !selectedCategory}
              handleSave={() => handleSave()}
              selectedCategory={selectedCategory}
              // option={isExpense ? addOption.Spend : addOption.Income}
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

const formStyles = StyleSheet.create({
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: "FiraSans-Bold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 14,
    marginBottom: 6,
  },
  iconPicker: {
    flexGrow: 0,
    marginBottom: 4,
  },
  iconOption: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "FiraSans-Regular",
    padding: 0,
  },
  currencyPrefix: {
    fontSize: 15,
    fontFamily: "FiraSans-Bold",
    marginRight: 6,
  },
  chipRow: {
    flexGrow: 0,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
    fontFamily: "FiraSans-Bold",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "FiraSans-Regular",
    marginTop: 8,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 20,
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: "FiraSans-Bold",
    color: "#fff",
  },
});
