import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { TokenService } from './token.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
    _id: string;
    username: string;
    permissions: string[];
    lastLogin?: Date;
}

export interface AuthResponse {
    success: boolean;
    accessToken: string;
    refreshToken: string;
    user: User;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject: BehaviorSubject<User | null>;
    public currentUser: Observable<User | null>;

    // Minuteur pour le rafraîchissement automatique du token
    private refreshTokenTimeout: any;

    constructor(
        private apiService: ApiService,
        private tokenService: TokenService,
        private router: Router
    ) {
        // Initialiser l'utilisateur courant à partir du stockage
        const storedUser = this.tokenService.getUser<User>();
        this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
        this.currentUser = this.currentUserSubject.asObservable();

        // Si un utilisateur est stocké, configurer le rafraîchissement automatique
        if (storedUser) {
            this.startRefreshTokenTimer();
        }
    }

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    /**
     * Authentifie un utilisateur et stocke ses tokens
     */
    public async login(username: string, password: string): Promise<AuthResponse> {
        try {
            const response = await this.apiService.post<AuthResponse>('/auth/login', {
                username,
                password
            });

            // Stocker les informations d'authentification
            if (response.success && response.accessToken) {
                this.tokenService.setAccessToken(response.accessToken);
                this.tokenService.setRefreshToken(response.refreshToken);
                this.tokenService.setUser(response.user);

                // Mettre à jour l'utilisateur courant
                this.currentUserSubject.next(response.user);

                // Démarrer le minuteur de rafraîchissement
                this.startRefreshTokenTimer();
            }

            return response;
        } catch (error) {
            console.error('Erreur de connexion:', error);
            throw error;
        }
    }

    /**
     * Déconnecte l'utilisateur
     */
    public async logout(): Promise<void> {
        try {
            // Appel à l'API pour invalider le refresh token
            if (this.currentUserValue) {
                await this.apiService.post('/auth/logout');
            }
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            // Nettoyer le stockage local même en cas d'erreur
            this.stopRefreshTokenTimer();
            this.tokenService.clearTokens();
            this.currentUserSubject.next(null);

            // Rediriger vers la page de connexion
            await this.router.navigate(['/login']);
        }
    }

    /**
     * Change le mot de passe de l'utilisateur
     */
    public async changePassword(currentPassword: string, newPassword: string): Promise<any> {
        return this.apiService.put('/auth/password', {
            currentPassword,
            newPassword
        });
    }

    /**
     * Change le pseudo de l'utilisateur
     */
    public async changeUsername(newUsername: string): Promise<any> {
        try {
            const response = await this.apiService.put<any>('/auth/username', {
                newUsername
            });

            if (response.success) {
                // Mettre à jour l'utilisateur dans le stockage
                const currentUser = this.currentUserValue;
                if (currentUser) {
                    currentUser.username = newUsername;
                    this.tokenService.setUser(currentUser);
                    this.currentUserSubject.next(currentUser);
                }
            }

            return response;
        } catch (error) {
            console.error('Erreur lors du changement de pseudo:', error);
            throw error;
        }
    }

    /**
     * Récupère les informations de l'utilisateur actuel
     */
    public async getUserInfo(): Promise<User | null> {
        try {
            const response = await this.apiService.get<{ success: boolean; user: User }>('/auth/me');

            if (response.success && response.user) {
                // Mettre à jour l'utilisateur dans le stockage
                this.tokenService.setUser(response.user);
                this.currentUserSubject.next(response.user);
                return response.user;
            }

            return null;
        } catch (error) {
            console.error('Erreur lors de la récupération des informations utilisateur:', error);
            return null;
        }
    }

    /**
     * Vérifie si l'utilisateur possède une permission
     */
    public hasPermission(permission: string): boolean {
        const user = this.currentUserValue;

        if (!user) return false;

        // Admin a toutes les permissions
        if (user.permissions.includes('admin')) {
            return true;
        }

        return user.permissions.includes(permission);
    }

    /**
     * Vérifie si l'utilisateur possède toutes les permissions requises
     */
    public hasPermissions(permissions: string[]): boolean {
        if (permissions.length === 0) return true;

        const user = this.currentUserValue;

        if (!user) return false;

        // Admin a toutes les permissions
        if (user.permissions.includes('admin')) {
            return true;
        }

        return permissions.every(permission => user.permissions.includes(permission));
    }

    /**
     * Démarrer le minuteur pour le rafraîchissement automatique du token
     */
    private startRefreshTokenTimer(): void {
        // Décoder le token pour obtenir sa date d'expiration
        const token = this.tokenService.getAccessToken();

        if (!token) return;

        // Décomposer le token JWT (format: header.payload.signature)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) return;

        // Décoder la partie payload (base64)
        const payload = JSON.parse(atob(tokenParts[1]));

        // Calculer le délai avant l'expiration (en secondes)
        const expiresAt = payload.exp * 1000; // Convertir en millisecondes
        const timeout = expiresAt - Date.now() - (60 * 1000); // Rafraîchir 1 minute avant l'expiration

        // Nettoyer l'ancien minuteur si existant
        this.stopRefreshTokenTimer();

        // Configurer le nouveau minuteur seulement si l'expiration est valide
        if (timeout > 0) {
            this.refreshTokenTimeout = setTimeout(() => {
                // Le rafraîchissement du token est maintenant géré par ApiService
                // Pas besoin d'appeler refreshToken() ici
                this.startRefreshTokenTimer(); // Redémarrer le timer après le refresh automatique
            }, timeout);
        }
    }

    /**
     * Arrêter le minuteur de rafraîchissement automatique
     */
    private stopRefreshTokenTimer(): void {
        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
            this.refreshTokenTimeout = null;
        }
    }
}
