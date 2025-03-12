import {Component, Input} from '@angular/core';
import {Minigame} from '../../../core/models/minigame.model';
import {Card} from 'primeng/card';

@Component({
    selector: 'app-stats-tps-performance',
    imports: [
        Card
    ],
    templateUrl: './stats-tps-performance.component.html',
    standalone: true,
    styles: ``
})
export class StatsTpsPerformanceComponent {

    @Input() public minigame: Minigame = <any>{};


}
