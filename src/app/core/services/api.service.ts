import {Injectable} from '@angular/core';
import axios, {AxiosInstance, AxiosRequestConfig, AxiosError} from 'axios';
import {TokenService} from './token.service';
import {Router} from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    readonly baseURL = 'https://hydra.bastionmc.fr';
    private api: AxiosInstance;
    private isRefreshing = false;
    private refreshPromise: Promise<string | null> | null = null;

    constructor(private tokenService: TokenService, private router: Router) {
        // Configuration d'Axios avec l'URL de base
        this.api = axios.create({
            baseURL: this.baseURL,
            timeout: 30000, // 30 secondes
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Intercepteur pour les requêtes - Ajout du token JWT
        this.api.interceptors.request.use(
            config => {
                // Ajouter le token d'authentification si disponible
                const token = this.tokenService.getAccessToken();
                if (token) {
                    config.headers = config.headers || {};
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            error => {
                console.error('❌ Erreur de requête:', error);
                return Promise.reject(error);
            }
        );

        // Intercepteur pour les réponses - Gestion des erreurs 401 (token expiré)
        this.api.interceptors.response.use(
            response => {
                // Log de la réponse
                console.log(`📥 ${response.status} ${response.config.url}`, response.data);
                return response;
            },
            async (error: AxiosError) => {
                // Si pas de réponse
                if (!error.response) {
                    return Promise.reject(error);
                }

                const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

                // Si l'erreur est 401 (non autorisé) et que nous n'avons pas déjà tenté de rafraîchir le token
                if (error.response.status === 401 && !originalRequest._retry) {
                    // Marquer la requête pour éviter les boucles infinies
                    originalRequest._retry = true;

                    try {
                        // Rafraîchir le token
                        const newToken = await this.refreshToken();

                        if (newToken) {
                            // Mettre à jour le header d'autorisation avec le nouveau token
                            originalRequest.headers = originalRequest.headers || {};
                            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                            // Réessayer la requête avec le nouveau token
                            return this.api(originalRequest);
                        } else {
                            // Si pas de nouveau token, rediriger vers la page de login
                            this.tokenService.clearTokens();
                            this.router.navigate(['/login']);
                        }
                    } catch (refreshError) {
                        // En cas d'échec du rafraîchissement, rediriger vers la page de login
                        console.error('Échec du rafraîchissement du token:', refreshError);
                        this.tokenService.clearTokens();
                        this.router.navigate(['/login']);
                    }
                }

                // Log des erreurs
                if (error.response) {
                    console.error(`❌ Erreur API ${error.response.status}:`, error.response.data);
                } else if (error.request) {
                    console.error('❌ Aucune réponse reçue:', error.request);
                } else {
                    console.error('❌ Erreur de configuration:', error.message);
                }

                return Promise.reject(error);
            }
        );
    }

    /**
     * Rafraîchit le token d'accès
     */
    private async refreshToken(): Promise<string | null> {
        // Si un rafraîchissement est déjà en cours, attendre son résultat
        if (this.isRefreshing) {
            return this.refreshPromise;
        }

        const refreshToken = this.tokenService.getRefreshToken();
        if (!refreshToken) {
            return null;
        }

        this.isRefreshing = true;

        this.refreshPromise = new Promise<string | null>(async (resolve) => {
            try {
                const response = await this.api.post<{success: boolean, accessToken: string}>('/auth/refresh', {
                    refreshToken
                });

                if (response.data.success && response.data.accessToken) {
                    this.tokenService.setAccessToken(response.data.accessToken);
                    resolve(response.data.accessToken);
                } else {
                    resolve(null);
                }
            } catch (error) {
                console.error('Erreur lors du rafraîchissement du token:', error);
                resolve(null);
            } finally {
                this.isRefreshing = false;
                this.refreshPromise = null;
            }
        });

        return this.refreshPromise;
    }

    /**
     * Méthode GET générique
     */
    public async get<T>(url: string, params?: any): Promise<T> {
        try {
            const response = await this.api.get<T>(url, {params});
            return response.data;
        } catch (error) {
            console.error(`Erreur GET sur ${url}:`, error);
            throw error;
        }
    }

    /**
     * Méthode POST générique
     */
    public async post<T>(url: string, data?: any, params?: any): Promise<T> {
        try {
            const response = await this.api.post<T>(url, data, {params});
            return response.data;
        } catch (error) {
            console.error(`Erreur POST sur ${url}:`, error);
            throw error;
        }
    }

    /**
     * Méthode PUT générique
     */
    public async put<T>(url: string, data?: any): Promise<T> {
        try {
            const response = await this.api.put<T>(url, data);
            return response.data;
        } catch (error) {
            console.error(`Erreur PUT sur ${url}:`, error);
            throw error;
        }
    }

    /**
     * Méthode DELETE générique
     */
    public async delete<T>(url: string): Promise<T> {
        try {
            const response = await this.api.delete<T>(url);
            return response.data;
        } catch (error) {
            console.error(`Erreur DELETE sur ${url}:`, error);
            throw error;
        }
    }
}
