import * as Crypto from 'expo-crypto';
import * as Keychain from 'react-native-keychain';
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

// Hash PIN con salt
export async function hashPin(pin: string): Promise<string> {
    const salt = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Date.now().toString()
    );

    const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        pin + salt
    );

    return `${salt}:${hash}`;
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
    const [salt, hash] = stored.split(':');
    const computed = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        pin + salt
    );

    return computed === hash;
}

// Guardar PIN en Keychain
export async function savePin(pin: string): Promise<void> {
    const hashed = await hashPin(pin);
    await Keychain.setGenericPassword('pin', hashed);
}

export async function getStoredPin(): Promise<string | null> {
    const credentials = await Keychain.getGenericPassword();
    return credentials ? credentials.password : null;
}

// Biometría
export async function isBiometricAvailable(): Promise<boolean> {
    const { available } = await rnBiometrics.isSensorAvailable();
    return available;
}

export async function authenticateBiometric(): Promise<boolean> {
    try {
        const { success } = await rnBiometrics.simplePrompt({
            promptMessage: 'Confirma tu identidad',
        });
        return success;
    } catch {
        return false;
    }
}