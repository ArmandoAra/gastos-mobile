import type { User } from '../types/schemas';

// Simulamos una respuesta del servidor
interface AuthResponse {
    user: User;
    token: string;
}

// MOCK: Simulación de llamada a API (Reemplaza esto con Axios cuando tengas backend)
export const loginRequest = async (email: string, pass: string): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email === 'demo@test.com' && pass === '123456') {
                resolve({
                    user: { id: '1', name: 'Usuario Demo', email: email, created_at: new Date().toISOString() }, // Ajusta a tu Schema
                    token: 'fake-jwt-token-xyz-123',
                });
            } else {
                reject(new Error('Credenciales inválidas (Usa: demo@test.com / 123456)'));
            }
        }, 1500); // Simula delay de red
    });
};

export const registerRequest = async (email: string, pass: string, name: string): Promise<AuthResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                user: { id: Date.now().toString(), name, email, created_at: new Date().toISOString() },
                token: 'fake-jwt-token-new-user',
            });
        }, 1500);
    });
};