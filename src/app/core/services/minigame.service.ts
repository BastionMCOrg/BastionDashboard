import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Minigame } from '../models/minigame.model';
import { ServerInstance } from '../models/server-instance.model';

@Injectable({
    providedIn: 'root'
})
export class MinigameService {

    constructor(private apiService: ApiService) { }

    /**
     * Récupère la liste de tous les mini-jeux
     */
    public getMinigames(): Observable<Minigame[]> {
        return this.apiService.get<any[]>('/minigames').pipe(
            map(response => this.transformMinigamesResponse(response)),
            catchError(error => {
                console.error('Erreur lors de la récupération des mini-jeux:', error);
                return of([]);
            })
        );
    }

    /**
     * Récupère les détails d'un mini-jeu spécifique
     */
    public getMinigame(name: string): Observable<Minigame | null> {
        return this.apiService.get<any>(`/minigames/${name}`).pipe(
            map(response => this.transformMinigameResponse(response)),
            catchError(error => {
                console.error(`Erreur lors de la récupération du mini-jeu ${name}:`, error);
                return of(null);
            })
        );
    }

    /**
     * Démarre une nouvelle instance de mini-jeu
     */
    public startMinigameInstance(name: string): Observable<{ containerId: string }> {
        return this.apiService.post<{ containerId: string }>(`/minigames/${name}/start`).pipe(
            tap(response => console.log(`Instance de ${name} démarrée avec succès:`, response)),
            catchError(error => {
                console.error(`Erreur lors du démarrage de l'instance de ${name}:`, error);
                throw error;
            })
        );
    }

    /**
     * Arrête une instance de mini-jeu
     */
    public stopMinigameInstance(name: string, containerId: string): Observable<any> {
        return this.apiService.post<any>(`/minigames/${name}/stop/${containerId}`).pipe(
            tap(_ => console.log(`Instance ${containerId} de ${name} arrêtée avec succès`)),
            catchError(error => {
                console.error(`Erreur lors de l'arrêt de l'instance ${containerId} de ${name}:`, error);
                throw error;
            })
        );
    }

    /**
     * Récupère la liste des instances d'un mini-jeu
     */
    public getMinigameInstances(name: string): Observable<ServerInstance[]> {
        return this.apiService.get<any[]>(`/minigames/${name}/instances`).pipe(
            map(response => this.transformInstancesResponse(response)),
            catchError(error => {
                console.error(`Erreur lors de la récupération des instances de ${name}:`, error);
                return of([]);
            })
        );
    }

    /**
     * Vérifie la santé d'une instance de mini-jeu
     */
    public checkInstanceHealth(name: string, containerId: string): Observable<{ healthy: boolean, status: string }> {
        return this.apiService.get<{ healthy: boolean, status: string }>(
            `/minigames/${name}/instances/${containerId}/health`
        ).pipe(
            catchError(error => {
                console.error(`Erreur lors de la vérification de la santé de l'instance ${containerId}:`, error);
                return of({ healthy: false, status: 'error' });
            })
        );
    }

    /**
     * Récupère l'URL des logs d'une instance
     * Note: Les logs sont en streaming, donc cette fonction retourne juste l'URL
     */
    public getLogsUrl(containerId: string, length: number = 100, html: boolean = false): string {
        return `${this.apiService.baseURL}/minigames/instances/${containerId}/logs?length=${length}&html=${html}`;
    }

    /**
     * Transforme la réponse de l'API pour les mini-jeux
     */
    private transformMinigamesResponse(response: any[]): Minigame[] {
        return response.map(item => this.transformMinigameResponse(item));
    }

    /**
     * Transforme un objet minigame de l'API en modèle Minigame
     */
    private transformMinigameResponse(item: any): Minigame {
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
        const shortName = item.name.toLowerCase().replace(/[^a-z]/g, '');
        const color = gameColors[shortName] || 'blue';

        return {
            id: item._id || item.name,
            name: item.name,
            displayName: item.key || item.name,
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
        return instances.map(instance => ({
            id: instance.id || instance.name,
            containerId: instance.id || instance.containerId,
            minigame: instance.gameName || '',
            map: instance.mapName || 'Standard',
            startedAt: new Date(instance.createdAt),
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
        if (typeof memory === 'string') {
            if (memory.endsWith('G')) {
                return memory.replace('G', '');
            }
            if (memory.endsWith('M')) {
                const mb = parseInt(memory.replace('M', ''));
                return (mb / 1024).toFixed(1);
            }
        }

        return '2.0'; // Valeur par défaut
    }
}
