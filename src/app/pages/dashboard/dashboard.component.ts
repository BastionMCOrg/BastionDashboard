import {Component} from '@angular/core';
import {MinigamesListWidgetComponent} from './minigames-list-widget/minigames-list-widget.component';
import {ServerPerformanceWidgetComponent} from './server-performance-widget/server-performance-widget.component';
import {ServerStatsWidgetComponent} from './server-stats-widget/server-stats-widget.component';
import {ServerUptimeWidgetComponent} from './server-uptime-widget/server-uptime-widget.component';

@Component({
  selector: 'app-dashboard',
    imports: [
        MinigamesListWidgetComponent,
        ServerPerformanceWidgetComponent,
        ServerStatsWidgetComponent,
        ServerUptimeWidgetComponent
    ],
  templateUrl: './dashboard.component.html',
  standalone: true,
  styles: ``
})
export class DashboardComponent {

}
