import { Injectable } from '@angular/core';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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
                // Log de la requête en développement
                if (window.location.hostname === 'localhost') {
                    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
                }
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
                // Log de la réponse en développement
                if (window.location.hostname === 'localhost') {
                    console.log(`📥 ${response.status} ${response.config.url}`);
                }
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
     * Transformation d'une promesse Axios en Observable RxJS
     */
    private toObservable<T>(promise: Promise<AxiosResponse<T>>): Observable<T> {
        return from(promise).pipe(
            map(response => response.data),
            catchError(error => {
                // Rejeter l'erreur pour qu'elle soit capturée par le subscriber
                throw error;
            })
        );
    }

    /**
     * Méthode GET générique
     */
    public get<T>(url: string, params?: any): Observable<T> {
        return this.toObservable<T>(this.api.get(url, { params }));
    }

    /**
     * Méthode POST générique
     */
    public post<T>(url: string, data?: any, params?: any): Observable<T> {
        return this.toObservable<T>(this.api.post(url, data, { params }));
    }

    /**
     * Méthode PUT générique
     */
    public put<T>(url: string, data?: any): Observable<T> {
        return this.toObservable<T>(this.api.put(url, data));
    }

    /**
     * Méthode DELETE générique
     */
    public delete<T>(url: string): Observable<T> {
        return this.toObservable<T>(this.api.delete(url));
    }
}
