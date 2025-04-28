import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Select} from 'primeng/select';
import {NgClass, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {InputText} from 'primeng/inputtext';
import {TableModule} from 'primeng/table';
import {Tag} from 'primeng/tag';
import {Tooltip} from 'primeng/tooltip';
import {Avatar} from 'primeng/avatar';
import {ProgressBar} from 'primeng/progressbar';
import {Button} from 'primeng/button';
import {Dialog} from 'primeng/dialog';
import {Router, RouterLink} from '@angular/router';
import {ProgressSpinner} from 'primeng/progressspinner';
import {
    getCpuStatusClass,
    getInitials,
    getRamStatusClass,
    getStatusDisplay,
    getStatusSeverity,
    getTpsSeverity,
    getUptime
} from '../../../core/utils/dashboard.utils';
import {MinigameService, PaginationParams} from '../../../core/services/minigame.service';
import {ServerNotification, ServerStatsService} from '../../../core/services/server-stats.service';
import {MessageService} from 'primeng/api';
import {Subscription} from 'rxjs';
import {Toast} from 'primeng/toast';

@Component({
    selector: 'app-server-list',
    imports: [
        Select,
        NgIf,
        FormsModule,
        IconField,
        InputIcon,
        InputText,
        TableModule,
        Tag,
        Tooltip,
        Avatar,
        ProgressBar,
        Button,
        Dialog,
        RouterLink,
        ProgressSpinner,
        Toast,
        NgClass
    ],
    templateUrl: './server-list.component.html',
    standalone: true,
    styleUrl: './server-list.component.scss',
    providers: [MessageService]
})
export class ServerListComponent implements OnInit, OnDestroy {
    @Input() minigameFilter: string | null = null;

    tableSearch = '';
    selectedServer: any = null;
    loading = false;
    launchingServer = false;

    // Dialogue de lancement rapide
    quickLaunchDialogVisible = false;
    selectedMinigameToLaunch: any = null;
    availableMinigames: any[] = [];

    // Filtres
    selectedMinigameFilter: any = null;
    minigameFilters: any[] = [
        {label: 'Tous les mini-jeux', value: 'all'}
    ];

    // Données des serveurs avec pagination
    servers: any[] = [];
    totalRecords = 0;
    totalPages = 0;

    // Paramètres de pagination
    paginationParams: PaginationParams = {
        page: 1,
        size: 10
    };
    protected readonly getCpuStatusClass = getCpuStatusClass;
    protected readonly getTpsSeverity = getTpsSeverity;
    protected readonly getRamStatusClass = getRamStatusClass;
    protected readonly getInitials = getInitials;
    protected readonly getUptime = getUptime;
    protected readonly getStatusSeverity = getStatusSeverity;
    protected readonly getStatusDisplay = getStatusDisplay;
    // Subscriptions WebSocket
    private serverCreatedSubscription: Subscription | null = null;
    private serverUpdatedSubscription: Subscription | null = null;
    private serverDeletedSubscription: Subscription | null = null;

    constructor(
        private minigameService: MinigameService,
        private serverStatsService: ServerStatsService,
        private messageService: MessageService,
        private router: Router
    ) {
    }

    public async ngOnInit() {
        await this.loadMinigameFilters();
        await this.loadAvailableMinigames();
        await this.loadServers();

        // S'abonner aux notifications de serveurs
        this.subscribeToServerNotifications();
    }

    public ngOnDestroy() {
        // Se désabonner des notifications
        this.unsubscribeFromServerNotifications();
    }

    public openQuickLaunchDialog() {
        this.quickLaunchDialogVisible = true;
    }

    public async launchServer() {
        if (!this.selectedMinigameToLaunch) return;

        this.launchingServer = true;
        try {
            const result = await this.minigameService.startMinigameInstance(this.selectedMinigameToLaunch);
            this.quickLaunchDialogVisible = false;
            await this.router.navigate(['/servers', result.containerId]);
        } catch (error) {
            console.error('Erreur lors du lancement du serveur:', error);
        } finally {
            this.launchingServer = false;
        }
    }

    public async onPageChange(event: any) {
        this.paginationParams.page = event.page + 1;
        this.paginationParams.size = event.rows;
        await this.loadServers();
    }

    public async onFilterChange() {
        this.paginationParams.page = 1;
        await this.loadServers();
    }

    public async stopServer(server: any) {
        try {
            await this.minigameService.stopMinigameInstance(
                server.minigame,
                server.containerId
            );
            // Pas besoin de recharger manuellement, les notifications WebSocket s'en chargeront
            // await this.loadServers();
        } catch (error) {
            console.error(`Erreur lors de l'arrêt du serveur ${server.id}:`, error);
        }
    }

    protected async loadServers() {
        this.loading = true;
        try {
            const params: PaginationParams = {
                ...this.paginationParams
            };

            if (this.minigameFilter) {
                params.minigameFilter = this.minigameFilter;
            } else if (this.selectedMinigameFilter && this.selectedMinigameFilter !== 'all') {
                params.minigameFilter = this.selectedMinigameFilter;
            }

            if (this.tableSearch) {
                params.search = this.tableSearch;
            }

            const response = await this.minigameService.getAllInstances(params);

            // Adapter les données provenant de Redis au format attendu par le composant
            this.servers = response.content.map(server => this.formatServerData(server));

            this.totalRecords = response.totalElements;
            this.totalPages = response.totalPages;

        } catch (error) {
            console.error('Erreur lors du chargement des serveurs:', error);
            this.servers = [];
            this.totalRecords = 0;
            this.totalPages = 0;
        } finally {
            this.loading = false;
        }
    }

    /**
     * Formate les données du serveur pour l'affichage
     */
    private formatServerData(server: any) {
        return {
            id: server.name, // ID du serveur = nom dans Redis
            containerId: server.name, // Container ID = nom dans Redis
            minigame: server.gameType, // Type de jeu
            map: server.mapName || 'default', // Nom de la map
            startedAt: new Date(server.lastUpdate), // Date de dernière mise à jour
            status: this.mapRedisState(server.state), // État convertit au format du dashboard
            players: {
                current: server.connectedPlayers || 0, // Joueurs connectés
                max: server.maxPlayers || 16, // Joueurs maximum
                list: server.players || [] // Liste des joueurs
            },
            // Ajouter des données statiques pour ressources non disponibles dans Redis
            resources: {
                ram: {
                    usage: 0.6, // Valeur statique de 60%
                    total: 2.0 // Valeur statique de 2 GB
                },
                cpu: 25 // Valeur statique de 25%
            },
            tps: 19.8, // Valeur statique de 19.8 TPS
            color: 'blue' // Couleur par défaut
        };
    }

    /**
     * Convertit l'état Redis en état compréhensible par le dashboard
     */
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

    /**
     * S'abonne aux notifications de serveurs
     */
    private subscribeToServerNotifications() {
        // S'abonner au service WebSocket
        this.serverStatsService.subscribeToServerNotifications();

        // S'abonner aux notifications de création
        this.serverCreatedSubscription = this.serverStatsService.getServerCreatedNotifications()
            .subscribe(notification => this.handleServerCreated(notification));

        // S'abonner aux notifications de mise à jour
        this.serverUpdatedSubscription = this.serverStatsService.getServerUpdatedNotifications()
            .subscribe(notification => this.handleServerUpdated(notification));

        // S'abonner aux notifications de suppression
        this.serverDeletedSubscription = this.serverStatsService.getServerDeletedNotifications()
            .subscribe(notification => this.handleServerDeleted(notification));
    }

    /**
     * Se désabonne des notifications de serveurs
     */
    private unsubscribeFromServerNotifications() {
        if (this.serverCreatedSubscription) {
            this.serverCreatedSubscription.unsubscribe();
            this.serverCreatedSubscription = null;
        }

        if (this.serverUpdatedSubscription) {
            this.serverUpdatedSubscription.unsubscribe();
            this.serverUpdatedSubscription = null;
        }

        if (this.serverDeletedSubscription) {
            this.serverDeletedSubscription.unsubscribe();
            this.serverDeletedSubscription = null;
        }

        this.serverStatsService.unsubscribeFromServerNotifications();
    }

    /**
     * Gère la notification de création de serveur
     */
    private handleServerCreated(notification: ServerNotification) {
        // Vérifier si le serveur correspond au filtre actuel
        if (this.shouldShowServer(notification.gameType)) {
            // Ajouter le nouveau serveur à la liste
            if (notification.serverData) {
                const formattedServer = this.formatServerData(notification.serverData);

                // S'assurer que le serveur n'existe pas déjà dans la liste
                const existingIndex = this.servers.findIndex(s => s.id === formattedServer.id);
                if (existingIndex === -1) {
                    this.servers = [formattedServer, ...this.servers];
                    this.totalRecords++;

                    // Notification
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Nouveau serveur',
                        detail: `Le serveur ${formattedServer.id} a été créé`
                    });
                }
            } else {
                // Si on n'a pas les données complètes, recharger la liste
                this.loadServers();
            }
        }
    }

    /**
     * Gère la notification de mise à jour de serveur
     */
    private handleServerUpdated(notification: ServerNotification) {
        console.log('Server updated:', notification);
        // Rechercher le serveur dans la liste
        const existingIndex = this.servers.findIndex(s => s.id === notification.serverId);

        if (existingIndex !== -1) {
            // Mettre à jour le serveur existant
            if (notification.serverData) {
                const updatedServer = this.formatServerData(notification.serverData);
                this.servers[existingIndex] = updatedServer;

                // Déclencher la détection de changements (en créant un nouveau tableau)
                this.servers = [...this.servers];
            }
        } else if (this.shouldShowServer(notification.gameType)) {
            // Si le serveur n'est pas dans la liste mais correspond au filtre, recharger
            this.loadServers();
        }
    }

    /**
     * Gère la notification de suppression de serveur
     */
    private handleServerDeleted(notification: ServerNotification) {
        // Rechercher le serveur dans la liste
        const existingIndex = this.servers.findIndex(s => s.id === notification.serverId);

        if (existingIndex !== -1) {
            // Supprimer le serveur de la liste
            this.servers.splice(existingIndex, 1);
            this.totalRecords--;

            // Déclencher la détection de changements (en créant un nouveau tableau)
            this.servers = [...this.servers];

            // Notification
            this.messageService.add({
                severity: 'info',
                summary: 'Serveur arrêté',
                detail: `Le serveur ${notification.serverId} a été arrêté`
            });
        }
    }

    /**
     * Vérifie si un serveur doit être affiché selon les filtres actuels
     */
    private shouldShowServer(gameType: string): boolean {
        if (this.minigameFilter) {
            // Si on a un filtre de minigame externe, vérifier s'il correspond
            return gameType === this.minigameFilter;
        } else if (this.selectedMinigameFilter && this.selectedMinigameFilter !== 'all') {
            // Si on a un filtre de minigame sélectionné, vérifier s'il correspond
            return gameType === this.selectedMinigameFilter;
        }

        // Si aucun filtre, afficher tous les serveurs
        return true;
    }

    private async loadMinigameFilters() {
        try {
            const minigames = await this.minigameService.getMinigames();

            const filters = minigames.map(minigame => ({
                label: minigame.name,
                value: minigame.key
            }));

            this.minigameFilters = [
                {label: 'Tous les mini-jeux', value: 'all'},
                ...filters
            ];
        } catch (error) {
            console.error('Erreur lors du chargement des filtres de mini-jeux:', error);
        }
    }

    private async loadAvailableMinigames() {
        try {
            const minigames = await this.minigameService.getMinigames();
            this.availableMinigames = minigames.map(mg => ({
                label: mg.name,
                value: mg.key
            }));
        } catch (error) {
            console.error('Erreur lors du chargement des mini-jeux disponibles:', error);
        }
    }
}
