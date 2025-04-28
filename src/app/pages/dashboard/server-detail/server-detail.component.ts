import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Subscription } from 'rxjs';
import { MinigameService } from '../../../core/services/minigame.service';
import { ServerStatsService, ServerNotification } from '../../../core/services/server-stats.service';
import {
    getCpuStatusClass,
    getRamStatusClass, getStatusDisplay,
    getStatusSeverity,
    getTpsSeverity,
    getUptime
} from '../../../core/utils/dashboard.utils';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-server-detail',
    templateUrl: './server-detail.component.html',
    styleUrls: ['./server-detail.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        CardModule,
        AvatarModule,
        ProgressBarModule,
        TagModule,
        TooltipModule,
        DialogModule,
        InputTextModule,
        FormsModule,
        DropdownModule,
        IconFieldModule,
        InputIconModule,
        ToastModule
    ],
    providers: [MessageService]
})
export class ServerDetailComponent implements OnInit, OnDestroy {
    // Références DOM
    @ViewChild('logsContainer') logsContainerRef!: ElementRef<HTMLDivElement>;

    // Propriétés du serveur
    serverId: string = '';
    server: any = null;

    // Gestion des logs
    serverLogs: string[] = [];
    filteredLogs: string[] = [];
    logsEventSource: EventSource | null = null;
    logsFullscreen: boolean = false;
    autoScrollEnabled: boolean = true;

    // UI Controls
    logFilter: string = '';
    rconCommand: string = '';
    commandExecuting: boolean = false;
    selectedLogLevel: string = 'all';
    timeRanges = [
        {name: '30 minutes', value: 30},
        {name: '1 heure', value: 60},
        {name: '3 heures', value: 180},
        {name: '12 heures', value: 720}
    ];
    selectedTimeRange = this.timeRanges[1];

    // Constantes
    private readonly SCROLL_THRESHOLD = 30;
    private statsSubscription: Subscription | null = null;

    // Nouvelles subscriptions pour les notifications de serveur
    private serverUpdatedSubscription: Subscription | null = null;
    private serverDeletedSubscription: Subscription | null = null;

    // Flag pour animation des joueurs qui rejoignent/quittent
    playerAnimations: {[key: string]: string} = {};

    // Options de filtrage des logs
    logLevels = [
        {label: 'Tous les niveaux', value: 'all'},
        {label: 'Info', value: 'info'},
        {label: 'Avertissement', value: 'warn'},
        {label: 'Erreur', value: 'error'}
    ];

    constructor(
        private route: ActivatedRoute,
        private minigameService: MinigameService,
        private serverStatsService: ServerStatsService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(async (params) => {
            this.serverId = params['id'];
            await this.loadServerData();
            this.connectToLogStream();

            // S'abonner aux statistiques en temps réel
            this.serverStatsService.watchServer(this.serverId);
            this.statsSubscription = this.serverStatsService.getStats().subscribe(stats => {
                if (stats && this.server) {
                    // Mettre à jour les statistiques en temps réel
                    this.server.resources = {
                        ram: {
                            usage: stats.memory.percent / 100, // Convertir en proportion (0-1)
                            total: stats.memory.limit / 1024   // Convertir en GB
                        },
                        cpu: {
                            usage: stats.cpu.usage
                        }
                    };
                }
            });

            // S'abonner aux notifications de serveurs
            this.subscribeToServerNotifications();
        });
    }

    ngOnDestroy(): void {
        if (this.logsEventSource) {
            this.logsEventSource.close();
        }

        if (this.statsSubscription) {
            this.statsSubscription.unsubscribe();
        }

        // Désabonner des notifications de serveur
        this.unsubscribeFromServerNotifications();

        this.serverStatsService.unwatchCurrentServer();
        document.body.style.overflow = '';
    }

    /**
     * S'abonne aux notifications de serveurs
     */
    private subscribeToServerNotifications() {
        // S'abonner au service WebSocket
        this.serverStatsService.subscribeToServerNotifications();

        // S'abonner aux notifications de mise à jour
        this.serverUpdatedSubscription = this.serverStatsService.getServerUpdatedNotifications()
            .subscribe(notification => {
                if (notification.serverId === this.serverId && notification.serverData) {
                    this.handleServerUpdate(notification.serverData);
                }
            });

        // S'abonner aux notifications de suppression
        this.serverDeletedSubscription = this.serverStatsService.getServerDeletedNotifications()
            .subscribe(notification => {
                if (notification.serverId === this.serverId) {
                    // Le serveur a été arrêté, afficher un message et recharger les données
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Serveur arrêté',
                        detail: 'Ce serveur a été arrêté'
                    });

                    // Actualiser les données du serveur
                    this.loadServerData();
                }
            });
    }

    /**
     * Se désabonne des notifications de serveurs
     */
    private unsubscribeFromServerNotifications() {
        if (this.serverUpdatedSubscription) {
            this.serverUpdatedSubscription.unsubscribe();
            this.serverUpdatedSubscription = null;
        }

        if (this.serverDeletedSubscription) {
            this.serverDeletedSubscription.unsubscribe();
            this.serverDeletedSubscription = null;
        }
    }

    /**
     * Gère les mises à jour des informations du serveur
     */
    private handleServerUpdate(serverData: any) {
        if (!this.server) return;

        // Sauvegarde de l'état précédent pour comparaison
        const previousPlayers = [...(this.server.players.list || [])];
        const newPlayersList = serverData.players || [];

        // Mise à jour des joueurs avec détection des changements
        this.updatePlayersList(previousPlayers, newPlayersList);

        // Mise à jour des autres informations du serveur
        this.server.status = this.mapRedisState(serverData.state);
        this.server.players.current = serverData.connectedPlayers || 0;
        this.server.players.max = serverData.maxPlayers || 16;
    }

    /**
     * Met à jour la liste des joueurs avec détection des joueurs qui rejoignent/quittent
     */
    private updatePlayersList(previousPlayers: string[], newPlayers: string[]) {
        // Identifier les joueurs qui ont rejoint le serveur
        const joinedPlayers = newPlayers.filter(player => !previousPlayers.includes(player));

        // Identifier les joueurs qui ont quitté le serveur
        const leftPlayers = previousPlayers.filter(player => !newPlayers.includes(player));

        // Mettre à jour la liste des joueurs dans le serveur
        this.server.players.list = newPlayers;

        // Afficher des notifications pour les joueurs qui rejoignent/quittent
        if (joinedPlayers.length > 0) {
            // Marquer les nouveaux joueurs pour animation
            joinedPlayers.forEach(player => {
                this.playerAnimations[player] = 'joined';

                // Enlever l'animation après 3 secondes
                setTimeout(() => {
                    this.playerAnimations[player] = '';
                }, 3000);
            });

            // Afficher une notification toast
            if (joinedPlayers.length === 1) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Joueur connecté',
                    detail: `${joinedPlayers[0]} a rejoint le serveur`
                });
            } else {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Joueurs connectés',
                    detail: `${joinedPlayers.length} joueurs ont rejoint le serveur`
                });
            }
        }

        if (leftPlayers.length >
            0) {
            // Afficher une notification toast
            if (leftPlayers.length === 1) {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Joueur déconnecté',
                    detail: `${leftPlayers[0]} a quitté le serveur`
                });
            } else {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Joueurs déconnectés',
                    detail: `${leftPlayers.length} joueurs ont quitté le serveur`
                });
            }
        }
    }

    @HostListener('document:keydown.escape', ['$event'])
    handleEscapeKey(event: KeyboardEvent): void {
        if (this.logsFullscreen) {
            this.toggleFullscreenLogs();
        }
    }

    // Méthodes pour le template
    getCpuStatusClass = getCpuStatusClass;
    getTpsSeverity = getTpsSeverity;
    getRamStatusClass = getRamStatusClass;
    getUptime = getUptime;

    onLogsScroll(): void {
        if (!this.logsContainerRef) return;

        const container = this.logsContainerRef.nativeElement;
        const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < this.SCROLL_THRESHOLD;

        if (atBottom && !this.autoScrollEnabled) {
            this.autoScrollEnabled = true;
        } else if (!atBottom && this.autoScrollEnabled) {
            this.autoScrollEnabled = false;
        }
    }

    scrollToBottom(enableAutoScroll: boolean = false): void {
        if (!this.logsContainerRef) return;

        const container = this.logsContainerRef.nativeElement;
        container.scrollTop = container.scrollHeight;

        if (enableAutoScroll) {
            this.autoScrollEnabled = true;
        }
    }

    filterLogs(): void {
        this.filteredLogs = this.serverLogs.filter(log => {
            // Filtre par texte
            if (this.logFilter && !log.toLowerCase().includes(this.logFilter.toLowerCase())) {
                return false;
            }

            // Filtre par niveau
            if (this.selectedLogLevel !== 'all') {
                const logLevel = this.getLogLevel(log);
                if (logLevel !== this.selectedLogLevel) {
                    return false;
                }
            }

            return true;
        });

        if (this.autoScrollEnabled) {
            setTimeout(() => this.scrollToBottom(), 0);
        }
    }

    getLogLevel(line: string): string {
        if (line.includes('ERROR') || line.includes('SEVERE')) return 'error';
        if (line.includes('WARN') || line.includes('WARNING')) return 'warn';
        if (line.includes('INFO')) return 'info';
        return 'default';
    }

    toggleFullscreenLogs(): void {
        this.logsFullscreen = !this.logsFullscreen;

        if (this.logsFullscreen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                if (this.logsContainerRef) {
                    this.logsContainerRef.nativeElement.focus();
                }
            }, 100);
        } else {
            document.body.style.overflow = '';
        }

        if (this.autoScrollEnabled) {
            setTimeout(() => this.scrollToBottom(), 100);
        }
    }

    async executeCommand(): Promise<void> {
        if (!this.rconCommand || this.rconCommand.trim() === '') {
            return;
        }

        this.commandExecuting = true;

        try {
            const command = this.rconCommand;
            await this.minigameService.executeRconCommand(this.serverId, command);
            this.rconCommand = '';

            this.autoScrollEnabled = true;
            this.scrollToBottom();
        } catch (error) {
            console.error('Erreur lors de l\'exécution de la commande RCON:', error);
        } finally {
            this.commandExecuting = false;
        }
    }

    async stopServer(): Promise<void> {
        try {
            await this.minigameService.stopMinigameInstance(this.server.minigame, this.server.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Serveur arrêté',
                detail: 'Le serveur a été arrêté avec succès'
            });

            // Pas besoin de recharger manuellement, les notifications WebSocket s'en chargeront
            // setTimeout(() => this.loadServerData(), 1000);
        } catch (error) {
            console.error('Erreur lors de l\'arrêt du serveur:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible d\'arrêter le serveur'
            });
        }
    }

    async executePlayerCommand(command: string): Promise<void> {
        try {
            await this.minigameService.executeRconCommand(this.serverId, command);

            if (command.startsWith('kick')) {
                const playerName = command.split(' ')[1];
                this.messageService.add({
                    severity: 'success',
                    summary: 'Joueur expulsé',
                    detail: `${playerName} a été expulsé du serveur`
                });
            }

            // Pas besoin de recharger manuellement, les notifications WebSocket s'en chargeront
            // setTimeout(() => this.loadServerData(), 1000);
        } catch (error) {
            console.error(`Erreur lors de l'exécution de la commande ${command}:`, error);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Impossible d'exécuter la commande: ${command}`
            });
        }
    }

    /**
     * Classe CSS pour l'animation des joueurs
     */
    getPlayerClass(playerName: string): string {
        return this.playerAnimations[playerName] || '';
    }

    // Méthodes privées
    private async loadServerData(): Promise<void> {
        try {
            const serverDetails = await this.minigameService.getServerDetails(this.serverId);

            this.server = {
                id: serverDetails.name,
                containerId: serverDetails.name,
                minigame: serverDetails.gameType,
                map: serverDetails.mapName || 'world',
                startedAt: new Date(serverDetails.lastUpdate),
                status: this.mapRedisState(serverDetails.state),
                tps: 19.8, // Valeur par défaut, sera mise à jour par les stats en temps réel
                players: {
                    current: serverDetails.connectedPlayers || 0,
                    max: serverDetails.maxPlayers || 16,
                    list: serverDetails.players || []
                },
                resources: {
                    ram: {
                        usage: 0.5, // Valeur par défaut, sera mise à jour par les stats en temps réel
                        total: 2.0  // Valeur par défaut, sera mise à jour par les stats en temps réel
                    },
                    cpu: {
                        usage: 25   // Valeur par défaut, sera mise à jour par les stats en temps réel
                    }
                },
                color: 'blue',
                version: serverDetails.version || '1.20.1',
                javaVersion: serverDetails.javaVersion || 'Java 17'
            };
        } catch (error) {
            console.error('Erreur lors du chargement des données du serveur:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger les données du serveur'
            });
        }
    }

    private mapRedisState(state: string): 'starting' | 'running' | 'stopped' {
        switch (state) {
            case 'PREPARING':
            case 'STARTING':
                return 'starting';
            case 'WAITING':
            case 'IN_GAME':
                return 'running';
            case 'FINISHED':
                return 'stopped';
            default:
                return 'stopped';
        }
    }

    private connectToLogStream(): void {
        if (this.logsEventSource) {
            this.logsEventSource.close();
        }

        const logsUrl = this.minigameService.getLogsUrl(this.serverId, 100, false);
        this.logsEventSource = new EventSource(logsUrl);

        this.logsEventSource.addEventListener('log', (event: any) => {
            const logMessage = event.data;
            this.serverLogs.push(logMessage);

            if (this.serverLogs.length > 500) {
                this.serverLogs = this.serverLogs.slice(-500);
            }

            this.filterLogs();

            if (this.autoScrollEnabled) {
                setTimeout(() => this.scrollToBottom(), 0);
            }
        });

        this.logsEventSource.onerror = (error) => {
            console.error('Erreur de connexion aux logs:', error);
            setTimeout(() => this.connectToLogStream(), 5000);
        };
    }

    protected readonly getStatusSeverity = getStatusSeverity;
    protected readonly getStatusDisplay = getStatusDisplay;
}
