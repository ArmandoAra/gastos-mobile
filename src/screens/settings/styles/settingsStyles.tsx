import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 0.5,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // Permite que el contenedor crezca
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'FiraSans-Regular',
        flexShrink: 1, // Permite wrap si el texto es gigante
    },
    contentContainer: {
        gap: 12,
    },
    settingLabel: {
        fontSize: 12,
        fontFamily: 'FiraSans-Bold',
        letterSpacing: 0.5,
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    themeSelectorContainer: {
        flexDirection: 'row',
        gap: 12,
        // CLAVE PARA ACCESIBILIDAD VISUAL:
        flexWrap: 'wrap', // Permite que los botones bajen si el texto crece mucho
    },
    // Estilos de los botones de tema
    themeBtn: {
        flex: 1,
        // Ancho mínimo para que no se hagan minúsculos en wrap. 
        // 40% asegura que quepan 2 en fila normal, pero 1 en fila si crece.
        minWidth: '40%',
        minHeight: 80, // Altura mínima táctil grande para este tipo de tarjeta
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    themeContent: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
    },
    themeBtnText: {
        fontSize: 16, // Texto base un poco más grande
        textAlign: 'center',
    },
    checkBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 24, // Área un poco más grande
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    }
});