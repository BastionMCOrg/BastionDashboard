import {Component, Input} from '@angular/core';
import {DropdownModule} from 'primeng/dropdown';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
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
import {RouterLink} from '@angular/router';

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
    };
    resources: {
        ram: {
            usage: number;
            total: string;
        };
        cpu: number;
    };
    color: string;
}

@Component({
    selector: 'app-server-list',
    imports: [
        DropdownModule,
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
        NgForOf,
        NgSwitch,
        NgSwitchCase,
        NgSwitchDefault,
        RouterLink
    ],
    templateUrl: './server-list.component.html',
    standalone: true,
    styleUrl: './server-list.component.scss'
})
export class ServerListComponent {

    // Input pour filtrer par minijeu depuis l'extérieur
    @Input() minigameFilter: string | null = null;

    tableSearch = '';
    selectedServer: Server | null = null;

    // État du dialogue de logs
    logsDialogVisible = false;
    serverLogs: string[] = [];

    // Filtres
    selectedMinigameFilter: any = null;
    minigameFilters = [
        { name: 'Tous les mini-jeux', code: 'all', color: 'blue' },
        { name: 'The Tower', code: 'tower', color: 'blue' },
        { name: 'CrazyRace', code: 'crazyrace', color: 'lime' },
        { name: 'Dodgeball', code: 'dodgeball', color: 'indigo' },
        { name: 'Arrows', code: 'arrows', color: 'rose' },
        { name: 'Parkour Battle', code: 'parkour', color: 'violet' },
        { name: 'Poule Renard Vipère', code: 'prv', color: 'cyan' }
    ];

    // Données des serveurs (statiques)
    servers: Server[] = [
        {
            id: 'srv-001',
            containerId: 'minigame-tower-c42a9e8f7b9d10',
            minigame: 'The Tower',
            map: 'MedievalTower',
            startedAt: new Date(new Date().getTime() - 3600000 * 5), // 5h
            status: 'running',
            tps: 19.8,
            players: {
                current: 14,
                max: 16
            },
            resources: {
                ram: {
                    usage: 0.65, // 65%
                    total: '2.0'
                },
                cpu: 25.4
            },
            color: 'blue'
        },
        {
            id: 'srv-002',
            containerId: 'minigame-crazyrace-f89c12d4e5a36b',
            minigame: 'CrazyRace',
            map: 'Jungle',
            startedAt: new Date(new Date().getTime() - 3600000 * 2), // 2h
            status: 'running',
            tps: 19.5,
            players: {
                current: 11,
                max: 16
            },
            resources: {
                ram: {
                    usage: 0.78, // 78%
                    total: '1.5'
                },
                cpu: 35.2
            },
            color: 'lime'
        },
        {
            id: 'srv-003',
            containerId: 'minigame-dodgeball-1e9f23a4d587b6',
            minigame: 'Dodgeball',
            map: 'Arena',
            startedAt: new Date(new Date().getTime() - 3600000 * 8), // 8h
            status: 'running',
            tps: 18.2,
            players: {
                current: 7,
                max: 12
            },
            resources: {
                ram: {
                    usage: 0.55, // 55%
                    total: '1.0'
                },
                cpu: 18.7
            },
            color: 'indigo'
        },
        {
            id: 'srv-004',
            containerId: 'minigame-tower-9a8b7c6d5e4f3a',
            minigame: 'The Tower',
            map: 'ClassicTower',
            startedAt: new Date(new Date().getTime() - 3600000), // 1h
            status: 'running',
            tps: 19.9,
            players: {
                current: 16,
                max: 16
            },
            resources: {
                ram: {
                    usage: 0.82, // 82%
                    total: '2.0'
                },
                cpu: 42.3
            },
            color: 'blue'
        },
        {
            id: 'srv-005',
            containerId: 'minigame-parkour-3e4f5a6b7c8d9e',
            minigame: 'Parkour Battle',
            map: 'Skyscraper',
            startedAt: new Date(new Date().getTime() - 3600000 * 3), // 3h
            status: 'running',
            tps: 16.9,
            players: {
                current: 8,
                max: 16
            },
            resources: {
                ram: {
                    usage: 0.92, // 92%
                    total: '2.0'
                },
                cpu: 55.8
            },
            color: 'violet'
        },
        {
            id: 'srv-006',
            containerId: 'minigame-arrows-1a2b3c4d5e6f7g',
            minigame: 'Arrows',
            map: 'Castle',
            startedAt: new Date(new Date().getTime() - 3600000 * 0.5), // 30min
            status: 'running',
            tps: 19.7,
            players: {
                current: 6,
                max: 12
            },
            resources: {
                ram: {
                    usage: 0.45, // 45%
                    total: '1.0'
                },
                cpu: 15.3
            },
            color: 'rose'
        },
        {
            id: 'srv-007',
            containerId: 'minigame-prv-8h9i0j1k2l3m4n',
            minigame: 'Poule Renard Vipère',
            map: 'Forest',
            startedAt: new Date(new Date().getTime() - 3600000 * 6), // 6h
            status: 'running',
            tps: 19.2,
            players: {
                current: 9,
                max: 16
            },
            resources: {
                ram: {
                    usage: 0.68, // 68%
                    total: '1.5'
                },
                cpu: 22.6
            },
            color: 'cyan'
        },
        {
            id: 'srv-008',
            containerId: 'minigame-crazyrace-5o6p7q8r9s0t1u',
            minigame: 'CrazyRace',
            map: 'Desert',
            startedAt: new Date(new Date().getTime() - 3600000 * 0.1), // 6min
            status: 'starting',
            tps: 20.0,
            players: {
                current: 0,
                max: 16
            },
            resources: {
                ram: {
                    usage: 0.35, // 35%
                    total: '1.5'
                },
                cpu: 45.2
            },
            color: 'lime'
        },
        {
            id: 'srv-009',
            containerId: 'minigame-tower-2v3w4x5y6z7a8b',
            minigame: 'The Tower',
            map: 'FuturisticTower',
            startedAt: new Date(new Date().getTime() - 3600000 * 4), // 4h
            status: 'stopped',
            tps: 0,
            players: {
                current: 0,
                max: 16
            },
            resources: {
                ram: {
                    usage: 0.0, // 0%
                    total: '2.0'
                },
                cpu: 0.0
            },
            color: 'blue'
        }
    ];

    // Serveurs filtrés (initialement tous les serveurs)
    filteredServers: Server[] = [];

    constructor() {
        // Générer les logs d'exemple
        this.generateSampleLogs();
        this.filterServers();
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
     * Filtre les serveurs en fonction de la recherche et du filtre de mini-jeu
     */
    filterServers(): void {
        this.filteredServers = this.servers.filter(server => {
            // Si un filtre de minijeu externe est appliqué (depuis la page de détail)
            if (this.minigameFilter) {
                if (server.minigame !== this.minigameFilter) {
                    return false;
                }
            }
            // Sinon utiliser le filtre de dropdown
            else if (this.selectedMinigameFilter && this.selectedMinigameFilter.code !== 'all') {
                if (server.minigame !== this.selectedMinigameFilter.name) {
                    return false;
                }
            }

            // Filtre par texte de recherche
            const search = this.tableSearch.toLowerCase();
            return !search ||
                server.id.toLowerCase().includes(search) ||
                server.minigame.toLowerCase().includes(search) ||
                server.map.toLowerCase().includes(search) ||
                server.containerId.toLowerCase().includes(search);
        });
    }

    /**
     * Obtient les initiales à partir du nom du mini-jeu
     */
    getInitials(name: string): string {
        if (!name) return '';

        const words = name.split(' ');
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        }

        return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
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
    getTpsSeverity(tps: number): string {
        if (tps >= 19) return 'success';
        if (tps >= 17) return 'warning';
        return 'danger';
    }

    /**
     * Détermine la sévérité du tag de statut
     */
    getStatusSeverity(status: string): string {
        switch (status) {
            case 'running': return 'success';
            case 'starting': return 'info';
            case 'stopped': return 'danger';
            default: return 'warning';
        }
    }

    /**
     * Obtient le texte à afficher pour le statut
     */
    getStatusDisplay(status: string): string {
        switch (status) {
            case 'running': return 'Actif';
            case 'starting': return 'Démarrage';
            case 'stopped': return 'Arrêté';
            default: return status;
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
     * Affiche les logs du serveur
     */
    viewLogs(server: Server): void {
        this.selectedServer = server;
        this.logsDialogVisible = true;
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
            "[2025-03-12 08:20:45] [Server thread/INFO]: Player001 joined the game",
            "[2025-03-12 08:23:12] [Server thread/INFO]: Player002 joined the game",
            "[2025-03-12 08:25:33] [Server thread/INFO]: Player003 joined the game",
            "[2025-03-12 08:30:21] [Server thread/WARN]: Can't keep up! Is the server overloaded?",
            "[2025-03-12 08:32:45] [Server thread/INFO]: Player004 joined the game",
            "[2025-03-12 08:35:18] [Server thread/INFO]: Player005 joined the game",
            "[2025-03-12 08:40:22] [Server thread/ERROR]: Error executing task",
            "[2025-03-12 08:40:23] [Server thread/INFO]: java.lang.Exception: Example exception for demonstration",
            "[2025-03-12 08:40:33] [Server thread/INFO]: Player001 left the game",
            "[2025-03-12 08:42:11] [Server thread/INFO]: TPS from last 1m, 5m, 15m: 19.8, 19.9, 20.0",
            "[2025-03-12 08:45:32] [Server thread/INFO]: Player006 joined the game",
            "[2025-03-12 08:50:17] [Server thread/INFO]: World saved in 234ms",
            "[2025-03-12 08:55:43] [Server thread/INFO]: Player007 joined the game",
            "[2025-03-12 09:00:01] [Server thread/INFO]: Running scheduled data saving",
            "[2025-03-12 09:00:02] [Server thread/INFO]: World saved in 156ms",
            "[2025-03-12 09:02:14] [Server thread/INFO]: Player008 joined the game",
            "[2025-03-12 09:05:32] [Server thread/INFO]: Player002 left the game",
            "[2025-03-12 09:10:45] [Server thread/INFO]: TPS from last 1m, 5m, 15m: 19.7, 19.8, 19.9"
        ];
    }

}
