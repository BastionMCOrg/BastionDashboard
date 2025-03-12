import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {AppMenuitem} from './app.menuitem';

@Component({
  selector: '[app-menu]',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `
    <ul class="layout-menu">
      <ng-container *ngFor="let item of model; let i = index">
        <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
        <li *ngIf="item.separator" class="menu-separator"></li>
      </ng-container>
    </ul> `
})
export class AppMenu {
  model: any[] = [
    {
      label: 'Dashboards',
      icon: 'pi pi-home',
      items: [
        {
          label: 'Accueil',
          icon: 'pi pi-fw pi-warehouse',
          routerLink: ['/']
        }
      ]
    },
    {separator: true},
    {
      label: 'Apps',
      icon: 'pi pi-th-large',
      items: [
        {
          label: 'The Tower',
          icon: 'pi pi-fw pi-comments',
          routerLink: ['/apps/chat']
        },
        {
          label: 'Dodgeball',
          icon: 'pi pi-fw pi-folder',
          routerLink: ['/apps/files']
        },
        {
          label: 'CrazyRace',
          icon: 'pi pi-fw pi-envelope',
          routerLink: ['/apps/mail']
        },
        {
          label: 'Arrows',
          icon: 'pi pi-fw pi-check-square',
          routerLink: ['/apps/tasklist']
        },
        {
          label: 'Parkour Battle',
          icon: 'pi pi-fw pi-check-square',
          routerLink: ['/apps/tasklist']
        },
        {
          label: 'Poule Renard Vipère',
          icon: 'pi pi-fw pi-check-square',
          routerLink: ['/apps/tasklist']
        }
      ]
    },
  ]
}
