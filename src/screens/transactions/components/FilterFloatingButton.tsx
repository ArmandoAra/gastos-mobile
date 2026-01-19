import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Modal, 
    Platform 
} from 'react-native';
import Animated, { FadeIn, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { ThemeColors } from '../../../types/navigation';
import { useTranslation } from 'react-i18next';
import { ViewMode } from '../../../interfaces/date.interface';
import { filterTransactionsTypes, filterViewModes } from '../constants/filters';
import AccountSelector from '../../../components/forms/Inputs/AccoutSelector';
import { Account } from '../../../interfaces/data.interface';
import { useTransactionsLogic } from '../hooks/useTransactionsLogic';

interface FilterFloatingButtonProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    filter: string;
    setFilter: (filter: string) => void;
    colors: ThemeColors;
    accountSelected: string;
    setAccountSelected: (accountId: string) => void;
    allAccounts: Account[];
}

const emptyAccount: Account = {
    id: 'all',
    name: 'All Accounts',
    balance: 0,
    type: 'checking',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: ''
};

export default function FilterFloatingButton({ 
    viewMode, 
    setViewMode, 
    filter,
    setFilter,
    colors,
    setAccountSelected,
    accountSelected,
    allAccounts,
}: FilterFloatingButtonProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* --- BOTÓN FLOTANTE (Abajo Izquierda) --- */}
            <Animated.View 
                entering={FadeIn.delay(200)} 
                style={styles.floatingContainer}
            >
                <TouchableOpacity 
                    activeOpacity={0.8}
                    onPress={() => setIsOpen(true)}
                    style={[styles.fabButton, {
                        backgroundColor: isOpen ? colors.surface : colors.text,
                        borderColor: isOpen ? colors.text : colors.surface,
                        borderWidth: 0.4
                    }]}
                >
                    <Ionicons name="filter" size={24} color={colors.accent} />
                </TouchableOpacity>
            </Animated.View>

            {/* --- MODAL DE FILTROS --- */}
            <Modal
                visible={isOpen}
                transparent
                animationType="none"
                onRequestClose={() => setIsOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    {/* Backdrop */}
                    <TouchableOpacity 
                        style={StyleSheet.absoluteFill} 
                        activeOpacity={1} 
                        onPress={() => setIsOpen(false)}
                    >
                         {Platform.OS === 'ios' ? (
                            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        ) : (
                                <View style={{ flex: 1, backgroundColor: colors.background }} />
                        )}
                    </TouchableOpacity>

                    {/* Contenido */}
                    <Animated.View 
                        entering={ZoomIn.duration(200)}
                        exiting={ZoomOut.duration(200)}
                        style={[styles.modalContent, { borderColor: colors.border, backgroundColor: colors.surface }]}
                    >
                        <View style={styles.header}>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>{t('transactions.filtersAndView')}</Text>
                            <TouchableOpacity onPress={() => setIsOpen(false)}>
                                <Ionicons name="close-circle" size={32} color={colors.error} />
                            </TouchableOpacity>
                        </View>

                        {/* SECCIÓN 1: VIEW MODE */}
                        <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('transactions.period')}</Text>
                        <View style={styles.selectorContainer}>
                            {filterViewModes.map((mode) => {
                                const isActive = viewMode === mode;
                                return (
                                    <TouchableOpacity
                                        key={mode}
                                        onPress={() => {setViewMode(mode); setIsOpen(false);}}
                                        style={styles.optionWrapper}
                                    >
                                        {isActive ? (
                                            <View
                                                style={[styles.optionActive, { borderColor: colors.border, backgroundColor: colors.text }]}
                                            >
                                                <Text style={[styles.textActive, { color: colors.surface, fontSize: 8, position: 'relative', bottom: 3 }]}>
                                                    {t('transactions.by')}&nbsp;
                                                </Text>
                                                <Text style={[styles.textActive, { color: colors.surface }]}>
                                                    {t(`transactions.${mode}`)}
                                                </Text>
                                            </View>
                                        ) : (
                                                <View style={[styles.optionInactive, { borderColor: colors.border }]}>
                                                    <Text style={[styles.textInactive, { color: colors.textSecondary, fontSize: 8, position: 'relative', bottom: 3 }]}>
                                                        {t('transactions.by')}&nbsp;
                                                    </Text>
                                                    <Text style={[styles.textInactive, { color: colors.textSecondary, borderColor: colors.border }]}>
                                                        {t(`transactions.${mode}`)}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* SECCIÓN 2: TIPO DE TRANSACCIÓN */}
                        <Text style={[styles.sectionLabel, { marginTop: 20 }, { color: colors.text }]}>{t('transactions.sortBy')}</Text>
                        <View style={styles.selectorContainer}>
                            {filterTransactionsTypes.map((f) => {
                                const isActive = filter === f;
                                return (
                                    <TouchableOpacity
                                        key={f}
                                        onPress={() => {
                                            setFilter(f);
                                            setIsOpen(false);
                                        }}
                                        style={styles.optionWrapper}
                                    >
                                        {isActive ? (
                                            <View
                                                style={[styles.optionActive, { borderColor: colors.border, backgroundColor: colors.text }]}
                                            >
                                                <Text style={[styles.textActive, { color: colors.surface }]}>
                                                    {f === 'all' ? t('transactions.all') : t(`transactions.${f}Plural`)}
                                                </Text>
                                            </View>
                                        ) : (
                                                <View style={[styles.optionInactive, { borderColor: colors.border }]}>
                                                    <Text style={[styles.textInactive, { color: colors.textSecondary }]}>
                                                        {f === 'all' ? t('transactions.all') : t(`transactions.${f}Plural`)}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={{ marginTop: 20 }} />

                        <AccountSelector
                            label={t('common.filterAccount')}
                            accountSelected={accountSelected}
                            setAccountSelected={setAccountSelected}
                            accounts={[emptyAccount, ...allAccounts]}
                            colors={colors}
                        />
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    // Botón Flotante
    floatingContainer: {
        zIndex: 50,
    },
    fabButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    fabGradient: {
        flex: 1,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 24,
        padding: 24,
        borderWidth: 0.4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Tinos-Bold',
        color: 'white',
    },
    sectionLabel: {
        fontSize: 12,
        fontFamily: 'FiraSans-Bold',
        color: '#94a3b8',
        textTransform: 'uppercase',
        marginBottom: 10,
        letterSpacing: 1,
    },
    selectorContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    optionWrapper: {
        flex: 1,
        height: 40,
        borderRadius: 12,
    },
    optionActive: {
        flexDirection: 'row',
        borderWidth: 0.4,
        flex: 1,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionInactive: {
        flexDirection: 'row',
        flex: 1,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    textActive: {
        color: 'white',
        fontFamily: 'FiraSans-Bold',
        fontSize: 13,
    },
    textInactive: {
        fontFamily: 'FiraSans-Regular',
        fontSize: 13,
    }
});