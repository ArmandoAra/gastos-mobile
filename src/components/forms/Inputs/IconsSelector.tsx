import React from "react";
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
import { IconOption } from "../../../constants/icons";
import { ThemeColors } from "../../../types/navigation";

interface IconsSelectorPopoverProps {
  popoverOpen: boolean;
  anchorEl?: any; // Se mantiene por compatibilidad de tipos, aunque no se use en móvil
  handleClosePopover: () => void;
  iconOptions: IconOption[];
  selectedIcon: IconOption | null;
  handleSelectIcon: (icon: IconOption) => void;
  colors: ThemeColors;
}

export default function IconsSelectorPopover({
  popoverOpen,
  handleClosePopover,
  iconOptions,
  selectedIcon,
  handleSelectIcon,
  colors,
}: IconsSelectorPopoverProps) {

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
            <Text style={[styles.headerTitle, { color: colors.text }]}>SELECT CATEGORY ICON</Text>
          </View>

          {/* Grid de Iconos */}
          <View style={styles.gridContainer}>
            <FlatList
              data={iconOptions}
              keyExtractor={(item) => item.id}
              numColumns={3}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.listContent}
              
              // Componente por si la lista está vacía (Debugging)
              ListEmptyComponent={
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: colors.text }}>No icons found</Text>
                </View>
              }

              renderItem={({ item }) => {
                const isSelected = selectedIcon?.id === item.id;
                
                // Extraemos el componente para renderizarlo como JSX
                const IconComponent = item.icon;

                return (
                  // 3. USO DE VIEW NORMAL PARA LOS ITEMS (Sin animación de entrada para evitar bugs visuales)
                  <View style={styles.gridItemWrapper}>
                    <TouchableOpacity
                      onPress={() => handleSelectIcon(item)}
                      activeOpacity={0.7} // Feedback táctil mejorado
                      style={[
                        styles.iconItem,
                        isSelected && { ...styles.iconItemSelected, borderColor: colors.accent },
                      ]}
                    >
                      <LinearGradient
                        colors={item.gradientColors}
                        style={styles.avatar}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        {/* Renderizado Seguro del Icono */}
                        {IconComponent && <IconComponent size={24} color={colors.text} />}
                      </LinearGradient>

                      <Text
                        style={[
                          styles.iconLabel,
                          { color: colors.textSecondary },
                          isSelected && { ...styles.iconLabelSelected, color: colors.accent },
                        ]}
                        numberOfLines={1}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>
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