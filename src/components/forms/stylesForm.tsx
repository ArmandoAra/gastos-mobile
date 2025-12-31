import { Dimensions } from "react-native";
import { StyleSheet } from "react-native";

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start', // Alinea todo arriba
    },
    topSheet: {
        width: '100%',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        paddingBottom: 20,
        maxHeight: '65%', 
    },
    header: {
        marginTop: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 10,
        width: width - 21,
        marginBottom: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeButton: {
        padding: 6,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: 16,
        paddingBottom: 20, // Espacio extra al final del scroll
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
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});