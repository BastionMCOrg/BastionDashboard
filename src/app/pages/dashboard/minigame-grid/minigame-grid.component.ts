import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MinigameService } from '../../../core/services/minigame.service';
import { Minigame } from '../../../core/models/minigame.model';
import { getInitials } from '../../../core/utils/dashboard.utils';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import {MinigameEditComponent} from '../minigame-edit/minigame-edit.component';

@Component({
    selector: 'app-minigame-grid',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        CardModule,
        TooltipModule,
        AvatarModule,
        ConfirmDialogModule,
        MinigameEditComponent,
        ProgressSpinnerModule,
        TagModule
    ],
    templateUrl: './minigame-grid.component.html',
    styleUrl: './minigame-grid.component.scss',
    providers: [ConfirmationService]
})
export class MinigameGridComponent implements OnInit {
    minigames: Minigame[] = [];
    loading = true;
    rebuildingImage: { [key: string]: boolean } = {};

    // Variables pour le dialogue d'édition
    editDialogVisible = false;
    minigameToEdit: Minigame | null = null;

    // Couleurs disponibles pour les barres
    availableColors = ['blue', 'green', 'purple', 'orange', 'indigo', 'teal', 'red', 'pink', 'amber', 'cyan'];

    constructor(
        private minigameService: MinigameService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    async ngOnInit() {
        await this.loadMinigames();
    }

    async loadMinigames() {
        this.loading = true;
        try {
            const minigames = await this.minigameService.getMinigames();
            // S'assurer que chaque minigame a une propriété stats par défaut et une couleur aléatoire
            this.minigames = minigames.map(minigame => ({
                ...minigame,
                stats: minigame.stats || {
                    avgTps: 0,
                    avgMemoryUsage: 0,
                    avgCpuUsage: 0,
                    avgStartupTime: 0,
                    successRate: 0,
                    activeServers: 0,
                    peakPlayerCount: 0,
                    currentPlayerCount: 0
                },
                color: minigame.color || this.getRandomColor()
            }));

            console.log('Minigames chargés avec stats par défaut:', this.minigames);
        } catch (error) {
            console.error('Erreur lors du chargement des mini-jeux:', error);
            this.minigames = [];
        } finally {
            this.loading = false;
        }
    }

    getRandomColor(): string {
        return this.availableColors[Math.floor(Math.random() * this.availableColors.length)];
    }

    rebuildImage(event: Event, minigame: Minigame) {
        event.stopPropagation(); // Éviter la propagation de l'événement

        // Exécution directe sans confirmation
        this.rebuildingImage[minigame.key] = true;

        this.minigameService.rebuildImage(minigame.key)
            .then(() => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Image reconstruite',
                    detail: `L'image Docker pour "${minigame.name}" a été reconstruite avec succès`
                });
            })
            .catch(error => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: `Erreur lors de la reconstruction de l'image Docker: ${error instanceof Error ? error.message : String(error)}`
                });
            })
            .finally(() => {
                this.rebuildingImage[minigame.key] = false;
            });
    }

    editMinigame(event: Event, minigame: Minigame) {
        event.stopPropagation(); // Éviter la propagation de l'événement

        this.minigameToEdit = minigame;
        this.editDialogVisible = true;
    }

    saveMinigame(updatedMinigame: any) {
        // Mise à jour des données locales
        if (this.minigameToEdit) {
            const index = this.minigames.findIndex(m => m.key === this.minigameToEdit?.key);
            if (index !== -1) {
                this.minigames[index] = {
                    ...this.minigames[index],
                    ...updatedMinigame,
                    // Préserver les stats qui ne font pas partie du formulaire
                    stats: this.minigames[index].stats
                };
            }
        }

        this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Mini-jeu mis à jour avec succès',
            life: 3000
        });
    }

    // Helper pour obtenir les initiales pour l'avatar
    getInitials = getInitials;
}
