import { Component } from '@angular/core';
import {TableModule} from 'primeng/table';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {InputText} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';
import {Avatar} from 'primeng/avatar';
import {Tooltip} from 'primeng/tooltip';
import {ProgressBar} from 'primeng/progressbar';
import {Tag} from 'primeng/tag';
import {Button} from 'primeng/button';

interface MiniGame {
    id: string;
    name: string;
    servers: number;
    startupTime: number;
    tps: {
        value: number;
        status: 'success' | 'warning' | 'danger';
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
        Button
    ],
    templateUrl: './minigame-list.component.html',
    styleUrl: 'minigame-list.component.scss',
    standalone: true
})
export class MinigameListComponent {

    tableSearch = '';
    selectedMiniGame: MiniGame | null = null;

    minigames: MiniGame[] = [
        {
            id: 'TW01',
            name: 'The Tower',
            servers: 3,
            startupTime: 12,
            tps: {
                value: 19.8,
                status: 'success'
            },
            resources: {
                ram: '1.2 GB',
                ramUsage: 60,
                cpu: 15
            },
            players: 42,
            color: 'blue'
        },
        {
            id: 'CR02',
            name: 'CrazyRace',
            servers: 4,
            startupTime: 8,
            tps: {
                value: 19.5,
                status: 'success'
            },
            resources: {
                ram: '1.8 GB',
                ramUsage: 75,
                cpu: 25
            },
            players: 67,
            color: 'lime'
        },
        {
            id: 'DB03',
            name: 'Dodgeball',
            servers: 2,
            startupTime: 6,
            tps: {
                value: 18.2,
                status: 'warning'
            },
            resources: {
                ram: '1.0 GB',
                ramUsage: 50,
                cpu: 20
            },
            players: 28,
            color: 'indigo'
        },
        {
            id: 'AR04',
            name: 'Arrows',
            servers: 2,
            startupTime: 5,
            tps: {
                value: 19.9,
                status: 'success'
            },
            resources: {
                ram: '0.8 GB',
                ramUsage: 40,
                cpu: 12
            },
            players: 24,
            color: 'rose'
        },
        {
            id: 'PB05',
            name: 'Parkour Battle',
            servers: 3,
            startupTime: 10,
            tps: {
                value: 16.4,
                status: 'danger'
            },
            resources: {
                ram: '2.1 GB',
                ramUsage: 85,
                cpu: 45
            },
            players: 55,
            color: 'violet'
        },
        {
            id: 'PRV06',
            name: 'Poule Renard Vipère',
            servers: 2,
            startupTime: 9,
            tps: {
                value: 19.2,
                status: 'success'
            },
            resources: {
                ram: '1.5 GB',
                ramUsage: 65,
                cpu: 22
            },
            players: 36,
            color: 'cyan'
        }
    ];

}
