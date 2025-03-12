import {Component, Input} from '@angular/core';
import {Minigame} from '../../../core/models/minigame.model';
import {generateRandomData, ranges} from '../../../core/utils/utils';
import {Tag} from 'primeng/tag';
import {Select} from 'primeng/select';
import {FormsModule} from '@angular/forms';
import {LineChart} from '../../../shared/charts/linechart';

@Component({
    selector: 'app-stats-graph-ram',
    imports: [
        Tag,
        Select,
        FormsModule,
        LineChart
    ],
    templateUrl: './stats-graph-ram.component.html',
    standalone: true,
    styles: ``
})
export class StatsGraphRamComponent {

    @Input() public minigame: Minigame = <any>{};

    protected ramBgColor: string[] = ['rgba(59,130,246,0.1)', 'rgba(59,130,246,0)'];
    protected ramBorderColor: string = 'rgb(59,130,246)';
    protected ramDataset = generateRandomData('2023-10-27T00:00:00', '2024-11-03T00:00:00', 7, 45, 85);

    protected selectedRange = ranges[0];

    protected readonly ranges = ranges;

}
