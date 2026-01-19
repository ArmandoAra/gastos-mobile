import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeColors } from '../../types/navigation'; // Tu tipo de tema

// Props del componente
interface ModernHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showAvatar?: boolean;
  showNotification?: boolean;
  rightAction?: React.ReactNode;
  colors: ThemeColors;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  title,
  showBack = false,
  showAvatar = false,
  showNotification = false,
  rightAction,
  colors
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container, 
      { 
        paddingTop: insets.top + 10,
        backgroundColor: colors.surfaceSecondary,
        borderBottomColor: colors.border,
        shadowColor: colors.shadow,
        elevation: 5,
      }
    ]}>
      <View style={styles.contentRow}>
        
        {/* --- IZQUIERDA: Back Button o Avatar --- */}


        <View style={styles.leftContainer}>
            
            <Text style={[styles.title, { color: colors.text }]}>
              {title || 'Settings'}
            </Text>
          </View>
        </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,

    elevation: 5,
    zIndex: 100,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 12,
    fontFamily: 'FiraSans-Bold',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Tinos-Bold', // Extra bold para look moderno
  },
  
  // Botones Circulares
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },

  // Avatar
  avatarContainer: {
    marginRight: 4,
  },
  avatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 1, // Grosor del anillo
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#334155',
    borderWidth: 2,
    borderColor: '#1e293b', // Mismo color que el fondo del header para "recortar"
  },

  // Derecha
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444', // Rojo alerta
    borderWidth: 1.5,
    borderColor: '#1e293b',
  }
});