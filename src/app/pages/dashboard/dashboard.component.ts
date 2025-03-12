import {Component} from '@angular/core';
import {GlobalStatsComponent} from './global-stats/global-stats.component';
import {RamCpuStatsComponent} from './ram-cpu-stats/ram-cpu-stats.component';
import {TpsStatsComponent} from './tps-stats/tps-stats.component';
import {MinigamesListComponent} from './minigames-list/minigames-list.component';

@Component({
    selector: 'app-dashboard',
    imports: [
        GlobalStatsComponent,
        RamCpuStatsComponent,
        TpsStatsComponent,
        MinigamesListComponent,
    ],
    templateUrl: './dashboard.component.html',
    styles: ``
})
export class DashboardComponent {

}
