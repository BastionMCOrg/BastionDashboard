import {Component} from '@angular/core';
import {StatsComponent} from '../stats/stats.component';
import {MinigameListComponent} from '../minigame/minigame-list/minigame-list.component';
import {Tab, TabList, TabPanel, TabPanels, Tabs} from 'primeng/tabs';
import {ServerListComponent} from '../../shared/server-list/server-list.component';

@Component({
    selector: 'app-dashboard',
    imports: [
        StatsComponent,
        MinigameListComponent,
        Tabs,
        TabList,
        Tab,
        TabPanels,
        TabPanel,
        ServerListComponent
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    standalone: true,
})
export class DashboardComponent {

}
