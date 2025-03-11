import {Component} from '@angular/core';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {InputText} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {Avatar} from 'primeng/avatar';
import {Tag} from 'primeng/tag';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-minigames-list-widget',
  imports: [
    IconField,
    InputIcon,
    InputText,
    FormsModule,
    Button,
    TableModule,
    Avatar,
    Tag,
  ],
  templateUrl: './minigames-list-widget.component.html',
  standalone: true,
  host: {
    class: 'w-full overflow-auto'
  },
  styles: `
        :host ::ng-deep {
            .p-datatable {
                .p-datatable-thead > tr th {
                    background: transparent;
                }

                .p-datatable-tbody > tr {
                    background: transparent;
                }

                .p-datatable-tbody > tr.p-datatable-row-selected > td,
                .p-datatable-tbody > tr:has(+ .p-datatable-row-selected) > td {
                    border-bottom-color: var(--p-datatable-body-cell-border-color);
                }

                .p-paginator {
                    background: transparent;
                }
            }
        }
    `
})
export class MinigamesListWidgetComponent {

  tableSearch = '';

  history = [
    {
      id: '#1260',
      date: 'May 5th, 2024',
      name: {
        value: 'Jerome Bell',
        bgColor: 'lime',
        capName: 'JB'
      },
      templateName: 'Apollo',
      emailAddress: 'jeromebell@gmail.com',
      process: 'paid',
      revenue: '$59'
    },
    {
      id: '#1259',
      date: 'Mar 17th, 2024',
      name: {
        value: 'Annette Black',
        bgColor: 'indigo',
        capName: 'AB'
      },
      templateName: 'Verona',
      emailAddress: 'hi@annetteblack.com',
      process: 'paid',
      revenue: '$59'
    },
    {
      id: '#1258',
      date: 'May 24th, 2024',
      name: {
        value: 'Onyama Limba',
        bgColor: 'rose',
        capName: 'OL'
      },
      templateName: 'Freya',
      emailAddress: 'hi@onyamalimba.co',
      process: 'paid',
      revenue: '$59'
    },
    {
      id: '#1257',
      date: 'Jun 28th, 2024',
      name: {
        value: 'Courtney Henry',
        bgColor: 'violet',
        capName: 'CH'
      },
      templateName: 'Sakai',
      emailAddress: 'hi@courtneyhenry.com',
      process: 'free',
      revenue: null
    },
    {
      id: '#1256',
      date: 'Jul 21th, 2024',
      name: {
        value: 'Dianne Russell',
        bgColor: 'cyan',
        capName: 'DR'
      },
      templateName: 'Ultima',
      emailAddress: 'hi@diannerussell.com',
      process: 'paid',
      revenue: '$59'
    },
    {
      id: '#1255',
      date: 'Jul 21th, 2024',
      name: {
        value: 'Amy Elsner',
        bgColor: 'yellow',
        capName: 'AE'
      },
      templateName: 'Sakai',
      emailAddress: 'hi@amyelsner.com',
      process: 'free',
      revenue: null
    },
    {
      id: '#1254',
      date: 'Jun 28th, 2024',
      name: {
        value: 'Arlene McCoy',
        bgColor: 'blue',
        capName: 'AM'
      },
      templateName: 'Altantis',
      emailAddress: 'hi@arlenemccoy.com',
      process: 'paid',
      revenue: '$59'
    },
    {
      id: '#1298',
      date: 'Jul 21th, 2024',
      name: {
        value: 'Amy Elsner',
        bgColor: 'yellow',
        capName: 'AE'
      },
      templateName: 'Sakai',
      emailAddress: 'hi@amyelsner.com',
      process: 'free',
      revenue: null
    },
    {
      id: '#1299',
      date: 'Jun 28th, 2024',
      name: {
        value: 'Arlene McCoy',
        bgColor: 'blue',
        capName: 'AM'
      },
      templateName: 'Altantis',
      emailAddress: 'hi@arlenemccoy.com',
      process: 'paid',
      revenue: '$59'
    }
  ];

  selectedHistory: any;
}
