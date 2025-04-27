// src/app/core/services/server-stats.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface ServerStats {
    serverId: string;
    timestamp: number;
    cpu: {
        usage: number;
        cores: number;
    };
    memory: {
        usage: number;
        limit: number;
        percent: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class ServerStatsService implements OnDestroy {
    private socket: Socket;
    private statsSubject = new BehaviorSubject<ServerStats | null>(null);
    private currentServerId: string | null = null;

    constructor() {
        this.socket = io('https://hydra.bastionmc.fr'); // Adaptez à votre URL

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            // Réenregistrer l'intérêt si on était en train d'observer un serveur
            if (this.currentServerId) {
                this.watchServer(this.currentServerId);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        this.socket.on('server:stats', (stats: ServerStats) => {
            if (stats.serverId === this.currentServerId) {
                this.statsSubject.next(stats);
            }
        });
    }

    /**
     * Commence à observer un serveur
     */
    watchServer(serverId: string): void {
        // Si on observait déjà un autre serveur, arrêter de l'observer
        if (this.currentServerId && this.currentServerId !== serverId) {
            this.socket.emit('leave:server', this.currentServerId);
        }

        this.currentServerId = serverId;
        this.socket.emit('join:server', serverId);
    }

    /**
     * Arrête d'observer le serveur courant
     */
    unwatchCurrentServer(): void {
        if (this.currentServerId) {
            this.socket.emit('leave:server', this.currentServerId);
            this.currentServerId = null;
            this.statsSubject.next(null);
        }
    }

    /**
     * Observable pour recevoir les statistiques
     */
    getStats(): Observable<ServerStats | null> {
        return this.statsSubject.asObservable();
    }

    /**
     * Nettoyage à la destruction du service
     */
    ngOnDestroy(): void {
        this.unwatchCurrentServer();
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}
