import { Dimensions } from "react-native";
import { StyleSheet } from "react-native";

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start', // Alinea todo arriba
    },
    topSheet: {
        flex: 1
    },
    header: {
        marginTop: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        width: width - 21,
        marginBottom: 15,

    },
    closeButton: {
        position: 'absolute',
        left: 12,
        top: 10,
        padding: 6,
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderRadius: 24,
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: 16,
        paddingBottom: 20, // Espacio extra al final del scroll
    },
    closeButtonText: {
        fontSize: 24,
        fontFamily: 'FiraSans-Bold',
    },
    rowSelectors: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10, // Para asegurar que los dropdowns se vean por encima si es necesario
    },
    footer: {
        width: '100%',
        display: 'flex',
        marginTop: 10,
        alignItems: 'center',
    },
    actionButtons: {
        marginTop: 20,
        alignItems: 'center',
    },
    saveButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
});