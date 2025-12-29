import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  subtitle,
  showBack,
  showAvatar = false,
  showNotification = false,
  rightAction,
  colors
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Lógica de Saludo basada en la hora
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning ☀️';
    if (hours < 18) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const currentIconPage = useMemo(() => {
    switch (title) {
      case 'Transactions':
        return require('../../../assets/icons/transactions.png');
      case 'Analytics':
        return require('../../../assets/icons/analytics.png');
      case 'Settings':
        return require('../../../assets/icons/settings.png');
      default:
        return null;
    }
  }, [title]);

  return (
    <View style={[
      styles.container, 
      { 
        paddingTop: insets.top + 10,
        backgroundColor: "#A8F1FF", // O un color transparente si prefieres
        borderBottomColor: colors.border,
        elevation: 5,
      }
    ]}>
      <View style={styles.contentRow}>
        
        {/* --- IZQUIERDA: Back Button o Avatar --- */}
        <View style={styles.leftContainer}>
                <View
                  style={styles.avatarRing}
                >
                   {/* Placeholder o Imagen Real */}
                   <Image 
                      source={currentIconPage} 
                      style={styles.avatarImage} 
                   />
                </View>
          
        

          {/* --- CENTRO/IZQ: Títulos --- */}
          <View style={[styles.textContainer, (showBack || showAvatar) ? { marginLeft: 12 } : {}]}>
            {subtitle || (showAvatar && !title) ? (
               <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                  {subtitle || getGreeting()}
               </Text>
            ) : null}
            
            <Text style={[styles.title, { color: colors.text }]}>
              {title || 'Dashboard'}
            </Text>
          </View>
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
    // Sombra suave para separar del contenido
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
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
  },
  greeting: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800', // Extra bold para look moderno
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