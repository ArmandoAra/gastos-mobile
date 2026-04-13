import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
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
  StyleSheet,
  Text,
} from "react-native";
import { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { globalStyles } from "../../../theme/global.styles";
import Animated from "react-native-reanimated";
import { FixedTransaction } from "../../../interfaces/cycle.interface";
import { ThemeColors } from "../../../types/navigation";
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
import { TransactionType } from "../../../interfaces/data.interface";
import { useAuthStore } from "../../../stores/authStore";
import { useCycleStore } from "../../../stores/useCycleStore";
import { DayAndDescriptionInput } from "./DayAndDescriptionInput";

interface FixedTransactionFormProps {
  visible: boolean;
  setFormVisible: (visible: boolean) => void;
  availableCycleDays: number[]; 
  colors: ThemeColors;
  // ✨ NUEVO: Propiedad opcional para recibir los datos a editar
  initialData?: FixedTransaction | null;
}

export const FixedTransactionForm = ({
  visible,
  setFormVisible,
  availableCycleDays,
  colors,
  initialData = null, // Valor por defecto
}: FixedTransactionFormProps) => {
  const [formError, setFormError] = useState<string | null>(null);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const accountSelected = useCycleStore((s) => s.selectedCycleAccount);
  const addFixedTransaction = useCycleStore((s) => s.addFixedTransaction);
  const updateFixedTransaction = useCycleStore((s) => s.updateFixedTransaction);

  const [day, setDay] = useState(availableCycleDays ? availableCycleDays[0] : 1);
  const [description, setDescription] = useState('');

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
  const { toggleFixedTransactionPaid } = useCycleStore();

  const { isCalculatorOpen, handleOpenCalculator, setIsCalculatorOpen } = useCalculator();

  // ✨ NUEVO: Efecto para rellenar los datos cuando se abre en modo edición
  useEffect(() => {
    if (visible) {
      if (initialData) {
        // Modo Edición: Poblar campos
        setAmount(initialData.amount.toString());
        setDay(initialData.dayOfMonth);
        setDescription(initialData.description || '');

        // Buscar y setear la categoría correcta
        const allCategories = [...defaultCategoriesOptions, ...userActivesCategoriesOptions];
        const cat = allCategories.find(c => c.id === initialData.categoryId);
        if (cat) {
          handleSelectCategory(cat);
        }
      } else {
        // Modo Creación: Limpiar campos
        setAmount("");
        setDay(availableCycleDays ? availableCycleDays[0] : 1);
        setDescription("");
      }
    }
  }, [visible, initialData, availableCycleDays]);

  const handleClose = useCallback(() => {
    setFormError(null);
    setFormVisible(false);
  }, [setFormVisible]);

  const handleDayChange = (newDay: number) => setDay(newDay);
  const handleDescriptionChange = (newDesc: string) => setDescription(newDesc);

  const handleSave = () => {
    if (!currentUserId) {
      setFormError(t("fixed_tx.error_user", "Usuario no autenticado"));
      return;
    }

    if (parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
      setFormError(t("fixed_tx.error_amount", "Ingresa un monto válido"));
      return;
    }

    const defaultCategoriesSlug: string[] = [
      CategoryLabelSpanish[selectedCategory.name as keyof typeof CategoryLabelSpanish] || "",
      CategoryLabelPortuguese[selectedCategory.name as keyof typeof CategoryLabelPortuguese] || "",
    ];

    const isNewCategory = !defaultCategoriesSlug.includes(selectedCategory.name as string);
    const now = new Date().toISOString();

    if (initialData) {
      updateFixedTransaction(initialData.id, {
        amount: Math.abs(parseFloat(amount)),
        description: description,
        category_icon_name: selectedCategory.icon,
        categoryId: selectedCategory.id,
        dayOfMonth: day,
        slug_category_name: isNewCategory
          ? [selectedCategory.name as string, ...defaultCategoriesSlug]
          : defaultCategoriesSlug,
        updated_at: now,
      });
      toggleFixedTransactionPaid(initialData.id, true); // Asegura que el toggle se actualice si el monto cambia
    } else {
      addFixedTransaction({
        type: TransactionType.EXPENSE,
        amount: Math.abs(parseFloat(amount)),
        account_id: accountSelected,
        user_id: currentUserId,
        description: description,
        category_icon_name: selectedCategory.icon,
        categoryId: selectedCategory.id,
        isPaid: false,
        isActive: true,
        dayOfMonth: day,
        slug_category_name: isNewCategory
          ? [selectedCategory.name as string, ...defaultCategoriesSlug]
          : defaultCategoriesSlug,
        date: now,
        created_at: now,
        updated_at: now,
      });
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFormVisible(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      style={{ flex: 1 }}
    >
      <Pressable style={formStyles.backdrop} onPress={handleClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={formStyles.kavWrapper}
        pointerEvents="box-none"
      >
        <Animated.View
          entering={SlideInDown.springify()}
          onStartShouldSetResponder={() => true}
          style={[
            formStyles.sheet,
            formStyles.formSheet,
            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
          ]}
        >
          <View style={[formStyles.handle, { backgroundColor: colors.border }]} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={formStyles.formContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={formStyles.sheetHeader}>
              <Text style={[globalStyles.headerTitleSm, { color: colors.text }]}>
                {/* ✨ NUEVO: Título dinámico según el modo */}
                {initialData ? t("fixed_tx.edit_fixed_tx", "Editar transacción fija") : t("fixed_tx.new_fixed_tx", "Nueva transacción fija")}
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

            <DayAndDescriptionInput 
              isReady={true}
              availableCycleDays={availableCycleDays}
              dayOfMonth={day}
              onDayChange={handleDayChange}
              description={description}
              onDescriptionChange={handleDescriptionChange}
              colors={colors}
            />

            <View style={{ height: 18 }} />

            <SubmitButton
              disabled={!amount || !selectedCategory}
              handleSave={handleSave}
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
export const formStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  kavWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    maxHeight: '85%',
    minHeight: '75%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  formSheet: {
    // para el form usamos la misma base
  },
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
  handle: {
    width: 40,
    height: 4,
    borderRadius: 99,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  closeButton: {
    position: 'absolute',
    left: 12,
    top: 5,
    padding: 6,
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderRadius: 24,
  },
});
