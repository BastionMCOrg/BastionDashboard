import {Component, OnInit} from '@angular/core';
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
import {LineChart} from '../../shared/charts/linechart';
import {generateRandomData} from '../../core/utils/utils';
import {DropdownModule} from 'primeng/dropdown';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {Severity} from '../../core/models/utils.model';

interface Player {
    uuid: string;
    username: string;
    joinedAt: Date;
    isOp: boolean;
    gameMode: string;
    ping: number;
}

interface Server {
    id: string;
    containerId: string;
    minigame: string;
    map: string;
    startedAt: Date;
    status: 'starting' | 'running' | 'stopped';
    tps: number;
    players: {
        current: number;
        max: number;
        list: Player[];
    };
    resources: {
        ram: {
            usage: number;
            total: number;
            history: any[];
        };
        cpu: {
            usage: number;
            history: any[];
        };
    };
    tpsHistory: any[];
    color: string;
    version: string;
    javaVersion: string;
    plugins: string[];
    worldSize: number; // En MB
    serverProperties: {
        [key: string]: string;
    };
}

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
        LineChart,
        DropdownModule,
        IconFieldModule,
        InputIconModule
    ]
})
export class ServerDetailComponent implements OnInit {
    serverId: string = '';
    server!: Server;

    // Pour les logs
    serverLogs: string[] = [];
    logFilter: string = '';
    filteredLogs: string[] = [];
    logsFullscreen: boolean = false;

    // Pour le dialogue d'action sur un joueur
    playerActionDialogVisible: boolean = false;
    selectedPlayer: Player | null = null;

    // Pour les graphiques
    ramBgColor: string[] = ['rgba(59,130,246,0.1)', 'rgba(59,130,246,0)'];
    ramBorderColor: string = 'rgb(59,130,246)';

    cpuBgColor: string[] = ['rgba(249,115,22,0.1)', 'rgba(249,115,22,0)'];
    cpuBorderColor: string = 'rgb(249,115,22)';

    tpsBgColor: string[] = ['rgba(21,128,61,0.1)', 'rgba(21,128,61,0)'];
    tpsBorderColor: string = 'rgb(21,128,61)';

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

    constructor(private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.serverId = params['id'];
            this.loadServerData();
            // Initialiser directement les logs filtrés
            this.filteredLogs = [...this.serverLogs];
        });
    }

    loadServerData(): void {
        // Simulation de données de serveur (dans un cas réel, ce serait un appel API)
        const now = new Date();
        const ramHistory = generateRandomData(
            new Date(now.getTime() - 3600000 * 12).toISOString(), // 12 heures dans le passé
            now.toISOString(),
            5, // Donnée toutes les 5 minutes
            40,
            85
        );

        const cpuHistory = generateRandomData(
            new Date(now.getTime() - 3600000 * 12).toISOString(),
            now.toISOString(),
            5,
            15,
            65
        );

        const tpsHistory = generateRandomData(
            new Date(now.getTime() - 3600000 * 12).toISOString(),
            now.toISOString(),
            5,
            16,
            20
        );

        // Génération de joueurs factices
        const players: Player[] = [
            {
                uuid: 'c5ef3347-4593-4f39-8bb1-2eaa40dd986e',
                username: 'DragonMaster',
                joinedAt: new Date(now.getTime() - 45 * 60000), // 45 minutes
                isOp: true,
                gameMode: 'survival',
                ping: 23
            },
            {
                uuid: '069a79f4-44e9-4726-a5be-fca90e38aaf5',
                username: 'Notch',
                joinedAt: new Date(now.getTime() - 30 * 60000), // 30 minutes
                isOp: false,
                gameMode: 'adventure',
                ping: 48
            },
            {
                uuid: '853c80ef-3c37-49fd-aa49-938b674adae6',
                username: 'PixelWarrior',
                joinedAt: new Date(now.getTime() - 15 * 60000), // 15 minutes
                isOp: false,
                gameMode: 'survival',
                ping: 67
            },
            {
                uuid: '3c7cef0a-a077-4aed-8bcc-1f97b1ed54fa',
                username: 'EndSlayer',
                joinedAt: new Date(now.getTime() - 5 * 60000), // 5 minutes
                isOp: false,
                gameMode: 'survival',
                ping: 35
            },
            {
                uuid: 'f46de6c4-d62d-44c6-b9bd-2de99107aab8',
                username: 'RedstoneGenius',
                joinedAt: new Date(now.getTime() - 60 * 60000), // 1 heure
                isOp: true,
                gameMode: 'creative',
                ping: 15
            }
        ];

        // Création d'un serveur factice
        this.server = {
            id: this.serverId,
            containerId: 'minigame-tower-c42a9e8f7b9d10',
            minigame: 'The Tower',
            map: 'MedievalTower',
            startedAt: new Date(now.getTime() - 3600000 * 5), // 5h
            status: 'running',
            tps: 19.8,
            players: {
                current: players.length,
                max: 16,
                list: players
            },
            resources: {
                ram: {
                    usage: 0.65, // 65%
                    total: 2.0, // 2 GB
                    history: ramHistory
                },
                cpu: {
                    usage: 25.4,
                    history: cpuHistory
                }
            },
            tpsHistory: tpsHistory,
            color: 'blue',
            version: '1.20.1',
            javaVersion: 'Java 17',
            plugins: [
                'BastionCore v2.8.3',
                'LuckPerms v5.4.30',
                'WorldEdit v7.2.13',
                'BastionTower v1.5.2',
                'ProtocolLib v4.8.0'
            ],
            worldSize: 256, // 256 MB
            serverProperties: {
                'server-port': '25565',
                'gamemode': 'adventure',
                'difficulty': 'normal',
                'max-players': '16',
                'view-distance': '10',
                'spawn-protection': '0',
                'enable-command-block': 'true',
                'pvp': 'true'
            }
        };

        // Génération des logs
        this.generateSampleLogs();
    }

    /**
     * Calcule le temps écoulé depuis le démarrage
     */
    getUptime(startDate: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - startDate.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffHrs > 0) {
            return `${diffHrs}h ${diffMins}m`;
        } else {
            return `${diffMins}m`;
        }
    }

    /**
     * Calcule le temps écoulé depuis la connexion d'un joueur
     */
    getPlayerJoinedTime(joinedAt: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - joinedAt.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));

        if (diffMins >= 60) {
            const hours = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
        } else {
            return `${diffMins}m`;
        }
    }

    /**
     * Détermine la classe CSS pour la barre de progression RAM
     */
    getRamStatusClass(usage: number): string {
        if (usage > 0.8) return 'ram-high';
        if (usage > 0.6) return 'ram-medium';
        return 'ram-low';
    }

    /**
     * Détermine la classe CSS pour la barre de progression CPU
     */
    getCpuStatusClass(usage: number): string {
        if (usage > 50) return 'cpu-high';
        if (usage > 25) return 'cpu-medium';
        return 'cpu-low';
    }

    /**
     * Détermine la sévérité du tag TPS
     */
    getTpsSeverity(tps: number): Severity {
        if (tps >= 19) return 'success';
        if (tps >= 17) return 'warn';
        return 'danger';
    }

    /**
     * Détermine la sévérité du tag de statut
     */
    getStatusSeverity(status: string): Severity {
        switch (status) {
            case 'running':
                return 'success';
            case 'starting':
                return 'info';
            case 'stopped':
                return 'danger';
            default:
                return 'warn';
        }
    }

    /**
     * Obtient le texte à afficher pour le statut
     */
    getStatusDisplay(status: string): string {
        switch (status) {
            case 'running':
                return 'Actif';
            case 'starting':
                return 'Démarrage';
            case 'stopped':
                return 'Arrêté';
            default:
                return status;
        }
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
     * Ouvre le dialogue d'action sur un joueur
     */
    showPlayerActions(player: Player): void {
        this.selectedPlayer = player;
        this.playerActionDialogVisible = true;
    }

    /**
     * Exécute une commande sur le joueur sélectionné
     */
    executePlayerCommand(command: string): void {
        // Ici on simulerait l'exécution de la commande sur le serveur
        console.log(`Exécution de la commande ${command} sur le joueur ${this.selectedPlayer?.username}`);
        // Fermeture du dialogue
        this.playerActionDialogVisible = false;
    }

    /**
     * Redémarre le serveur
     */
    restartServer(): void {
        // Simulation de redémarrage
        console.log('Redémarrage du serveur...');
    }

    /**
     * Arrête le serveur
     */
    stopServer(): void {
        // Simulation d'arrêt
        console.log('Arrêt du serveur...');
    }

    /**
     * Génère des logs d'exemple
     */
    private generateSampleLogs(): void {
        this.serverLogs = [
            "[2025-03-12 08:15:23] [Server thread/INFO]: Starting Minecraft server version 1.20.1",
            "[2025-03-12 08:15:24] [Server thread/INFO]: Loading properties",
            "[2025-03-12 08:15:24] [Server thread/INFO]: This server is running BastionMC version 2.8.3 (MC: 1.20.1)",
            "[2025-03-12 08:15:25] [Server thread/INFO]: Server permissions file permissions.yml is empty, ignoring it",
            "[2025-03-12 08:15:25] [Server thread/INFO]: Preparing level \"world\"",
            "[2025-03-12 08:15:28] [Server thread/INFO]: Preparing start region for dimension minecraft:overworld",
            "[2025-03-12 08:15:30] [Server thread/INFO]: Preparing spawn area: 85%",
            "[2025-03-12 08:15:31] [Server thread/INFO]: Done (7.648s)! For help, type \"help\"",
            "[2025-03-12 08:15:32] [Server thread/INFO]: Starting remote control RCON server on 0.0.0.0:25575",
            "[2025-03-12 08:15:32] [Server thread/INFO]: RCON running on 0.0.0.0:25575",
            "[2025-03-12 08:20:45] [Server thread/INFO]: DragonMaster joined the game",
            "[2025-03-12 08:23:12] [Server thread/INFO]: Notch joined the game",
            "[2025-03-12 08:25:33] [Server thread/INFO]: PixelWarrior joined the game",
            "[2025-03-12 08:30:21] [Server thread/WARN]: Can't keep up! Is the server overloaded?",
            "[2025-03-12 08:32:45] [Server thread/INFO]: EndSlayer joined the game",
            "[2025-03-12 08:35:18] [Server thread/INFO]: RedstoneGenius joined the game",
            "[2025-03-12 08:40:22] [Server thread/ERROR]: Error executing task",
            "[2025-03-12 08:40:23] [Server thread/INFO]: java.lang.Exception: Example exception for demonstration",
            "[2025-03-12 08:42:11] [Server thread/INFO]: TPS from last 1m, 5m, 15m: 19.8, 19.9, 20.0",
            "[2025-03-12 08:45:32] [Server thread/INFO]: Server trying to spawn entity of type minecart",
            "[2025-03-12 08:50:17] [Server thread/INFO]: World saved in 234ms",
            "[2025-03-12 08:55:43] [Server thread/INFO]: DragonMaster issued server command: /gamemode creative",
            "[2025-03-12 09:00:01] [Server thread/INFO]: Running scheduled data saving",
            "[2025-03-12 09:00:02] [Server thread/INFO]: World saved in 156ms",
            "[2025-03-12 09:02:14] [Server thread/INFO]: Player RedstoneGenius moved too quickly! -12.58,92.33,345.93",
            "[2025-03-12 09:05:32] [Server thread/WARN]: Failed to load chunk at [12, -5]",
            "[2025-03-12 09:10:45] [Server thread/INFO]: TPS from last 1m, 5m, 15m: 19.7, 19.8, 19.9",
            "[2025-03-12 09:15:16] [Server thread/INFO]: DragonMaster issued server command: /tp RedstoneGenius",
            "[2025-03-12 09:20:34] [Server thread/INFO]: Player Notch trying to place block outside build range",
            "[2025-03-12 09:25:12] [Server thread/WARN]: Entity movement took 43ms",
            "[2025-03-12 09:30:45] [Server thread/INFO]: Memory usage: 1234MB (65%)",
            "[2025-03-12 09:35:23] [Server thread/ERROR]: Failed to load plugin BastionSpecialEvents.jar",
            "[2025-03-12 09:40:12] [Server thread/INFO]: PixelWarrior issued server command: /warp spawn",
            "[2025-03-12 09:45:33] [Server thread/INFO]: Found 24 entities in loaded chunks",
            "[2025-03-12 09:50:21] [Server thread/INFO]: EndSlayer built a tower at coordinates [124, 78, -36]",
            "[2025-03-12 09:55:44] [Server thread/WARN]: Chunk load times are higher than normal"
        ];

        this.filteredLogs = [...this.serverLogs];
    }

    // La méthode formatPlayerPosition n'est plus nécessaire car nous n'affichons plus la position

    /**
     * Gère le changement de plage de temps pour les graphiques
     */
    onTimeRangeChange(event: any): void {
        // Dans un cas réel, on chargerait de nouvelles données
        console.log('Changement de plage de temps:', event.value);
    }

    /**
     * Gère le changement de niveau de log
     */
    onLogLevelChange(event: any): void {
        this.selectedLogLevel = event.value;
        this.filterLogs();
    }
}
