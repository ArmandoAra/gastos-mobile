import React from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Platform,
    AccessibilityInfo
} from 'react-native';
import Animated, { 
    FadeIn, 
    FadeInRight,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../../../stores/settingsStore';
import { ThemeColors } from '../../../types/navigation';
import i18n from '../../../i18n';
import { LanguageCode, languages } from '../../../constants/languages';
import { useTranslation } from 'react-i18next';

interface LanguageSectionProps {
    colors: ThemeColors;
}

export default function LanguageSection({ colors }: LanguageSectionProps) {
    const { t } = useTranslation();
    const { language, setLanguage } = useSettingsStore();

    const handleLanguageChange = (code: LanguageCode) => {
        setLanguage(code);
        i18n.changeLanguage(code);

        // Feedback para lector de pantalla
        if (Platform.OS !== 'web') {
            AccessibilityInfo.announceForAccessibility(`${t('language.changed_to', 'Language changed to')} ${code}`);
        }
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
            {/* HEADER ACCESIBLE */}
            <View
                style={styles.headerRow}
                accessibilityRole="header"
            >
                <View style={styles.titleContainer}>
                    <View style={{ flex: 1 }}>
                        <Text
                            style={[styles.headerTitle, { color: colors.text }]}
                            maxFontSizeMultiplier={1.5} // Evita que el título rompa todo el layout
                        >
                            {t('language.titleHeader')}
                        </Text>
                        <Text
                            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
                            maxFontSizeMultiplier={1.5}
                        >
                            {t('language.subtitle')}
                        </Text>
                    </View>
                </View>
            </View>

            {/* LISTA DE IDIOMAS (RADIOGROUP) */}
            <View
                style={styles.listContainer}
                accessibilityRole="radiogroup"
                accessibilityLabel={t('language.select_language', 'Select a language')}
            >
                {languages.map((lang, index) => {
                    const isSelected = language === lang.code;
                    
                    return (
                        <Animated.View
                            key={lang.code}
                            entering={FadeInRight.delay(index * 100).springify()}
                        >
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => handleLanguageChange(lang.code)}

                                // Accesibilidad: Radio Button
                                accessibilityRole="radio"
                                accessibilityState={{ checked: isSelected }}
                                accessibilityLabel={`${lang.name}, ${lang.native}`}
                                accessibilityHint={isSelected ? t('language.selected_hint', 'Currently selected') : t('language.select_hint', 'Double tap to select')}

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
                                <View style={styles.languageContentRow}>

                                    {/* 1. Bandera */}
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
                                    
                                    {/* 2. Textos (Flexible para no chocar) */}
                                    <View style={styles.languageTextContainer}>
                                        <Text
                                            style={[
                                                styles.languageName,
                                                {
                                                    color: isSelected ? colors.text : colors.textSecondary,
                                                    fontWeight: isSelected ? '700' : '600'
                                                }
                                            ]}
                                            numberOfLines={1}
                                            adjustsFontSizeToFit // Ayuda a que quepa si es muy largo
                                        >
                                            {lang.name}
                                        </Text>
                                        <Text
                                            style={[styles.nativeName, { color: colors.textSecondary }]}
                                        >
                                            {lang.native}
                                        </Text>
                                    </View>

                                    {/* 3. Checkmark (En flujo, no absoluto) */}
                                    <View style={{ width: 24, alignItems: 'center' }}>
                                        {isSelected && (
                                            <Animated.View
                                                entering={FadeIn.duration(200)}
                                                style={[styles.checkBadge, { backgroundColor: colors.accent }]}
                                            >
                                                <MaterialIcons
                                                    name="check"
                                                    size={14}
                                                    color={colors.surface}
                                                    importantForAccessibility="no"
                                                />
                                            </Animated.View>
                                        )}
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
        marginBottom: 10,
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
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'FiraSans-Regular',
        marginBottom: 4,
        flexWrap: 'wrap', // Permite que baje de línea
    },
    headerSubtitle: {
        fontSize: 13,
        fontFamily: 'FiraSans-Regular',
        flexWrap: 'wrap',
    },
    listContainer: {
        gap: 10,
    },
    languageItem: {
        paddingVertical: 12, // Padding vertical flexible
        paddingHorizontal: 16,
        borderRadius: 12,
        // Usamos minHeight en lugar de height fijo
        minHeight: 72,
        justifyContent: 'center',
    },
    languageContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    flagContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        // Evitamos que la bandera se aplaste
        flexShrink: 0, 
    },
    flagText: {
        fontSize: 24,
    },
    languageTextContainer: {
        flex: 1, // Toma todo el espacio disponible central
        justifyContent: 'center',
    },
    languageName: {
        fontSize: 16,
        marginBottom: 2,
    },
    nativeName: {
        fontSize: 13,
        opacity: 0.8,
    },
    // Checkbadge ahora es relativo, no absoluto
    checkBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    }
});