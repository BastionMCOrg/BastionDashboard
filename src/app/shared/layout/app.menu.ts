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
                <li app-menuitem *ngIf="!item.separator && (!item.permissions || item.permissions.length === 0)"
                    [item]="item" [index]="i" [root]="true"></li>
                <li app-menuitem *ngIf="!item.separator && item.permissions && item.permissions.length > 0"
                    [item]="item" [index]="i" [root]="true"></li>
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
            label: 'Administration',
            icon: 'pi pi-cog',
            permissions: ['admin', 'manage_users'],
            items: [
                {
                    label: 'Utilisateurs',
                    icon: 'pi pi-fw pi-users',
                    routerLink: ['/users'],
                    permissions: ['admin', 'manage_users']
                }
            ]
        },
        {separator: true},
        {
            label: 'Mon compte',
            icon: 'pi pi-user',
            items: [
                {
                    label: 'Mon profil',
                    icon: 'pi pi-fw pi-user-edit',
                    routerLink: ['/profile']
                }
            ]
        }
    ]
}
