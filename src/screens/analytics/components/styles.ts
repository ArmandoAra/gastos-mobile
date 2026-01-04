import { StyleSheet, Dimensions, Platform } from 'react-native';

export const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const isSmallScreen = SCREEN_WIDTH < 380;

// Constantes usadas en los estilos específicos (Heatmap/Grid)
export const MINI_CELL_SIZE = 24;
export const GAP_SIZE = 4;
export const isTablet = SCREEN_WIDTH >= 768;


export const styles = StyleSheet.create({
    // --- LAYOUT & CONTAINERS ---
    container: {
        borderRadius: isSmallScreen ? 16 : 20,
        padding: isSmallScreen ? 12 : 16,
        borderWidth: 0.5,
        marginHorizontal: 4,
        marginVertical: 10,
        overflow: 'hidden', // Importante para que los hijos no rompan el borde
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.1, // Unificado a 0.1 para suavidad
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
            },
            android: {
                elevation: 4, // Unificado a 4
            }
        }),
    },
    containerTablet: {
        maxWidth: 900,
        alignSelf: 'center',
        width: '100%',
    },
    contentContainer: {
        marginBottom: isSmallScreen ? 16 : 20,
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: isSmallScreen ? 20 : 24,
    },
    chartWrapper: {
        marginVertical: 10,
        marginLeft: -15,
    },

    // --- HEADERS & TYPOGRAPHY ---
    header: {
        marginBottom: 16,
    },
    headerTop: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: 16 
    },
    headerTitleRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 16 
    },
    iconTitle: { 
        flexDirection: 'row', 
        gap: 12, 
        alignItems: 'center' 
    },
    iconBox: {
        width: isSmallScreen ? 36 : 40,
        height: isSmallScreen ? 36 : 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    title: {
        fontSize: isSmallScreen ? 18 : 24,
        fontWeight: '300',
    },
    subtitle: {
        fontSize: isSmallScreen ? 11 : 12,
        textTransform: 'capitalize',
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: isSmallScreen ? 12 : 13,
        fontWeight: '300',
        letterSpacing: 0.5,
    },
    totalBadge: { 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 8 
    },
    totalText: { 
        fontSize: 14, 
        fontWeight: '700' 
    },

    // --- STATS CARDS & GRIDS ---
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: isSmallScreen ? 12 : 16,
        justifyContent: 'space-between',
        marginBottom: isSmallScreen ? 16 : 20,
    },
    statsGridTablet: {
        flexWrap: 'wrap',
        gap: isSmallScreen ? 12 : 16,
        justifyContent: 'center',
    },
    statsScroll: { 
        paddingRight: 20, 
        marginBottom: 10 
    },
    statCard: {
        flex: 1,
        padding: isSmallScreen ? 12 : 16,
        borderRadius: 16,
        borderWidth: 1,
        marginHorizontal: isSmallScreen ? 4 : 6,
        minWidth: isSmallScreen ? 100 : 120,
    },
    statCardTablet: {
        marginHorizontal: isSmallScreen ? 6 : 8,
        maxWidth: 200,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: isSmallScreen ? 10 : 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: isSmallScreen ? 16 : 18,
        fontWeight: '700',
        marginVertical: 2,
    },
    statSub: {
        fontSize: isSmallScreen ? 9 : 10,
        marginTop: 4,
    },

    // --- CHART SPECIFICS ---
    chartCenterValue: {
        fontSize: isSmallScreen ? 18 : 22,
        fontWeight: '500',
    },
    chartCenterLabel: {
        fontSize: isSmallScreen ? 11 : 12,
        marginTop: 4,
    },
    tooltip: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 80,
        alignItems: 'center',
        marginBottom: 4
    },
    footer: { 
        marginTop: 5, 
        alignItems: 'center' 
    },
    footerText: { 
        fontSize: 10 
    },

    // --- CONTROLS (SWITCHES / TOGGLES) ---
    controlsRow: { 
        flexDirection: 'row', 
        gap: 10,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    toggleContainer: { 
        flexDirection: 'row', 
        borderRadius: 24, 
        padding: 2, 
        borderWidth: 1 
    },
    toggleBtn: { 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 24, 
        borderWidth: 0.3,
        marginHorizontal: 1,
    },
    toggleText: { 
        fontSize: 11, 
        fontWeight: '600',
        textTransform: 'capitalize' 
    },
    switchContainer: { 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginLeft: 'auto' 
    },
    switchLabel: { 
        fontSize: 10, 
        marginBottom: 2, 
        fontWeight: '600' 
    },

    // --- CATEGORY LISTS (Dashboard) ---
    categoryList: {
        marginTop: 8,
    },
    catHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryRow: {
        paddingHorizontal: isSmallScreen ? 10 : 12,
        paddingVertical: isSmallScreen ? 8 : 10,
        borderBottomWidth: 0.5,
    },
    catRowTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    colorDot: {
        width: isSmallScreen ? 10 : 12,
        height: isSmallScreen ? 10 : 12,
        borderRadius: 6,
        marginRight: 8,
    },
    catName: {
        fontSize: isSmallScreen ? 12 : 13,
        fontWeight: '600',
    },
    catValue: {
        fontSize: isSmallScreen ? 12 : 13,
        fontWeight: '600',
    },
    catProgressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressBarBg: {
        flex: 1,
        height: isSmallScreen ? 6 : 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    catPercent: {
        fontSize: isSmallScreen ? 10 : 11,
        fontWeight: '600',
    },

    // --- GRID / HEATMAP (Calendar) ---
    gridContainer: { 
        alignItems: 'center' 
    },
    weekDaysRow: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        marginBottom: 8, 
        gap: 4 
    },
    weekDayText: { 
        textAlign: 'center', 
        fontSize: 10, 
        fontWeight: '700' 
    },
    gridWrap: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 4, 
        justifyContent: 'center' 
    },
    gridWrapYear: { 
        justifyContent: 'space-between', 
        gap: 8 
    },
    cell: { 
        borderRadius: 8, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    cellText: { 
        fontWeight: '700' 
    },

    // --- HEATMAP CATEGORY LAYOUT (Sticky) ---
    catContainer: {
        flexDirection: 'row',
    },
    catFixedColumn: {
        width: 80,
        marginRight: 8,
        borderRightWidth: 1,
        zIndex: 10,
    },
    catHeaderPlaceholder: {
        height: 20,
        marginBottom: 8, 
        justifyContent: 'center',
    },
    catHeaderLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    catNameRow: {
        height: MINI_CELL_SIZE,
        marginBottom: GAP_SIZE,
        justifyContent: 'center',
    },
    catLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    catDateHeaderRow: {
        flexDirection: 'row',
        height: 20,
        marginBottom: 8,
        gap: GAP_SIZE,
    },
    catHeaderCell: {
        width: MINI_CELL_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    catColHeader: {
        fontSize: 9,
        textAlign: 'center',
    },
    catDataRow: {
        flexDirection: 'row',
        height: MINI_CELL_SIZE,
        marginBottom: GAP_SIZE,
        gap: GAP_SIZE,
    },
    miniCell: {
        width: MINI_CELL_SIZE,
        height: MINI_CELL_SIZE,
        borderRadius: 4,
    },

    // --- INSIGHTS ---
    insightsContainer: {
        marginTop: isSmallScreen ? 16 : 20,
    },
    insightsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: isSmallScreen ? 12 : 16,
    },
    insightsGridTablet: {
        flexWrap: 'wrap',
        gap: isSmallScreen ? 12 : 16,
        justifyContent: 'center',
    },
    insightCard: {
        flex: 1,
        padding: isSmallScreen ? 12 : 16,
        borderRadius: 16,
        borderWidth: 1,
        marginHorizontal: isSmallScreen ? 4 : 6,
        minWidth: isSmallScreen ? 120 : 150,
    },
    insightBox: { 
        padding: 12, 
        borderRadius: 12, 
        marginTop: 16 
    },
    insightHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 4 
    },
    insightLabel: {
        fontSize: isSmallScreen ? 11 : 12,
        fontWeight: '600',
    },
    insightTitle: {
        fontSize: isSmallScreen ? 12 : 14,
        fontWeight: '700',
        marginVertical: 6,
    },
    insightText: { 
        fontSize: 11, 
        lineHeight: 16 
    },
    insightValue: {
        fontSize: isSmallScreen ? 16 : 18,
        fontWeight: '700',
    },

    // --- LEGEND ---
    legend: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: 16, 
        paddingTop: 12, 
        borderTopWidth: 1 
    },
    legendLabel: { 
        fontSize: 10, 
        fontWeight: '600', 
        textTransform: 'uppercase' 
    },
    scaleBar: { 
        flexDirection: 'row', 
        gap: 4 
    },
    scaleDot: { 
        width: 24, 
        height: 8, 
        borderRadius: 4 
    },

    // --- EMPTY STATES ---
    emptyState: {
        alignItems: 'center',
        paddingVertical: isSmallScreen ? 40 : 48,
    },
    emptyTitle: {
        fontSize: isSmallScreen ? 16 : 18,
        fontWeight: '700',
        marginTop: 12,
    },
    emptySub: {
        fontSize: isSmallScreen ? 12 : 13,
        marginTop: 6,
    },

    // --- MODALS ---
    modalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.6)', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },
    modalCard: { 
        width: '100%', 
        maxWidth: 300, 
        borderRadius: 20, 
        padding: 20, 
        borderWidth: 1 
    },
    modalHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingBottom: 12, 
        borderBottomWidth: 1, 
        marginBottom: 12 
    },
    modalTitle: { 
        fontSize: 16, 
        fontWeight: '700' 
    },
    modalSub: { 
        fontSize: 12 
    },
    modalAmount: { 
        fontSize: 18, 
        fontWeight: '700' 
    },
    txRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingVertical: 6 
    },
    txName: { 
        fontSize: 13, 
        flex: 1, 
        marginRight: 10 
    },
    txVal: { 
        fontSize: 13, 
        fontWeight: '600' 
    },
    noTx: { 
        fontStyle: 'italic', 
        textAlign: 'center', 
        marginTop: 10 
    },
    closeBtn: { 
        marginTop: 16, 
        paddingVertical: 10, 
        borderRadius: 12, 
        alignItems: 'center' 
    },
    closeText: { 
        fontWeight: '700', 
        fontSize: 12 
    },
    statLabelSmall: {
        fontSize: 10,
    },
    statValueSmall: {
        fontSize: 16,
    },
    statSubSmall: {
        fontSize: 9,
    },
    chartCenterValueSmall: {
        fontSize: 16,
    },
    catNameSmall: {
        fontSize: 11,
    },
    catValueSmall: {
        fontSize: 11,
    },
    insightLabelSmall: {
        fontSize: 10,
    },
    insightTitleSmall: {
        fontSize: 13,
    },
    insightValueSmall: {
        fontSize: 15,
    },
    emptyTitleSmall: {
        fontSize: 15,
    },
    emptySubSmall: {
        fontSize: 11,
    },
});
 