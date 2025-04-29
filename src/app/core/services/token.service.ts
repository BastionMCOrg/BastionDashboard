import { Injectable } from '@angular/core';

/**
 * Service dédié à la gestion des tokens pour éviter la dépendance circulaire
 * entre AuthService et ApiService
 */
@Injectable({
    providedIn: 'root'
})
export class TokenService {
    // Clés pour le stockage local des tokens
    private readonly ACCESS_TOKEN_KEY = 'bastionmc_access_token';
    private readonly REFRESH_TOKEN_KEY = 'bastionmc_refresh_token';
    private readonly USER_KEY = 'bastionmc_user';

    constructor() {}

    /**
     * Récupère le token d'accès
     */
    getAccessToken(): string | null {
        return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }

    /**
     * Enregistre un token d'accès
     */
    setAccessToken(token: string): void {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    }

    /**
     * Récupère le refresh token
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    /**
     * Enregistre un refresh token
     */
    setRefreshToken(token: string): void {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }

    /**
     * Récupère les données utilisateur
     */
    getUser<T>(): T | null {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    /**
     * Enregistre les données utilisateur
     */
    setUser(user: any): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    /**
     * Efface toutes les données d'authentification
     */
    clearTokens(): void {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }
}
