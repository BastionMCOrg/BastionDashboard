import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Minigame } from '../models/minigame.model';
import { ServerInstance } from '../models/server-instance.model';

export interface PaginationParams {
    page: number;
    size: number;
    minigameFilter?: string;
    search?: string;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
    size: number;
}

@Injectable({
    providedIn: 'root'
})
export class MinigameService {

    constructor(private apiService: ApiService) { }

    /**
     * Récupère la liste de tous les mini-jeux
     */
    public async getMinigames(): Promise<Minigame[]> {
        try {
            const response = await this.apiService.get<any[]>('/minigames');
            return response
        } catch (error) {
            console.error('Erreur lors de la récupération des mini-jeux:', error);
            return [];
        }
    }

    /**
     * Récupère les détails d'un mini-jeu spécifique
     */
    public async getMinigame(name: string): Promise<Minigame | null> {
        try {
            const response = await this.apiService.get<any>(`/minigames/${name}`);
            return response
        } catch (error) {
            console.error(`Erreur lors de la récupération du mini-jeu ${name}:`, error);
            return null;
        }
    }

    /**
     * Crée un nouveau mini-jeu
     */
    public async createMinigame(minigame: any): Promise<any> {
        try {
            const response = await this.apiService.post<any>('/minigames', minigame);
            console.log(`Mini-jeu ${minigame.name} créé avec succès:`, response);
            return response;
        } catch (error) {
            console.error(`Erreur lors de la création du mini-jeu:`, error);
            throw error;
        }
    }

    /**
     * Met à jour un mini-jeu existant
     */
    public async updateMinigame(name: string, minigame: any): Promise<any> {
        try {
            const response = await this.apiService.put<any>(`/minigames/${name}`, minigame);
            console.log(`Mini-jeu ${name} mis à jour avec succès:`, response);
            return response;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du mini-jeu ${name}:`, error);
            throw error;
        }
    }

    /**
     * Supprime un mini-jeu
     */
    public async deleteMinigame(name: string): Promise<any> {
        try {
            const response = await this.apiService.delete<any>(`/minigames/${name}`);
            console.log(`Mini-jeu ${name} supprimé avec succès`);
            return response;
        } catch (error) {
            console.error(`Erreur lors de la suppression du mini-jeu ${name}:`, error);
            throw error;
        }
    }


    public async cleanupSystem(): Promise<{
        success: boolean;
        stoppedContainers?: number;
        removedImages?: number;
        message?: string;
        error?: string;
    }> {
        try {
            const response = await this.apiService.post<any>('/minigames/cleanup');
            console.log('Nettoyage système effectué avec succès:', response);
            return {
                success: true,
                ...response
            };
        } catch (error) {
            console.error('Erreur lors du nettoyage système:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * Récupère toutes les instances avec pagination
     */
    public async getAllInstances(params: PaginationParams): Promise<PaginatedResponse<any>> {
        try {
            const response = await this.apiService.get<PaginatedResponse<any>>('/minigames/instances', params);

            return {
                ...response,
                content: response.content
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des instances:', error);

            return {
                content: [],
                totalPages: 0,
                totalElements: 0,
                currentPage: params.page,
                size: params.size
            };
        }
    }

    /**
     * Démarre une nouvelle instance de mini-jeu
     */
    public async startMinigameInstance(name: string): Promise<{ containerId: string }> {
        try {
            const response = await this.apiService.post<{ containerId: string }>(`/minigames/${name}/start`);
            console.log(`Instance de ${name} démarrée avec succès:`, response);
            return response;
        } catch (error) {
            console.error(`Erreur lors du démarrage de l'instance de ${name}:`, error);
            throw error;
        }
    }

    /**
     * Arrête une instance de mini-jeu
     */
    public async stopMinigameInstance(name: string, containerId: string): Promise<any> {
        try {
            const response = await this.apiService.post<any>(`/minigames/${name}/stop/${containerId}`);
            console.log(`Instance ${containerId} de ${name} arrêtée avec succès`);
            return response;
        } catch (error) {
            console.error(`Erreur lors de l'arrêt de l'instance ${containerId} de ${name}:`, error);
            throw error;
        }
    }

    /**
     * Récupère la liste des instances d'un mini-jeu
     */
    public async getMinigameInstances(name: string): Promise<ServerInstance[]> {
        try {
            const response = await this.apiService.get<any[]>(`/minigames/${name}/instances`);
            return response
        } catch (error) {
            console.error(`Erreur lors de la récupération des instances de ${name}:`, error);
            return [];
        }
    }

    /**
     * Vérifie la santé d'une instance de mini-jeu
     */
    public async checkInstanceHealth(name: string, containerId: string): Promise<{ healthy: boolean, status: string }> {
        try {
            return await this.apiService.get<{ healthy: boolean, status: string }>(
                `/minigames/${name}/instances/${containerId}/health`
            );
        } catch (error) {
            console.error(`Erreur lors de la vérification de la santé de l'instance ${containerId}:`, error);
            return { healthy: false, status: 'error' };
        }
    }

    /**
     * Récupère l'URL des logs d'une instance
     */
    public getLogsUrl(containerId: string, length: number = 100, html: boolean = false): string {
        return `${this.apiService.baseURL}/minigames/instances/${containerId}/logs?length=${length}&html=${html}`;
    }


    /**
     * Récupère les détails d'un serveur spécifique
     */
    public async getServerDetails(serverId: string): Promise<any> {
        try {
            const serverDetails = await this.apiService.get<any>(`/servers/${serverId}`);
            return serverDetails;
        } catch (error) {
            console.error(`Erreur lors de la récupération des détails du serveur ${serverId}:`, error);
            throw error;
        }
    }

    /**
     * Exécute une commande RCON sur un serveur
     */
    public async executeRconCommand(serverId: string, command: string): Promise<any> {
        try {
            const response = await this.apiService.post<any>(`/servers/${serverId}/rcon`, { command });
            return response;
        } catch (error) {
            console.error(`Erreur lors de l'exécution de la commande RCON sur ${serverId}:`, error);
            throw error;
        }
    }

    public async rebuildImage(minigameKey: string): Promise<any> {
        try {
            const response = await this.apiService.post<any>(`/images/${minigameKey}/build`);
            console.log(`Image Docker pour ${minigameKey} reconstruite avec succès:`, response);
            return response;
        } catch (error) {
            console.error(`Erreur lors de la reconstruction de l'image Docker pour ${minigameKey}:`, error);
            throw error;
        }
    }
}
