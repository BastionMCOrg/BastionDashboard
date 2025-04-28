import {Component, OnInit} from '@angular/core';
import {ServerListComponent} from '../../shared/server-list/server-list.component';
import {ProgressSpinner} from 'primeng/progressspinner';
import {NgIf} from "@angular/common";
import {MinigameService} from "../../core/services/minigame.service";
import {MinigameGridComponent} from './minigame-grid/minigame-grid.component';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {ConfirmDialogModule} from 'primeng/confirmdialog';

@Component({
    selector: 'app-dashboard',
    imports: [
        ServerListComponent,
        ProgressSpinner,
        NgIf,
        MinigameGridComponent,
        ToastModule,
        ConfirmDialogModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    standalone: true,
    providers: [MessageService]
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
