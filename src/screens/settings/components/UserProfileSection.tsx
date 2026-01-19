import React, { useState, useEffect } from 'react';
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
    FadeOut, 
    ZoomIn, 
    ZoomOut 
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { TextInput, ActivityIndicator } from 'react-native-paper';
import { useAuthStore } from '../../../stores/authStore';
import { getInitials } from '../../../utils/helpers';
import { ThemeColors } from '../../../types/navigation';
import { getCurrencySymbol, currencyOptions } from '../../../constants/currency';
import CurrencySelector from './CurrencySelector';
import { useTranslation } from 'react-i18next';

// Interfaces
interface LocalUser {
    name: string;
    email: string;
    currency: string;
}

const INITIAL_USER_STATE: LocalUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    currency: 'USD'
};

export default function UserProfileSection({ colors }: { colors: ThemeColors }) {
    // 1. Hooks y Estado
    const { user: sessionUser, updateUser, setCurrencySymbol } = useAuthStore();
    const { t } = useTranslation();
    
    const [user, setUser] = useState<LocalUser>(INITIAL_USER_STATE);
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState('');
    const [tempEmail, setTempEmail] = useState('');
    const [tempCurrency, setTempCurrency] = useState('USD');
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // 2. Sincronizar sesión con estado local
    useEffect(() => {
        if (sessionUser) {
            const userData: LocalUser = {
                name: sessionUser.name || '',
                email: sessionUser.email || '',
                currency: sessionUser.currency || 'USD',
            };
            setUser(userData);
            setTempName(userData.name);
            setTempEmail(userData.email);
            setTempCurrency(userData.currency);
        }
    }, [sessionUser]);

    const hasChanges = tempName !== user.name || tempEmail !== user.email || tempCurrency !== user.currency;

    // 3. Handlers
    const handleSave = async () => {
        if (!tempName.trim()) {
            setApiError(t('commonWarnings.notEmptyField'));
            // Anunciar error a lector de pantalla
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(t('commonWarnings.notEmptyField'));
            return;
        }

        if (!hasChanges) {
            setIsEditing(false);
            return;
        }

        setIsLoading(true);
        setApiError(null);
        const currencySymbol = getCurrencySymbol(tempCurrency);

        try {
            // Asumiendo que updateUser devuelve una promesa
            updateUser({ name: tempName, email: tempEmail, currency: tempCurrency });

            setUser({ name: tempName, email: tempEmail, currency: tempCurrency });
            setCurrencySymbol(currencySymbol);
            setIsEditing(false);

            // Confirmación de éxito accesible
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(t('profile.saveSuccess', 'Profile updated successfully'));

        } catch (err) {
            setApiError(t('commonWarnings.someErrorOccurred'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setTempName(user.name);
        setTempEmail(user.email);
        setTempCurrency(user.currency);
        setApiError(null);
        setIsEditing(false);
    };

    return (
        <Animated.View 
            entering={FadeIn.duration(300)}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessible={false} // El contenedor no debe ser foco, sino sus hijos
        >
            {/* --- BOTÓN DE EDICIÓN FLOTANTE --- */}
            {!isEditing && (
                <Animated.View 
                    entering={ZoomIn} 
                    exiting={ZoomOut}
                    style={styles.editIconWrapper}
                >
                    <TouchableOpacity 
                        onPress={() => setIsEditing(true)}
                        style={[styles.editIconButton, { shadowColor: colors.text, backgroundColor: colors.text }]}
                        accessibilityRole="button"
                        accessibilityLabel={t('profile.edit_profile', 'Edit profile')}
                        accessibilityHint={t('profile.edit_hint', 'Double tap to edit your name, email and currency')}
                    >
                        <MaterialIcons
                            name="edit"
                            size={24}
                            color={colors.accent}
                            importantForAccessibility="no"
                        />
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* --- HEADER TÍTULO --- */}
            <View style={styles.headerRow} accessibilityRole="header">
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.settingsTitle')}</Text>
            </View>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <View style={styles.contentRow}>
                
                {/* AVATAR */}
                {/* Usamos un View normal, el Animated.View a veces complica la accesibilidad si no se configura bien */}
                <View
                    style={[styles.avatarContainer, { backgroundColor: colors.surfaceSecondary }]}
                    importantForAccessibility="no"
                >
                    <Text
                        style={[styles.avatarText, { color: colors.text }]}
                        maxFontSizeMultiplier={1.5} // Evita que la letra rompa el círculo
                    >
                        {getInitials(user.name)}
                    </Text>
                </View>

                {/* FORMULARIO / VISTA DE DETALLES */}
                <View style={styles.detailsContainer}>
                    
                    {/* MENSAJE DE ERROR (LIVE REGION) */}
                    {apiError && (
                        <Animated.View 
                            entering={FadeIn} 
                            exiting={FadeOut}
                            style={[styles.errorBox, { backgroundColor: colors.surface, borderColor: colors.error }]}
                            accessibilityRole="alert"
                            accessibilityLiveRegion="polite"
                        >
                            <MaterialIcons name="error" size={20} color={colors.error} style={{ marginRight: 8 }} importantForAccessibility="no" />
                            <Text style={[styles.errorText, { color: colors.error }]}>{apiError}</Text>
                        </Animated.View>
                    )}

                    {isEditing ? (
                        // ================= MODO EDICIÓN =================
                        <Animated.View entering={FadeIn}>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    mode="outlined"
                                    label={t('profile.name')}
                                    value={tempName}
                                    onChangeText={setTempName}
                                    disabled={isLoading}
                                    style={[styles.input, { backgroundColor: colors.surfaceSecondary || colors.background }]}
                                    textColor={colors.text}
                                    outlineColor={colors.border}
                                    activeOutlineColor={colors.accent}
                                    maxLength={30}
                                    dense

                                    // Accesibilidad
                                    accessibilityLabel={t('profile.name')}
                                    returnKeyType="next"
                                    autoCapitalize="words"
                                    autoComplete="name"
                                    textContentType="name"
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <TextInput
                                    mode="outlined"
                                    label={t('profile.email')}
                                    value={tempEmail}
                                    onChangeText={setTempEmail}
                                    disabled={isLoading}
                                    style={[styles.input, { backgroundColor: colors.surfaceSecondary || colors.background }]}
                                    textColor={colors.text}
                                    outlineColor={colors.border}
                                    activeOutlineColor={colors.accent}

                                    // Accesibilidad
                                    accessibilityLabel={t('profile.email')}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    textContentType="emailAddress"
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <CurrencySelector
                                    label={t('profile.currency')}
                                    currencySelected={tempCurrency}
                                    setCurrencySelected={setTempCurrency}
                                    currencies={currencyOptions}
                                    colors={colors}
                                />
                            </View>

                            {/* BOTONES DE ACCIÓN */}
                            <View style={styles.buttonsRow}>
                                <TouchableOpacity
                                    onPress={handleCancel}
                                    disabled={isLoading}
                                    style={[styles.button, styles.cancelButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                                    accessibilityRole="button"
                                    accessibilityLabel={t('common.cancel')}
                                >
                                    <MaterialIcons name="close" size={20} color={colors.textSecondary} style={{ marginRight: 4 }} importantForAccessibility="no" />
                                    <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleSave}
                                    disabled={isLoading}
                                    style={[
                                        styles.button,
                                        { backgroundColor: isLoading ? colors.border : colors.income }
                                    ]}
                                    accessibilityRole="button"
                                    accessibilityLabel={isLoading ? t('common.saving') : t('common.save')}
                                    accessibilityState={{ disabled: isLoading, busy: isLoading }}
                                >
                                    {isLoading ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <ActivityIndicator size={18} color={colors.surface} />
                                            <Text style={[styles.saveButtonText, { color: colors.surface }]}>{t('common.saving')}</Text>
                                        </View>
                                    ) : (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <MaterialIcons name="check" size={20} color={colors.surface} importantForAccessibility="no" />
                                                <Text style={[styles.saveButtonText, { color: colors.surface }]}>{t('common.save')}</Text>
                                            </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    ) : (
                            // ================= MODO LECTURA =================
                            <Animated.View entering={FadeIn} accessibilityRole="summary">

                                {/* Bloque Nombre */}
                                <View
                                    style={styles.infoBlock}
                                    accessible={true}
                                    accessibilityLabel={`${t('profile.name')}: ${user.name}`}
                                >
                                    <Text style={[styles.label, { color: colors.textSecondary }]} importantForAccessibility="no">
                                        {t('profile.name')}
                                    </Text>
                                    <Text style={[styles.value, { color: colors.text }]} importantForAccessibility="no">
                                        {user.name}
                                    </Text>
                                </View>

                                {/* Bloque Email */}
                                {user.email && (
                                    <View
                                        style={styles.infoBlock}
                                        accessible={true}
                                        accessibilityLabel={`${t('profile.email')}: ${user.email}`}
                                    >
                                        <Text style={[styles.label, { color: colors.textSecondary }]} importantForAccessibility="no">
                                            {t('profile.email')}
                                        </Text>
                                        <Text style={[styles.value, { color: colors.text }]} importantForAccessibility="no">
                                            {user.email}
                                        </Text>
                                    </View>
                                )}

                                {/* Bloque Moneda */}
                                <View
                                    style={styles.infoBlock}
                                    accessible={true}
                                    accessibilityLabel={`${t('profile.currency')}: ${currencyOptions.find(c => c.code === user.currency)?.name || user.currency}`}
                                >
                                    <Text style={[styles.label, { color: colors.textSecondary }]} importantForAccessibility="no">
                                        {t('profile.currency')}
                                    </Text>
                                    <Text style={[styles.value, { color: colors.text }]} importantForAccessibility="no">
                                        {t(`currency.${currencyOptions.find(c => c.code === user.currency)?.code}`) || user.currency}
                                    </Text>
                            </View>

                        </Animated.View>
                    )}
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginVertical: 10,
        borderRadius: 16, // Bordes un poco más suaves
        padding: 20,
        borderWidth: 0.5,
        // Sombras sutiles
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            }
        })
    },
    editIconWrapper: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 10,
    },
    editIconButton: {
        padding: 10, // Área táctil mejorada
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingRight: 40, // Espacio para que el título no choque con el botón de editar
    },
    headerTitle: {
        fontSize: 24, // Texto grande por defecto
        fontFamily: 'FiraSans-Regular',
        flexShrink: 1, // Permite que el texto haga wrap si es necesario
    },
    contentRow: {
        flexDirection: 'row',
        gap: 20,
        flexWrap: 'wrap', // CLAVE: Permite que el contenido se apile en pantallas pequeñas o texto grande
        alignItems: 'flex-start',
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        // No permitimos que el avatar se encoja o deforme
        flexGrow: 0,
        flexShrink: 0,
    },
    avatarText: {
        fontSize: 28,
        fontFamily: 'FiraSans-Regular',
    },
    detailsContainer: {
        flex: 1,
        minWidth: 200, // Asegura que el formulario no se aplaste demasiado antes de hacer wrap
    },
    errorBox: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center'
    },
    errorText: {
        fontSize: 14,
        flex: 1,
        flexWrap: 'wrap',
    },
    inputWrapper: {
        marginBottom: 16, // Espaciado consistente entre inputs
    },
    input: {
        fontSize: 16,
        minHeight: 50, // Accesibilidad: Altura mínima táctil y visual
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'flex-end',
        marginTop: 20,
        flexWrap: 'wrap', // Permite que los botones se apilen si no caben
    },
    button: {
        flex: 1,
        minWidth: 120, // Ancho mínimo
        minHeight: 48, // Altura mínima táctil
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    saveButtonText: {
        fontFamily: 'FiraSans-Bold',
        fontSize: 16,
    },
    cancelButton: {
        borderWidth: 1,
    },
    cancelButtonText: {
        fontFamily: 'FiraSans-Bold',
        fontSize: 16,
    },
    infoBlock: {
        marginBottom: 16,
        paddingVertical: 4, // Aumenta el área táctil del bloque de lectura
    },
    label: {
        fontSize: 12,
        marginBottom: 4,
        fontFamily: 'FiraSans-Bold',
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    value: {
        fontSize: 18, // Valor más legible
        fontFamily: 'FiraSans-Regular',
        flexWrap: 'wrap', // Permite que emails largos bajen de línea
    },
});