// Reemplaza el bloque {transactionsData.map(...)} con este componente

import { Theme } from "@react-navigation/native";
import { ThemeColors } from "../../../types/navigation";
import { TouchableOpacity, View,Text,StyleSheet } from "react-native";
import Animated, { FadeInDown, FadeOutDown, LinearTransition }from "react-native-reanimated";
import { globalStyles } from "../../../theme/global.styles";
import { formatCurrency } from "../../../utils/helpers";
import { useTranslation } from "react-i18next";


interface CategoryTransactionItem {
  text: string;
  value: number;
  color: string;
}

interface CategoryTransactionRowProps {
  isCycleSection?: boolean;
  item: CategoryTransactionItem;
  limit?: number;
  idx: number;
  // test: string;
  totalExpenses: number;
  isSelected: boolean;
  onPress: (text: string, value: number, color: string) => void;
  currencySymbol: string;
  colors: ThemeColors;
  isSmallScreen?: boolean;
}

export function CategoryTransactionRow({
  isCycleSection = false,
  limit,
  // test,
  item,
  idx,
  totalExpenses,
  isSelected,
  onPress,
  currencySymbol,
  colors,
  isSmallScreen,
}: CategoryTransactionRowProps) {
  const { t } = useTranslation();

  const percentageOfTotal = totalExpenses > 0
    ? ((item.value / totalExpenses) * 100)
    : 0;

  const hasLimit  = limit != null && limit > 0;
  const ratio     = hasLimit ? item.value / limit : percentageOfTotal / 100;
  const over      = hasLimit && item.value > limit;
  const barWidth  = `${Math.min(ratio * 100, 100)}%` as `${number}%`;
  const barColor  = over ? colors.expense : item.color;
  // console.log("limit",test)

  return (
    <Animated.View
      key={`${item.text}-${idx}`}
      entering={FadeInDown.delay(idx * 50).springify()}
      exiting={FadeOutDown.delay(150)}
      layout={LinearTransition.springify().damping(90)}

    >
      <TouchableOpacity
        onPress={() => onPress(item.text, item.value, item.color)}
        activeOpacity={0.82}
        style={[
          cat_s.row,
          {
            backgroundColor: isSelected ? item.color + '18' : 'transparent',
            borderColor:     isSelected ? item.color + '55' : 'transparent',
          },
        ]}
        accessible
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
      >
        {/* Accent bar lateral */}
        <View style={[cat_s.accentBar, { backgroundColor: item.color }]} />

        {/* Icono */}
        <View style={[cat_s.iconBox, { backgroundColor: item.color + '22' }]}>
          <View style={[cat_s.colorDot, { backgroundColor: item.color }]} />
        </View>

        {/* Contenido */}
        <View style={{ flex: 1 }}>
          {/* Fila superior: nombre + monto */}
          <View style={cat_s.labelRow}>
            <Text
              style={[globalStyles.bodyTextBase, { color: colors.text }, isSmallScreen && cat_s.textSmall]}
              numberOfLines={1}
            >
              {t(`icons.${item.text}`, item.text)}
            </Text>

            <View style={cat_s.rightGroup}>
              {/* Monto */}
              <Text
                style={[
                  globalStyles.amountXs,
                  { color: over ? colors.expense : colors.text },
                  isSmallScreen && cat_s.textSmall,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                -{currencySymbol}{formatCurrency(item.value)}
                {hasLimit && (
                  <Text style={{ color: colors.textSecondary }}>
                    {' '}/ {currencySymbol}{formatCurrency(limit!)}
                  </Text>
                )}
              </Text>

              {/* Chip de porcentaje */}
              <View style={[cat_s.percentChip, { backgroundColor: item.color }]}>
                <Text style={[cat_s.percentText, { color: 'transparent' }]}>
                  {hasLimit
                    ? `${Math.min(ratio * 100, 100).toFixed(0)}%`
                    : `${percentageOfTotal.toFixed(1).replace('.', ',')}%`
                  }
                </Text>
              </View>
            </View>
          </View>

          {/* Barra de progreso */}
          <View style={[cat_s.track, { backgroundColor: colors.border }]}>
            <View style={[cat_s.fill, { width: barWidth, backgroundColor: barColor }]} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const cat_s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingRight: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 6,
    overflow: 'hidden',
  },
  accentBar: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 99,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 99,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  percentChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99,
  },
  percentText: {
    fontSize: 10,
    fontFamily: 'FiraSans-Bold',
  },
  track: {
    height: 6,
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 99,
  },
  textSmall: {
    fontSize: 11,
  },
});