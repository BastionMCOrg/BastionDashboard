import { Component } from '@angular/core';
import {Minigame} from '../../core/models/minigame.model';
import {Avatar} from 'primeng/avatar';
import {Button} from 'primeng/button';
import {StatsComponent} from '../stats/stats.component';
import {Dialog} from 'primeng/dialog';
import {PrimeTemplate} from 'primeng/api';
import {ServerListComponent} from '../../shared/server-list/server-list.component';

@Component({
    selector: 'app-minigame',
    imports: [
        Avatar,
        Button,
        StatsComponent,
        Dialog,
        PrimeTemplate,
        ServerListComponent
    ],
    templateUrl: './minigame.component.html',
    styleUrl: './minigame.component.scss',
    standalone: true
})
export class MinigameComponent {

    editDialogVisible: boolean = false;

    // Données statiques d'un mini-jeu
    minigame: Minigame = {
        id: 'TW01',
        name: 'tower',
        displayName: 'The Tower',
        description: 'Visualisez et gérez les instances du mini-jeu The Tower en cours d\'exécution.',
        developerNames: ['AlexCraft', 'MineBuildPro'],
        enabled: true,
        gameSettings: {
            maxPlayers: 16,
            minPlayers: 8
        },
        serverSettings: {
            memory: '2G',
            cpu: '2',
            javaVersion: '17',
            serverVersion: '1.20.1'
        },
        color: 'blue',
        stats: {
            avgTps: 19.4,
            avgMemoryUsage: 65.8,
            avgCpuUsage: 32.5,
            avgStartupTime: 12.3,
            successRate: 98.2,
            activeServers: 3,
            peakPlayerCount: 42,
            currentPlayerCount: 36
        }
    };

    constructor() { }

    // Obtenir les initiales du nom pour l'avatar
    getInitials(name: string): string {
        if (!name) return '';

        const words = name.split(' ');
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        }

        return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }

    // Ouvrir le dialogue de modification
    openEditDialog(): void {
        this.editDialogVisible = true;
    }

}
