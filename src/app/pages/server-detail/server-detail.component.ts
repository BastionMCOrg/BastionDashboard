import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {AvatarModule} from 'primeng/avatar';
import {ProgressBarModule} from 'primeng/progressbar';
import {TagModule} from 'primeng/tag';
import {TooltipModule} from 'primeng/tooltip';
import {DialogModule} from 'primeng/dialog';
import {InputTextModule} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {MinigameService} from '../../core/services/minigame.service';
import {getCpuStatusClass, getRamStatusClass, getTpsSeverity, getUptime} from '../../core/utils/dashboard.utils';

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
        InputIconModule
    ]
})
export class ServerDetailComponent implements OnInit, OnDestroy {
    serverId: string = '';
    server: any = null;
    serverDetails: any = null;

    // Pour les logs
    serverLogs: string[] = [];
    logFilter: string = '';
    filteredLogs: string[] = [];
    logsFullscreen: boolean = false;
    logsEventSource: EventSource | null = null;

    // Pour la commande RCON
    rconCommand: string = '';
    commandExecuting: boolean = false;

    // Filtres de logs
    logLevels = [
        {label: 'Tous les niveaux', value: 'all'},
        {label: 'Info', value: 'info'},
        {label: 'Avertissement', value: 'warn'},
        {label: 'Erreur', value: 'error'}
    ];
    selectedLogLevel: string = 'all';

    // Options pour les graphiques
    timeRanges = [
        {name: '30 minutes', value: 30},
        {name: '1 heure', value: 60},
        {name: '3 heures', value: 180},
        {name: '12 heures', value: 720}
    ];
    selectedTimeRange = this.timeRanges[1]; // 1 heure par défaut

    constructor(
        private route: ActivatedRoute,
        private minigameService: MinigameService,
    ) {
    }

    public async ngOnInit(): Promise<void> {
        this.route.params.subscribe(async (params) => {
            this.serverId = params['id'];
            await this.loadServerData();
            this.connectToLogStream();
            this.startTpsChecker();
        });
    }

    ngOnDestroy(): void {
        // Fermer la connexion SSE aux logs
        if (this.logsEventSource) {
            this.logsEventSource.close();
        }
    }

    async loadServerData(): Promise<void> {
        try {
            // Charger les détails du serveur depuis l'API
            this.serverDetails = await this.minigameService.getServerDetails(this.serverId);

            // Créer l'objet serveur pour l'affichage
            this.server = {
                id: this.serverDetails.name,
                containerId: this.serverDetails.name,
                minigame: this.serverDetails.gameType,
                map: this.serverDetails.mapName || 'world',
                startedAt: new Date(this.serverDetails.lastUpdate),
                status: this.mapRedisState(this.serverDetails.state),
                tps: 19.8, // Donnée statique, à remplacer quand disponible
                players: {
                    current: this.serverDetails.connectedPlayers || 0,
                    max: this.serverDetails.maxPlayers || 16,
                    list: this.serverDetails.players || []
                },
                resources: {
                    ram: {
                        usage: 0.65, // Statique pour l'instant
                        total: 2.0,  // Statique pour l'instant
                        history: [] // Pour les graphiques (à implémenter plus tard)
                    },
                    cpu: {
                        usage: 25.4, // Statique pour l'instant
                        history: [] // Pour les graphiques (à implémenter plus tard)
                    }
                },
                tpsHistory: [], // Pour les graphiques (à implémenter plus tard)
                color: 'blue', // Couleur par défaut
                version: '1.20.1', // Statique pour l'instant
                javaVersion: 'Java 17' // Statique pour l'instant
            };

        } catch (error) {
            console.error('Erreur lors du chargement des données du serveur:', error);
        }
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
     * Se connecte au flux de logs via SSE
     */
    private connectToLogStream(): void {
        // Fermer la connexion existante si nécessaire
        if (this.logsEventSource) {
            this.logsEventSource.close();
        }

        // Récupérer l'URL des logs
        const logsUrl = this.minigameService.getLogsUrl(this.serverId, 100, false);

        // Créer la connexion SSE
        this.logsEventSource = new EventSource(logsUrl);

        // Écouter les événements de log
        this.logsEventSource.addEventListener('log', (event: any) => {
            const logMessage = event.data;
            this.serverLogs.push(logMessage);

            // Limiter le nombre de logs stockés pour éviter les problèmes de mémoire
            if (this.serverLogs.length > 500) {
                this.serverLogs = this.serverLogs.slice(-500);
            }

            // Mettre à jour les logs filtrés
            this.filterLogs();
        });

        // Écouter les événements de statistiques (pour les futurs graphiques)
        this.logsEventSource.addEventListener('stats', (event: any) => {
            try {
                const stats = JSON.parse(event.data);
                // À implémenter quand les statistiques seront disponibles
                console.log('Statistiques reçues:', stats);
            } catch (error) {
                console.error('Erreur lors du parsing des statistiques:', error);
            }
        });

        // Gestion des erreurs
        this.logsEventSource.onerror = (error) => {
            console.error('Erreur de connexion aux logs:', error);
            // Tentative de reconnexion après un délai
            setTimeout(() => this.connectToLogStream(), 5000);
        };
    }

    /**
     * Exécute une commande RCON
     */
    async executeCommand(): Promise<void> {
        if (!this.rconCommand || this.rconCommand.trim() === '') {
            return;
        }

        this.commandExecuting = true;

        try {
            // Sauvegarder la commande pour l'historique
            const command = this.rconCommand;
            await this.minigameService.executeRconCommand(this.serverId, command);
            this.rconCommand = '';
        } catch (error) {
            console.error('Erreur lors de l\'exécution de la commande RCON:', error);
        } finally {
            this.commandExecuting = false;
        }
    }

    /**
     * Filtre les logs selon les critères sélectionnés
     */
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
    }

    private startTpsChecker(): void {
        setInterval(async() => {
            if (!this.server) return;
            const result = (await this.minigameService.executeRconCommand(this.serverId, "tps")).result;
            this.server.tps = parseFloat(result.split("§6TPS from last 1m, 5m, 15m: §a")[1].split("§r,")[0]);
        }, 5000); // Mettre à jour toutes les 5 secondes
    }

    /**
     * Détermine le niveau de log en fonction du contenu
     */
    getLogLevel(line: string): string {
        if (line.includes('ERROR') || line.includes('SEVERE')) return 'error';
        if (line.includes('WARN') || line.includes('WARNING')) return 'warn';
        if (line.includes('INFO')) return 'info';
        return 'default';
    }

    /**
     * Bascule l'affichage des logs en plein écran
     */
    toggleFullscreenLogs(): void {
        this.logsFullscreen = !this.logsFullscreen;
        if (this.logsFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    /**
     * Arrête le serveur
     */
    async stopServer(): Promise<void> {
        try {
            await this.minigameService.stopMinigameInstance(this.server.minigame, this.server.id);
            // Recharger les données après un court délai
            setTimeout(() => this.loadServerData(), 1000);
        } catch (error) {
            console.error('Erreur lors de l\'arrêt du serveur:', error);
        }
    }

    /**
     * Exécute une commande sur un joueur (kick, ban, etc.)
     */
    async executePlayerCommand(command: string): Promise<any> {
        try {
            await this.minigameService.executeRconCommand(this.serverId, command);
            // Recharger les données après un court délai
            setTimeout(() => this.loadServerData(), 1000);
        } catch (error) {
            console.error(`Erreur lors de l'exécution de la commande ${command}:`, error);
        }
    }

    // Méthodes utilitaires
    protected readonly getCpuStatusClass = getCpuStatusClass;
    protected readonly getTpsSeverity = getTpsSeverity;
    protected readonly getRamStatusClass = getRamStatusClass;
    protected readonly getUptime = getUptime;
}
