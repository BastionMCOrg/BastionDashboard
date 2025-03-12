import {Component, Input} from '@angular/core';
import {Minigame} from '../../../core/models/minigame.model';
import {Card} from 'primeng/card';

@Component({
    selector: 'app-stats-active-servers',
    imports: [
        Card
    ],
    templateUrl: './stats-active-servers.component.html',
    standalone: true,
    styles: ``
})
export class StatsActiveServersComponent {

    @Input() public minigame: Minigame = <any>{};


}
