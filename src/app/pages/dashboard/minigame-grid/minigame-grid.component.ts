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
import { MinigameEditComponent } from '../minigame-edit/minigame-edit.component';

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
    public minigames: Minigame[] = [];
    public loading = true;
    public rebuildingImage: { [key: string]: boolean } = {};

    // Variables pour le dialogue d'édition
    public editDialogVisible = false;
    public minigameToEdit: Minigame | null = null;
    public isCreateMode = false;

    public cleaningSystem: boolean = false;

    // Couleurs disponibles pour les barres
    private availableColors = ['blue', 'green', 'purple', 'orange', 'indigo', 'teal', 'red', 'pink', 'amber', 'cyan'];

    constructor(
        private minigameService: MinigameService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    public async ngOnInit() {
        await this.loadMinigames();
    }

    public async loadMinigames() {
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
        } catch (error) {
            console.error('Erreur lors du chargement des mini-jeux:', error);
            this.minigames = [];
        } finally {
            this.loading = false;
        }
    }

    private getRandomColor(): string {
        return this.availableColors[Math.floor(Math.random() * this.availableColors.length)];
    }

    public rebuildImage(event: Event, minigame: Minigame) {
        event.stopPropagation();
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

    public createMinigame() {
        this.isCreateMode = true;
        this.minigameToEdit = null;
        this.editDialogVisible = true;
    }

    public editMinigame(event: Event, minigame: Minigame) {
        event.stopPropagation();
        this.isCreateMode = false;
        this.minigameToEdit = minigame;
        this.editDialogVisible = true;
    }

    public async saveMinigame(data: { data: any, isCreateMode: boolean }) {
        try {
            if (data.isCreateMode) {
                await this.minigameService.createMinigame(data.data);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Le mini-jeu "${data.data.name}" a été créé avec succès`
                });
            } else {
                await this.minigameService.updateMinigame(data.data.key, data.data);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Le mini-jeu "${data.data.name}" a été mis à jour avec succès`
                });
            }

            await this.loadMinigames();

        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Erreur lors de l'enregistrement du mini-jeu: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    public deleteMinigame(event: Event, minigame: Minigame) {
        event.stopPropagation();

        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer le mini-jeu "${minigame.name}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Non',
            acceptButtonStyleClass: 'p-button-danger',
            accept: async () => {
                try {
                    await this.minigameService.deleteMinigame(minigame.key);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Suppression réussie',
                        detail: `Le mini-jeu "${minigame.name}" a été supprimé avec succès`
                    });
                    await this.loadMinigames();
                } catch (error) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: `Erreur lors de la suppression du mini-jeu: ${error instanceof Error ? error.message : String(error)}`
                    });
                }
            }
        });
    }

    public confirmCleanupSystem(): void {
        this.confirmationService.confirm({
            message: 'Cette action va arrêter tous les serveurs en cours et nettoyer toutes les ressources Docker. Voulez-vous continuer ?',
            header: 'Confirmation de nettoyage',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, nettoyer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.cleanupSystem();
            }
        });
    }

    private async cleanupSystem(): Promise<void> {
        this.cleaningSystem = true;
        try {
            const result = await this.minigameService.cleanupSystem();

            if (result.success) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Nettoyage réussi',
                    detail: result.message || `${result.stoppedContainers} serveurs arrêtés, ${result.removedImages} images supprimées`
                });
                await this.loadMinigames();
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: result.error || 'Une erreur est survenue lors du nettoyage'
                });
            }
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Erreur lors du nettoyage: ${error instanceof Error ? error.message : String(error)}`
            });
        } finally {
            this.cleaningSystem = false;
        }
    }

    // Helper pour obtenir les initiales pour l'avatar
    public getInitials = getInitials;
}
