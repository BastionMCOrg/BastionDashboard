import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private api: AxiosInstance;
    readonly baseURL = 'https://hydra.bastionmc.fr';

    constructor() {
        // Configuration d'Axios avec l'URL de base
        this.api = axios.create({
            baseURL: this.baseURL,
            timeout: 30000, // 30 secondes
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Intercepteur pour les requêtes
        this.api.interceptors.request.use(
            config => {
                return config;
            },
            error => {
                console.error('❌ Erreur de requête:', error);
                return Promise.reject(error);
            }
        );

        // Intercepteur pour les réponses
        this.api.interceptors.response.use(
            response => {
                // Log de la réponse
                console.log(`📥 ${response.status} ${response.config.url}`, response.data);
                return response;
            },
            error => {
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
     * Méthode GET générique
     */
    public async get<T>(url: string, params?: any): Promise<T> {
        try {
            const response = await this.api.get<T>(url, { params });
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
            const response = await this.api.post<T>(url, data, { params });
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
