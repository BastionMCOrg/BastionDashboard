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
import {MinigameService, PaginationParams} from '../../core/services/minigame.service';
import {ServerInstance} from '../../core/models/server-instance.model';
import {ProgressSpinner} from 'primeng/progressspinner';
import {
    getCpuStatusClass,
    getInitials,
    getRamStatusClass,
    getStatusDisplay,
    getStatusSeverity,
    getTpsSeverity,
    getUptime
} from '../../core/utils/dashboard.utils';

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
    selectedServer: ServerInstance | null = null;
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
    servers: ServerInstance[] = [];
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

            this.servers = response.content;
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

    private async loadMinigameFilters() {
        try {
            const minigames = await this.minigameService.getMinigames();

            const filters = minigames.map(minigame => ({
                label: minigame.name,
                value: minigame.displayName
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
                value: mg.displayName
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
            this.router.navigate(['/servers', result.containerId]);
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

    public async stopServer(server: ServerInstance) {
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
