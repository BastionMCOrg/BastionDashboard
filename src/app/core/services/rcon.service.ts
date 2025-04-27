import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class RconService {

    constructor(private apiService: ApiService) { }

    /**
     * Exécute une commande RCON sur un serveur spécifique
     */
    public executeCommand(gameType: string, serverId: string, command: string): Observable<{
        success: boolean,
        result?: string,
        error?: string
    }> {
        return this.apiService.post<any>(`/rcon/${gameType}/${serverId}/command`, { command }).pipe(
            map(response => ({
                success: response.success || false,
                result: response.result || '',
                error: response.error || null
            })),
            tap(response => {
                if (response.success) {
                    console.log(`RCON commande exécutée sur ${gameType}/${serverId}: ${command}`);
                } else {
                    console.warn(`RCON échec de commande sur ${gameType}/${serverId}: ${command}`, response.error);
                }
            }),
            catchError(error => {
                console.error(`Erreur lors de l'exécution de la commande RCON sur ${gameType}/${serverId}:`, error);
                return of({
                    success: false,
                    error: error.response?.data?.error || 'Erreur de connexion au serveur RCON'
                });
            })
        );
    }

    /**
     * Récupère la liste des joueurs connectés à un serveur
     */
    public getPlayers(gameType: string, serverId: string): Observable<{
        success: boolean,
        players?: Array<{ name: string, uuid?: string }>,
        error?: string
    }> {
        return this.apiService.get<any>(`/rcon/${gameType}/${serverId}/players`).pipe(
            map(response => ({
                success: response.success || false,
                players: response.players || [],
                error: response.error || null
            })),
            catchError(error => {
                console.error(`Erreur lors de la récupération des joueurs sur ${gameType}/${serverId}:`, error);
                return of({
                    success: false,
                    players: [],
                    error: error.response?.data?.error || 'Erreur de connexion au serveur RCON'
                });
            })
        );
    }

    /**
     * Vérifie la santé de la connexion RCON
     */
    public checkHealth(gameType: string, serverId: string): Observable<{
        success: boolean,
        responsive?: boolean,
        latency?: number,
        error?: string
    }> {
        return this.apiService.get<any>(`/rcon/${gameType}/${serverId}/health`).pipe(
            map(response => ({
                success: response.success || false,
                responsive: response.responsive || false,
                latency: response.latency || 0,
                error: response.error || null
            })),
            catchError(error => {
                console.error(`Erreur lors de la vérification de la santé RCON sur ${gameType}/${serverId}:`, error);
                return of({
                    success: false,
                    responsive: false,
                    error: error.response?.data?.error || 'Erreur de connexion au serveur RCON'
                });
            })
        );
    }

    /**
     * Exécute une commande de kick sur un joueur
     */
    public kickPlayer(gameType: string, serverId: string, playerName: string, reason?: string): Observable<{
        success: boolean,
        result?: string,
        error?: string
    }> {
        const command = reason
            ? `kick ${playerName} ${reason}`
            : `kick ${playerName}`;

        return this.executeCommand(gameType, serverId, command);
    }

    /**
     * Exécute une commande de ban sur un joueur
     */
    public banPlayer(gameType: string, serverId: string, playerName: string, reason?: string): Observable<{
        success: boolean,
        result?: string,
        error?: string
    }> {
        const command = reason
            ? `ban ${playerName} ${reason}`
            : `ban ${playerName}`;

        return this.executeCommand(gameType, serverId, command);
    }

    /**
     * Envoie un message au serveur
     */
    public sendMessage(gameType: string, serverId: string, message: string): Observable<{
        success: boolean,
        result?: string,
        error?: string
    }> {
        // Préfixe le message avec 'say' pour l'envoyer en tant que message serveur
        return this.executeCommand(gameType, serverId, `say ${message}`);
    }

    /**
     * Exécute une commande pour obtenir les TPS (Ticks Per Second)
     */
    public getTps(gameType: string, serverId: string): Observable<{
        success: boolean,
        tps?: number[],
        error?: string
    }> {
        return this.executeCommand(gameType, serverId, 'tps').pipe(
            map(response => {
                if (!response.success) {
                    return {
                        success: false,
                        error: response.error
                    };
                }

                // Essaie d'extraire les valeurs de TPS de la réponse
                // Format typique: "TPS from last 1m, 5m, 15m: 19.98, 19.96, 19.97"
                const tpsMatch = response.result?.match(/(\d+\.\d+)(?:,\s*|$)/g);
                const tpsValues = tpsMatch?.map(t => parseFloat(t.replace(',', ''))) || [];

                return {
                    success: true,
                    tps: tpsValues.length ? tpsValues : [20, 20, 20] // Valeurs par défaut si non trouvées
                };
            })
        );
    }
}
