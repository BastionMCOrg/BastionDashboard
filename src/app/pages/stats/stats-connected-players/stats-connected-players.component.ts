import {Component, Input} from '@angular/core';
import {Minigame} from '../../../core/models/minigame.model';
import {Card} from 'primeng/card';

@Component({
    selector: 'app-stats-connected-players',
    imports: [
        Card
    ],
    templateUrl: './stats-connected-players.component.html',
    standalone: true,
    styles: ``
})
export class StatsConnectedPlayersComponent {

    @Input() public minigame: Minigame = <any>{};

}
