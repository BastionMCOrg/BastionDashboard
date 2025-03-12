import { Component } from '@angular/core';
import {generateRandomMultiData} from '../../../core/utils/utils';
import {MultiLineChart} from '../../../shared/charts/multilinechart';
import {Select} from 'primeng/select';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-ram-cpu-stats',
    imports: [
        MultiLineChart,
        Select,
        FormsModule
    ],
  templateUrl: './ram-cpu-stats.component.html',
    host: {
        class: 'flex-1 xl:pr-6 pb-6 xl:pb-0 min-w-80 flex flex-col overflow-hidden'
    },
    styles: `
        :host ::ng-deep {
            .p-select {
                padding-right: 0.375rem;
                border-radius: 0.5rem;

                .p-select-label {
                    padding: 0.25rem 0.25rem 0.25rem 0.5rem;
                    font-weight: 500;
                    font-size: 0.875rem;
                    color: var(--text-surface-950);
                }

                .p-select-dropdown {
                    width: 0.75rem;

                    .p-select-dropdown-icon {
                        width: 0.75rem;
                        color: var(--text-surface-950);
                    }
                }

                .p-select-option {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
            }

            html.app-dark {
                .p-select {
                    .p-select-label {
                        color: var(--text-surface-0);
                    }

                    .p-select-dropdown-icon {
                        color: var(--text-surface-0);
                    }
                }
            }
        }
    `
})
export class RamCpuStatsComponent {

    ranges = [
        { name: 'Quotidien', unit: 'week' },
        { name: 'Hebdomadaire', unit: 'month' },
        { name: 'Mensuel', unit: 'quarter' },
        { name: 'Annuel', unit: 'year' }
    ];

    selectedRange = this.ranges[0];

    dataset = {
        cardData: {
            title: 'RAM/CPU Usage',
            description: 'Courbes de tendance de l\'utilisation de la RAM et du CPU'
        },
        currency: '%',
        labels: ['CPU', 'RAM'],
        datasets: generateRandomMultiData('2020-10-27T00:00:00', '2023-11-03T00:00:00', 4, 2000, 3000, 2, true),
        bgColors: [undefined, ['rgba(165,243,252,0.4)', 'rgba(165,243,252,0)']],
        borderColors: [undefined, 'rgb(8,145,178)']
    };

}
