import {Component, Input} from '@angular/core';
import {Minigame} from '../../../core/models/minigame.model';
import {generateRandomData, ranges} from '../../../core/utils/utils';
import {Tag} from 'primeng/tag';
import {Select} from 'primeng/select';
import {FormsModule} from '@angular/forms';
import {LineChart} from '../../../shared/charts/linechart';

@Component({
    selector: 'app-stats-graph-tps',
    imports: [
        Tag,
        Select,
        FormsModule,
        LineChart
    ],
    templateUrl: './stats-graph-tps.component.html',
    standalone: true,
    styles: ``
})
export class StatsGraphTpsComponent {

    @Input() public minigame: Minigame = <any>{};

    protected tpsBgColor: string[] = ['rgba(21,128,61,0.1)', 'rgba(21,128,61,0)'];
    protected tpsBorderColor: string = 'rgb(21,128,61)';
    protected tpsDataset = generateRandomData('2023-10-27T00:00:00', '2024-11-03T00:00:00', 7, 17, 20);

    protected selectedRange = ranges[0];

    protected readonly ranges = ranges;

}
