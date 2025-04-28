import {Injectable} from '@angular/core';
import {ApiService} from './api.service';

@Injectable({
    providedIn: 'root'
})
export class RconService {
    constructor(private apiService: ApiService) {
    }

    public async executeCommand(
        gameType: string,
        serverId: string,
        command: string
    ): Promise<{ success: boolean; result?: string; error?: string }> {
        const response = await this.apiService.post<any>(
            `/rcon/${gameType}/${serverId}/command`,
            {command}
        );
        return response.data;
    }

    public async getPlayers(
        gameType: string,
        serverId: string
    ): Promise<{
        success: boolean;
        players: Array<{ name: string; uuid?: string }>;
        error?: string;
    }> {
        try {
            const response = await this.apiService.get<any>(
                `/rcon/${gameType}/${serverId}/players`
            );
            return {
                success: response.success ?? false,
                players: response.players ?? []
            };
        } catch (err: any) {
            console.error(
                `Erreur lors de la récupération des joueurs sur ${gameType}/${serverId}:`,
                err
            );
            return {
                success: false,
                players: [],
                error: err.response?.data?.error ?? 'Erreur de connexion au serveur RCON'
            };
        }
    }

    public async checkHealth(
        gameType: string,
        serverId: string
    ): Promise<{
        success: boolean;
        responsive?: boolean;
        latency?: number;
        error?: string;
    }> {
        try {
            const response = await this.apiService.get<any>(
                `/rcon/${gameType}/${serverId}/health`
            );
            return {
                success: response.success ?? false,
                responsive: response.responsive ?? false,
                latency: response.latency ?? 0
            };
        } catch (err: any) {
            console.error(
                `Erreur lors de la vérification de la santé RCON sur ${gameType}/${serverId}:`,
                err
            );
            return {
                success: false,
                responsive: false,
                latency: 0,
                error: err.response?.data?.error ?? 'Erreur de connexion au serveur RCON'
            };
        }
    }

    public kickPlayer(
        gameType: string,
        serverId: string,
        playerName: string,
        reason?: string
    ): Promise<{ success: boolean; result?: string; error?: string }> {
        const cmd = reason ? `kick ${playerName} ${reason}` : `kick ${playerName}`;
        return this.executeCommand(gameType, serverId, cmd);
    }

    public banPlayer(
        gameType: string,
        serverId: string,
        playerName: string,
        reason?: string
    ): Promise<{ success: boolean; result?: string; error?: string }> {
        const cmd = reason ? `ban ${playerName} ${reason}` : `ban ${playerName}`;
        return this.executeCommand(gameType, serverId, cmd);
    }

    public sendMessage(
        gameType: string,
        serverId: string,
        message: string
    ): Promise<{ success: boolean; result?: string; error?: string }> {
        return this.executeCommand(gameType, serverId, `say ${message}`);
    }

    public async getTps(
        gameType: string,
        serverId: string
    ): Promise<{ success: boolean; tps?: number[]; error?: string }> {
        const res = await this.executeCommand(gameType, serverId, 'tps');
        if (!res.success) {
            return {success: false, error: res.error};
        }

        const matches = res.result?.match(/(\d+\.\d+)(?=,|\s*$)/g) || [];
        const tpsValues = matches.map(m => parseFloat(m));

        return {
            success: true,
            tps: tpsValues.length ? tpsValues : [20, 20, 20]
        };
    }
}
