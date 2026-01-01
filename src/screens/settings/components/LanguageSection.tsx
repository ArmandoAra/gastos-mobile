import React from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Platform
} from 'react-native';
import Animated, { 
    FadeIn, 
    FadeInRight,
    ZoomIn,
    Layout, 
    FadeInLeft
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../../../stores/settingsStore';
import { ThemeColors } from '../../../types/navigation';

interface LanguageSectionProps {
    colors: ThemeColors;
}

// Constantes de idiomas
const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇧🇷' },
] as const;

export default function LanguageSection({ colors }: LanguageSectionProps) {
    const { language, setLanguage } = useSettingsStore();

    const handleLanguageChange = (code: string) => {
        setLanguage(code);
        // Aquí puedes agregar lógica para cambiar el idioma de i18n si usas react-i18next
        // i18n.changeLanguage(code);
    };

    return (
        <Animated.View 
            entering={FadeIn.duration(500).delay(100)}
            style={[
                styles.card, 
                { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border 
                }
            ]}
        >
            {/* HEADER */}
            <View style={styles.headerRow}>
                <View style={styles.titleContainer}>
                    <View>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            Language
                        </Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                            Choose your preferred language
                        </Text>
                    </View>
                </View>
            </View>

            {/* LISTA DE IDIOMAS */}
            <View style={styles.listContainer}>
                {LANGUAGES.map((lang, index) => {
                    const isSelected = language === lang.code;
                    
                    return (
                        <Animated.View
                            key={lang.code}
                            entering={FadeInRight.delay(index * 100).springify()}
                        >
                             {/* Checkmark con animación */}
                                {isSelected && (
                                    <Animated.View 
                                        entering={FadeIn.duration(200)}
                                        style={styles.checkWrapper}
                                    >
                                        <View style={[styles.checkBadge, { backgroundColor: colors.accent }]}>
                                                                <MaterialIcons name="check" size={12} color={colors.text} />
                                                            </View>
                                    </Animated.View>
                                )}
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => handleLanguageChange(lang.code)}
                                style={[
                                    styles.languageItem,
                                    { 
                                        backgroundColor: isSelected 
                                            ? colors.surfaceSecondary
                                            : 'transparent',
                                        borderColor: isSelected 
                                            ? colors.accent 
                                            : colors.border,
                                        borderWidth: isSelected ? 2 : 1,
                                    }
                                ]}
                            >
                                <View style={styles.languageInfo}>
                                    {/* Contenedor de Bandera */}
                                    <View style={[
                                        styles.flagContainer, 
                                        { 
                                            backgroundColor: isSelected 
                                                ? colors.accent + '10' 
                                                : colors.background,
                                            borderColor: isSelected 
                                                ? colors.accent + '30' 
                                                : colors.border + '50'
                                        }
                                    ]}>
                                        <Text style={styles.flagText}>{lang.flag}</Text>
                                    </View>
                                    
                                    <View style={styles.languageTextContainer}>
                                        <Text style={[
                                            styles.languageName, 
                                            { 
                                                color: isSelected ? colors.text : colors.textSecondary,
                                                fontWeight: isSelected ? '700' : '600'
                                            }
                                        ]}>
                                            {lang.name}
                                        </Text>
                                        <Text style={[
                                            styles.nativeName, 
                                            { color: colors.textSecondary }
                                        ]}>
                                            {lang.native}
                                        </Text>
                                    </View>
                                </View>

                               
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            }
        }),
        borderWidth: 0.5,
    },
    headerRow: {
        marginBottom: 20,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '300',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 13,
        fontWeight: '400',
    },
    listContainer: {
        gap: 10,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        minHeight: 70,
    },
    languageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    flagContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    flagText: {
        fontSize: 24,
    },
    languageTextContainer: {
        flex: 1,
    },
    languageName: {
        fontSize: 16,
        marginBottom: 3,
    },
    nativeName: {
        fontSize: 13,
        opacity: 0.8,
    },
    checkWrapper: {
        marginLeft: 8,
        zIndex: 1,
    },
    infoFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        paddingTop: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
    },
    infoText: {
        fontSize: 12,
        flex: 1,
    }, 
     checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
       
    }
});

// ============================================
// VERSIÓN CON i18n (OPCIONAL)
// ============================================

/*
// Si usas react-i18next, importa:
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

// En el componente:
const { i18n } = useTranslation();

// Y en handleLanguageChange:
const handleLanguageChange = (code: string) => {
    setLanguage(code);
    i18n.changeLanguage(code); // Cambia el idioma en i18next
};

// Puedes traducir los textos:
<Text style={[styles.headerTitle, { color: colors.text }]}>
    {t('settings.language.title')}
</Text>
*/
