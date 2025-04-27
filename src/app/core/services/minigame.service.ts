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
            return this.transformMinigamesResponse(response);
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
            return this.transformMinigameResponse(response);
        } catch (error) {
            console.error(`Erreur lors de la récupération du mini-jeu ${name}:`, error);
            return null;
        }
    }

    /**
     * Récupère toutes les instances avec pagination
     * Note: Cette méthode suppose qu'un endpoint `/instances` existe sur le serveur
     * avec support pour la pagination
     */
    public async getAllInstances(params: PaginationParams): Promise<PaginatedResponse<ServerInstance>> {
        try {
            // Si l'endpoint n'existe pas encore, on peut commenter cette ligne et décommenter celle en dessous
            const response = await this.apiService.get<PaginatedResponse<any>>('/minigames/instances', params);

            // Si l'endpoint n'existe pas, simuler une pagination avec les instances disponibles
            // const response = await this.simulatePaginatedInstances(params);

            return {
                ...response,
                content: this.transformInstancesResponse(response.content)
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des instances:', error);

            // En cas d'erreur, simuler une réponse vide mais avec la structure correcte
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
            return this.transformInstancesResponse(response);
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
     * Simule une réponse paginée si l'endpoint n'existe pas encore
     * Cette méthode est temporaire et devrait être supprimée une fois l'endpoint implémenté
     */
    private async simulatePaginatedInstances(params: PaginationParams): Promise<PaginatedResponse<any>> {
        // Récupérer tous les minigames
        const minigames = await this.getMinigames();

        // Récupérer les instances pour chaque minigame
        let allInstances: any[] = [];
        for (const minigame of minigames) {
            if (params.minigameFilter && minigame.name !== params.minigameFilter) {
                continue;
            }

            try {
                const instances = await this.getMinigameInstances(minigame.name);
                instances.forEach(instance => {
                    instance.minigame = minigame.displayName;
                    instance.color = minigame.color;
                });
                allInstances.push(...instances);
            } catch (error) {
                console.error(`Erreur lors de la récupération des instances pour ${minigame.name}:`, error);
            }
        }

        // Filtrer par recherche si nécessaire
        if (params.search) {
            const search = params.search.toLowerCase();
            allInstances = allInstances.filter(instance =>
                instance.id.toLowerCase().includes(search) ||
                instance.minigame.toLowerCase().includes(search) ||
                instance.map.toLowerCase().includes(search) ||
                instance.containerId.toLowerCase().includes(search)
            );
        }

        // Calculer la pagination
        const totalElements = allInstances.length;
        const totalPages = Math.ceil(totalElements / params.size);
        const start = (params.page - 1) * params.size;
        const end = Math.min(start + params.size, totalElements);
        const paginatedInstances = allInstances.slice(start, end);

        return {
            content: paginatedInstances,
            totalPages,
            totalElements,
            currentPage: params.page,
            size: params.size
        };
    }

    /**
     * Transforme la réponse de l'API pour les mini-jeux
     */
    private transformMinigamesResponse(response: any[]): Minigame[] {
        if (!response || !Array.isArray(response)) {
            return [];
        }
        return response.map(item => this.transformMinigameResponse(item));
    }

    /**
     * Transforme un objet minigame de l'API en modèle Minigame
     */
    private transformMinigameResponse(item: any): Minigame {
        if (!item) {
            return null as any;
        }

        // Définition de couleurs par défaut pour certains types de jeux
        const gameColors: {[key: string]: string} = {
            'tower': 'blue',
            'crazyrace': 'lime',
            'dodgeball': 'indigo',
            'arrows': 'rose',
            'parkour': 'violet',
            'prv': 'cyan'
        };

        // Extraction du nom court pour associer une couleur
        const shortName = item.name?.toLowerCase().replace(/[^a-z]/g, '') || '';
        const color = gameColors[shortName] || 'blue';

        return {
            id: item._id || item.name || '',
            name: item.name || '',
            displayName: item.key || item.name || '',
            description: item.description || 'Aucune description disponible',
            icon: item.icon,
            developerNames: item.developerNames || [],
            enabled: item.enabled !== false,
            color: color,
            gameSettings: {
                maxPlayers: item.gameSettings?.maxPlayers || 16,
                minPlayers: item.gameSettings?.minPlayers || 2
            },
            serverSettings: {
                memory: item.serverSettings?.memory || '2G',
                cpu: item.serverSettings?.cpu || '1',
                javaVersion: item.serverSettings?.javaVersion || '17',
                serverVersion: item.serverSettings?.serverVersion || '1.20.1'
            },
            stats: {
                avgTps: 19.5, // Ces valeurs sont simulées car non fournies par l'API
                avgMemoryUsage: 65,
                avgCpuUsage: 30,
                avgStartupTime: 12,
                successRate: 98,
                activeServers: 0,
                peakPlayerCount: 0,
                currentPlayerCount: 0
            }
        };
    }

    /**
     * Transforme les instances de l'API en modèle ServerInstance
     */
    private transformInstancesResponse(instances: any[]): ServerInstance[] {
        if (!instances || !Array.isArray(instances)) {
            return [];
        }

        return instances.map(instance => ({
            id: instance.id || instance.containerId || '',
            containerId: instance.id || instance.containerId || '',
            minigame: instance.gameName || '',
            map: instance.mapName || 'Standard',
            startedAt: new Date(instance.createdAt || Date.now()),
            status: this.mapStatus(instance.status),
            tps: instance.metrics?.tps || 20,
            players: {
                current: instance.playerCount || 0,
                max: instance.maxPlayers || 16,
                list: instance.players || []
            },
            resources: {
                ram: {
                    usage: instance.metrics?.memoryUsage / 100 || 0.5,
                    total: this.extractMemoryTotal(instance)
                },
                cpu: instance.metrics?.cpuUsage || 20
            },
            color: 'blue' // Couleur par défaut
        }));
    }

    /**
     * Mappe le statut de l'API vers les statuts du dashboard
     */
    private mapStatus(status: string): 'starting' | 'running' | 'stopped' {
        switch (status?.toLowerCase()) {
            case 'running':
            case 'active':
                return 'running';
            case 'starting':
            case 'preparing':
            case 'pending':
            case 'created':
                return 'starting';
            default:
                return 'stopped';
        }
    }

    /**
     * Extrait la mémoire totale de l'instance
     */
    private extractMemoryTotal(instance: any): string {
        // Essaie d'extraire la mémoire depuis différentes sources possibles
        if (instance.memory) {
            return this.formatMemory(instance.memory);
        }
        if (instance.specs?.memory) {
            return this.formatMemory(instance.specs.memory);
        }
        // Valeur par défaut
        return '2.0';
    }

    /**
     * Formate la mémoire dans un format utilisable par l'UI
     */
    private formatMemory(memory: string | number): string {
        if (typeof memory === 'number') {
            // Si c'est en MB, convertir en GB
            if (memory > 1000) {
                return (memory / 1024).toFixed(1);
            }
            return memory.toString();
        }

        // Pour les chaînes comme "2G" ou "512M"
        if (memory.endsWith('G')) {
            return memory.replace('G', '');
        }
        if (memory.endsWith('M')) {
            const mb = parseInt(memory.replace('M', ''));
            return (mb / 1024).toFixed(1);
        }

        return '2.0'; // Valeur par défaut
    }
}
