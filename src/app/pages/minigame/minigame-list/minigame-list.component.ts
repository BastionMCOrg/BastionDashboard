import {Component, OnInit} from '@angular/core';
import {TableModule} from 'primeng/table';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {InputText} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';
import {Avatar} from 'primeng/avatar';
import {Tooltip} from 'primeng/tooltip';
import {ProgressBar} from 'primeng/progressbar';
import {Tag} from 'primeng/tag';
import {Button, ButtonDirective, ButtonIcon} from 'primeng/button';
import {RouterLink} from '@angular/router';
import {MinigameService} from "../../../core/services/minigame.service";
import {Severity} from "../../../core/models/utils.model";

interface MiniGame {
    id: string;
    name: string;
    servers: number;
    startupTime: number;
    tps: {
        value: number;
        status: Severity;
    };
    resources: {
        ram: string;
        ramUsage: number; // pourcentage d'utilisation
        cpu: number;      // pourcentage d'utilisation
    };
    players: number;
    color: string;
}

@Component({
    selector: 'app-minigame-list',
    imports: [
        TableModule,
        IconField,
        InputIcon,
        InputText,
        FormsModule,
        Avatar,
        Tooltip,
        ProgressBar,
        Tag,
        Button,
        RouterLink,
        ButtonIcon
    ],
    templateUrl: './minigame-list.component.html',
    styleUrl: 'minigame-list.component.scss',
    standalone: true
})
export class MinigameListComponent implements OnInit {

    tableSearch = '';
    selectedMiniGame: MiniGame | null = null;
    minigames: MiniGame[] = [];
    loading = true;

    constructor(private minigameService: MinigameService) {}

    async ngOnInit() {
        await this.loadMinigames();
    }

    async loadMinigames() {
        this.loading = true;
        try {
            // Récupérer les données des minigames depuis l'API
            const apiMinigames = await this.minigameService.getMinigames();

            // Transformer les données au format attendu par notre composant
            this.minigames = await Promise.all(apiMinigames.map(async (minigame) => {
                // Récupérer les instances pour ce minigame pour connaître le nombre de serveurs
                const instances = await this.minigameService.getMinigameInstances(minigame.name);

                // Calculer les joueurs connectés
                const totalPlayers = instances.reduce((sum, instance) => sum + instance.players.current, 0);

                return {
                    id: minigame.id,
                    name: minigame.displayName,
                    servers: instances.length,
                    startupTime: minigame.stats.avgStartupTime,
                    tps: {
                        value: minigame.stats.avgTps,
                        status: this.getTpsStatus(minigame.stats.avgTps)
                    },
                    resources: {
                        ram: minigame.serverSettings.memory,
                        ramUsage: minigame.stats.avgMemoryUsage,
                        cpu: minigame.stats.avgCpuUsage
                    },
                    players: totalPlayers,
                    color: minigame.color
                };
            }));
        } catch (error) {
            console.error('Erreur lors du chargement des mini-jeux:', error);
            // Garder la liste vide ou initialiser avec des données fictives
            this.minigames = [];
        } finally {
            this.loading = false;
        }
    }

    /**
     * Détermine le statut TPS en fonction de la valeur
     */
    private getTpsStatus(tps: number): Severity {
        if (tps >= 19) return 'success';
        if (tps >= 17) return 'warn';
        return 'danger';
    }
}
