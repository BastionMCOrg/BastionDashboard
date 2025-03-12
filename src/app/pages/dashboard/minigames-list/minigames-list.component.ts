import {Component} from '@angular/core';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {InputText} from 'primeng/inputtext';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TableModule} from 'primeng/table';
import {Tag} from 'primeng/tag';

// Interface pour les données de mini-jeux Minecraft
interface Minigame {
    id: string;
    name: string;
    servers: number;
    launchTime: number; // Temps de lancement en secondes
    tps: number;
    players: number; // Nombre de joueurs actuels
    resources: {
        ram: string;
        cpu: string;
    };
}

@Component({
    selector: 'app-minigames-list',
    imports: [
        IconField,
        InputIcon,
        InputText,
        ReactiveFormsModule,
        TableModule,
        Tag,
        FormsModule
    ],
    templateUrl: './minigames-list.component.html',
    host: {
        class: 'w-full overflow-auto'
    },
    styles: `
        :host ::ng-deep {
            .p-datatable {
                .p-datatable-thead > tr th {
                    background: transparent;
                }

                .p-datatable-tbody > tr {
                    background: transparent;
                }

                .p-datatable-tbody > tr.p-datatable-row-selected > td,
                .p-datatable-tbody > tr:has(+ .p-datatable-row-selected) > td {
                    border-bottom-color: var(--p-datatable-body-cell-border-color);
                }

                .p-paginator {
                    background: transparent;
                }
            }
        }
    `
})
export class MinigamesListComponent {

    tableSearch = '';

    // Données de mini-jeux Minecraft
    minigames: Minigame[] = [
        {
            id: 'MG-001',
            name: 'SkyWars',
            servers: 5,
            launchTime: 8, // secondes
            tps: 19.8,
            players: 128,
            resources: {
                ram: '4GB/8GB',
                cpu: '35%'
            }
        },
        {
            id: 'MG-002',
            name: 'BedWars',
            servers: 8,
            launchTime: 12,
            tps: 18.5,
            players: 256,
            resources: {
                ram: '6GB/8GB',
                cpu: '45%'
            }
        },
        {
            id: 'MG-003',
            name: 'Survival Games',
            servers: 3,
            launchTime: 15,
            tps: 16.2,
            players: 96,
            resources: {
                ram: '3GB/4GB',
                cpu: '62%'
            }
        },
        {
            id: 'MG-004',
            name: 'Parkour',
            servers: 2,
            launchTime: 5,
            tps: 20.0,
            players: 45,
            resources: {
                ram: '2GB/4GB',
                cpu: '25%'
            }
        },
        {
            id: 'MG-005',
            name: 'UHC',
            servers: 4,
            launchTime: 20,
            tps: 14.3,
            players: 75,
            resources: {
                ram: '7GB/8GB',
                cpu: '78%'
            }
        },
        {
            id: 'MG-006',
            name: 'Creative',
            servers: 6,
            launchTime: 9,
            tps: 19.5,
            players: 120,
            resources: {
                ram: '5GB/8GB',
                cpu: '40%'
            }
        },
        {
            id: 'MG-007',
            name: 'Skyblock',
            servers: 7,
            launchTime: 25,
            tps: 12.8,
            players: 250,
            resources: {
                ram: '8GB/8GB',
                cpu: '92%'
            }
        },
        {
            id: 'MG-008',
            name: 'Prison',
            servers: 4,
            launchTime: 11,
            tps: 17.6,
            players: 112,
            resources: {
                ram: '5GB/8GB',
                cpu: '51%'
            }
        },
        {
            id: 'MG-009',
            name: 'KitPvP',
            servers: 3,
            launchTime: 7,
            tps: 19.2,
            players: 87,
            resources: {
                ram: '4GB/6GB',
                cpu: '37%'
            }
        }
    ];

    selectedMinigames: Minigame[] = [];

    // Méthode pour déterminer la sévérité du TPS pour le code couleur
    getTpsSeverity(tps: number): string {
        if (tps >= 19) return 'success'; // Vert
        if (tps >= 17) return 'info';    // Bleu
        if (tps >= 15) return 'warning'; // Orange
        return 'danger';                 // Rouge
    }

    // Méthodes pour les actions des boutons
    launchServer(minigame: Minigame): void {
        console.log(`Lancement du serveur pour ${minigame.name}`);
        // Implémentation pour le lancement du serveur
    }

    viewDetails(minigame: Minigame): void {
        console.log(`Affichage des détails pour ${minigame.name}`);
        // Implémentation pour la navigation vers la page de détails
    }
}
