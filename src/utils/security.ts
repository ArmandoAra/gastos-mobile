import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Convierte el PIN (ej: "1234") en un hash SHA-256 irreversible
 * (ej: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3")
 */
export const hashPin = async (pin: string): Promise<string> => {
    const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
      pin
  );
    return digest;
};

/**
 * Verifica si el hardware tiene biometría (Huella/FaceID)
 */
export const checkBiometricHardware = async (): Promise<boolean> => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
};

/**
 * Solicita la huella/cara al usuario
 */
export const authenticateBiometric = async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Desbloquear Finanzas',
        fallbackLabel: 'Usar PIN',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: true, // Forzar nuestra propia pantalla de PIN si falla
    });
    return result.success;
};