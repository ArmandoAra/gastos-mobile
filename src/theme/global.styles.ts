import { StyleSheet } from 'react-native';

// Tipos de fuentes para mejor organización
export const fontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
} as const;

// Tamaños de fuente consistentes
export const fontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
} as const;

export const globalStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },

  // Buttons
  smallButton: {
    width: 40, height: 40, borderRadius: 25, alignItems: 'center', justifyContent: 'center'
  },
  mediumButton: { 
    flex: 1,
    height: 40,
    borderRadius: 12
  },
  largeButton: {},
  btnPrimary: {
    flex: 1,
    width: '100%',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  btnSecondary: {
    flex: 1,
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    elevation: 2,
  },

  // Text
  headerTitleSm: { fontSize: fontSizes.lg, fontFamily: 'Tinos-Bold' },
  headerTitleBase: { fontSize: fontSizes.xl, fontFamily: 'Tinos-Bold' },
  headerTitleXL: { fontSize: fontSizes.xxl, fontFamily: 'Tinos-Bold' },

  bodyTextXs: { fontSize: fontSizes.xs, fontFamily: 'FiraSans-Regular' },
  bodyTextSm: { fontSize: fontSizes.sm, fontFamily: 'FiraSans-Regular' },
  bodyTextBase: { fontSize: fontSizes.base, fontFamily: 'FiraSans-Regular' },
  bodyTextLg: { fontSize: fontSizes.lg, fontFamily: 'FiraSans-Regular' },
  bodyTextXl: { fontSize: fontSizes.xl, fontFamily: 'FiraSans-Regular' },

  // AmountsText
  amountXs: { fontSize: fontSizes.sm, fontFamily: 'FiraSans-Bold' },
  amountSm: { fontSize: fontSizes.lg, fontFamily: 'FiraSans-Bold' },
  amountBase: { fontSize: fontSizes.xxl, fontFamily: 'FiraSans-Bold' },
  amountLg: { fontSize: 36, fontFamily: 'FiraSans-Bold' },
  amountXl: { fontSize: 48, fontFamily: 'FiraSans-Bold' },

  // Account
  accountSelectorTextContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  }, 

  inputLg: {
    fontSize: fontSizes.lg,
    fontFamily: 'FiraSans-Regular',
    minHeight: 80, // Altura base
    paddingBottom: 20,
    paddingTop: 0,
  },

  amountInput: {
    fontSize: fontSizes.xxl,
    fontFamily: 'FiraSans-Bold',
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },

});