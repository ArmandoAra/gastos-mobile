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
});