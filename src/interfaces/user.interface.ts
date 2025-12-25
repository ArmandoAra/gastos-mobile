// Usuario
export interface User {
    id: string;
    email: string;
    name?: string;
    created_at: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}