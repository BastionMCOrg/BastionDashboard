import {Component, Input, OnInit} from '@angular/core';
import {Select, SelectItem} from 'primeng/select';
import {NgIf} from '@angular/common';
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
        ProgressSpinner
    ],
    templateUrl: './server-list.component.html',
    standalone: true,
    styleUrl: './server-list.component.scss'
})
export class ServerListComponent implements OnInit {
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

    constructor(
        private minigameService: MinigameService,
        private router: Router
    ) {
    }

    public async ngOnInit() {
        await this.loadMinigameFilters();
        await this.loadAvailableMinigames();
        await this.loadServers();
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
            this.servers = response.content.map(server => {
                return ({
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
                })
            });

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
            await this.loadServers();
        } catch (error) {
            console.error(`Erreur lors de l'arrêt du serveur ${server.id}:`, error);
        }
    }

    protected readonly getCpuStatusClass = getCpuStatusClass;
    protected readonly getTpsSeverity = getTpsSeverity;
    protected readonly getRamStatusClass = getRamStatusClass;
    protected readonly getInitials = getInitials;
    protected readonly getUptime = getUptime;
    protected readonly getStatusSeverity = getStatusSeverity;
    protected readonly getStatusDisplay = getStatusDisplay;
}
