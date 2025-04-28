// src/app/core/services/server-stats.service.ts
import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {io, Socket} from 'socket.io-client';

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

export interface ServerNotification {
    gameType: string;
    serverId: string;
    serverData?: any;
}

@Injectable({
    providedIn: 'root'
})
export class ServerStatsService implements OnDestroy {
    private socket: Socket;
    private statsSubject = new BehaviorSubject<ServerStats | null>(null);
    private currentServerId: string | null = null;

    // Nouveaux sujets pour les notifications de serveurs
    private serverCreatedSubject = new Subject<ServerNotification>();
    private serverUpdatedSubject = new Subject<ServerNotification>();
    private serverDeletedSubject = new Subject<ServerNotification>();
    private isSubscribedToServers = false;

    constructor() {
        this.socket = io('https://hydra.bastionmc.fr'); // Adaptez à votre URL

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            // Réenregistrer l'intérêt si on était en train d'observer un serveur
            if (this.currentServerId) {
                this.watchServer(this.currentServerId);
            }

            // Réabonner aux notifications de serveurs si nécessaire
            if (this.isSubscribedToServers) {
                this.subscribeToServerNotifications();
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

        // Écouter les événements de notification de serveurs
        this.socket.on('server:created', (data: ServerNotification) => {
            console.log('Server created:', data);
            this.serverCreatedSubject.next(data);
        });

        this.socket.on('server:updated', (data: ServerNotification) => {
            console.log('Server updated:', data);
            this.serverUpdatedSubject.next(data);
        });

        this.socket.on('server:deleted', (data: ServerNotification) => {
            console.log('Server deleted:', data);
            this.serverDeletedSubject.next(data);
        });
    }

    /**
     * Commence à observer un serveur pour les statistiques en temps réel
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
     * S'abonne aux notifications de serveurs (création, mise à jour, suppression)
     */
    subscribeToServerNotifications(): void {
        if (!this.isSubscribedToServers) {
            this.socket.emit('subscribe:servers');
            this.isSubscribedToServers = true;
        }
    }

    /**
     * Se désabonne des notifications de serveurs
     */
    unsubscribeFromServerNotifications(): void {
        if (this.isSubscribedToServers) {
            this.socket.emit('unsubscribe:servers');
            this.isSubscribedToServers = false;
        }
    }

    /**
     * Observable pour recevoir les statistiques
     */
    getStats(): Observable<ServerStats | null> {
        return this.statsSubject.asObservable();
    }

    /**
     * Observable pour recevoir les notifications de création de serveur
     */
    getServerCreatedNotifications(): Observable<ServerNotification> {
        return this.serverCreatedSubject.asObservable();
    }

    /**
     * Observable pour recevoir les notifications de mise à jour de serveur
     */
    getServerUpdatedNotifications(): Observable<ServerNotification> {
        return this.serverUpdatedSubject.asObservable();
    }

    /**
     * Observable pour recevoir les notifications de suppression de serveur
     */
    getServerDeletedNotifications(): Observable<ServerNotification> {
        return this.serverDeletedSubject.asObservable();
    }

    /**
     * Nettoyage à la destruction du service
     */
    ngOnDestroy(): void {
        this.unwatchCurrentServer();
        this.unsubscribeFromServerNotifications();
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}
