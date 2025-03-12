import {Component, Input} from '@angular/core';
import {generateRandomData, ranges} from '../../../core/utils/utils';
import {Select} from 'primeng/select';
import {Tag} from 'primeng/tag';
import {FormsModule} from '@angular/forms';
import {LineChart} from '../../../shared/charts/linechart';
import {Minigame} from '../../../core/models/minigame.model';

@Component({
    selector: 'app-stats-graph-cpu',
    imports: [
        Select,
        Tag,
        FormsModule,
        LineChart
    ],
    templateUrl: './stats-graph-cpu.component.html',
    standalone: true,
    styles: ``
})
export class StatsGraphCpuComponent {

    @Input() public minigame: Minigame = <any>{};

    protected cpuBgColor: string[] = ['rgba(249,115,22,0.1)', 'rgba(249,115,22,0)'];
    protected cpuBorderColor: string = 'rgb(249,115,22)';
    protected cpuDataset = generateRandomData('2023-10-27T00:00:00', '2024-11-03T00:00:00', 7, 15, 45);

    protected selectedRange = ranges[0];

    protected readonly ranges = ranges;
}
