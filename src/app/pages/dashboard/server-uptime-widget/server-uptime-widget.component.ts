import {Component} from '@angular/core';
import {Select} from 'primeng/select';
import {FormsModule} from '@angular/forms';
import {Tag} from 'primeng/tag';
import {CustomMeter} from '../../../shared/charts/custommeter';
import {Button} from 'primeng/button';

@Component({
    selector: 'app-server-uptime-widget',
    imports: [
        Select,
        FormsModule,
        Tag,
        CustomMeter,
        Button
    ],
    templateUrl: './server-uptime-widget.component.html',
    standalone: true,
    host: {
        class: 'xl:w-auto w-full xl:pl-6 pt-6 xl:pt-0 min-w-80 flex flex-col justify-between gap-10'
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
export class ServerUptimeWidgetComponent {
    ranges = [
        {name: 'Weekly', code: 'wk'},
        {name: 'Monthly', code: 'mn'},
        {name: 'Yearly', code: 'yr'}
    ];

    selectedRange = {name: 'Weekly', code: 'wk'};

    meterValue = [
        {label: 'Followers', title: '17.243', colorClass: 'bg-surface-950 dark:bg-surface-0', value: 17243},
        {label: 'Unfollow-up', title: '2.757', colorClass: 'bg-surface-200 dark:bg-surface-800', value: 2757}
    ];
}
