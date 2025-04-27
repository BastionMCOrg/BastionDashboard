import {Component, OnInit} from '@angular/core';
import {StatsComponent} from '../stats/stats.component';
import {ServerListComponent} from '../../shared/server-list/server-list.component';
import {ProgressSpinner} from 'primeng/progressspinner';
import {NgIf} from "@angular/common";
import {MinigameService} from "../../core/services/minigame.service";

@Component({
    selector: 'app-dashboard',
    imports: [
        StatsComponent,
        ServerListComponent,
        ProgressSpinner,
        NgIf
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    standalone: true,
})
export class DashboardComponent implements OnInit {
    loading = true;

    constructor(private minigameService: MinigameService) {}

    async ngOnInit() {
        try {
            await this.minigameService.getMinigames();
            this.loading = false;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du dashboard:', error);
            this.loading = false;
        }
    }
}
