// src/app/core/services/service.service.ts
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Service } from '../models/service.model';

export interface ServicePaginationParams {
    page: number;
    size: number;
    search?: string;
    type?: string;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    pageNumber: number;
    pageSize: number;
    last: boolean;
    first: boolean;
    empty: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ServiceService {
    constructor(private apiService: ApiService) {}

    /**
     * Récupère tous les services avec pagination
     */
    public async getServices(params: ServicePaginationParams): Promise<PaginatedResponse<Service>> {
        try {
            return await this.apiService.get<PaginatedResponse<Service>>('/services', params);
        } catch (error) {
            console.error('Erreur lors de la récupération des services:', error);
            throw error;
        }
    }

    /**
     * Récupère les détails d'un service
     */
    public async getServiceDetails(id: string): Promise<Service> {
        try {
            return await this.apiService.get<Service>(`/services/${id}`);
        } catch (error) {
            console.error(`Erreur lors de la récupération des détails du service ${id}:`, error);
            throw error;
        }
    }

    /**
     * Démarre un service
     */
    public async startService(id: string): Promise<any> {
        try {
            return await this.apiService.post<any>(`/services/${id}/start`);
        } catch (error) {
            console.error(`Erreur lors du démarrage du service ${id}:`, error);
            throw error;
        }
    }

    /**
     * Arrête un service
     */
    public async stopService(id: string): Promise<any> {
        try {
            return await this.apiService.post<any>(`/services/${id}/stop`);
        } catch (error) {
            console.error(`Erreur lors de l'arrêt du service ${id}:`, error);
            throw error;
        }
    }

    /**
     * Redémarre un service
     */
    public async restartService(id: string): Promise<any> {
        try {
            return await this.apiService.post<any>(`/services/${id}/restart`);
        } catch (error) {
            console.error(`Erreur lors du redémarrage du service ${id}:`, error);
            throw error;
        }
    }

    /**
     * Exécute une commande sur un service
     */
    public async executeCommand(id: string, command: string): Promise<any> {
        try {
            return await this.apiService.post<any>(`/services/${id}/exec`, { command });
        } catch (error) {
            console.error(`Erreur lors de l'exécution de la commande sur le service ${id}:`, error);
            throw error;
        }
    }

    /**
     * Retourne l'URL des logs d'un service
     */
    public getLogsUrl(id: string, lines: number = 100): string {
        return `${this.apiService.baseURL}/services/${id}/logs?lines=${lines}`;
    }
}
