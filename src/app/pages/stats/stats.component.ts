import { Component } from '@angular/core';
import {Minigame} from '../../core/models/minigame.model';
import {StatsActiveServersComponent} from './stats-active-servers/stats-active-servers.component';
import {StatsConnectedPlayersComponent} from './stats-connected-players/stats-connected-players.component';
import {StatsTpsPerformanceComponent} from './stats-tps-performance/stats-tps-performance.component';
import {StatsGraphTpsComponent} from './stats-graph-tps/stats-graph-tps.component';
import {StatsGraphRamComponent} from './stats-graph-ram/stats-graph-ram.component';
import {StatsGraphCpuComponent} from './stats-graph-cpu/stats-graph-cpu.component';

@Component({
    selector: 'app-stats',
    imports: [
        StatsActiveServersComponent,
        StatsConnectedPlayersComponent,
        StatsTpsPerformanceComponent,
        StatsGraphTpsComponent,
        StatsGraphRamComponent,
        StatsGraphCpuComponent,
        StatsActiveServersComponent
    ],
    templateUrl: './stats.component.html',
    standalone: true,
    styles: ``
})
export class StatsComponent {

    minigame: Minigame = {
        id: 'TW01',
        key: 'tower',
        name: 'The Tower',
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

}
