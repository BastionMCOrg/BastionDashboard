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
            label: 'Infrastructure',
            icon: 'pi pi-server',
            permissions: ['admin', 'manage_servers'],
            items: [
                {
                    label: 'Proxy Velocity',
                    icon: 'pi pi-fw pi-forward',
                    routerLink: ['/services', 'velocity'],
                    permissions: ['admin', 'manage_servers']
                },
                {
                    label: 'Hub',
                    icon: 'pi pi-fw pi-globe',
                    routerLink: ['/services', 'hub'],
                    permissions: ['admin', 'manage_servers']
                },
                {
                    label: 'Build',
                    icon: 'pi pi-fw pi-building',
                    routerLink: ['/services', 'build'],
                    permissions: ['admin', 'manage_servers']
                },
                {
                    label: 'Dev Mathis',
                    icon: 'pi pi-fw pi-code',
                    routerLink: ['/services', 'dev_mathis'],
                    permissions: ['admin', 'manage_servers']
                },
                {
                    label: 'MongoDB',
                    icon: 'pi pi-fw pi-database',
                    routerLink: ['/services', 'mongodb'],
                    permissions: ['admin', 'manage_servers']
                },
                {
                    label: 'Redis',
                    icon: 'pi pi-fw pi-database',
                    routerLink: ['/services', 'redis'],
                    permissions: ['admin', 'manage_servers']
                },
                {
                    label: 'RabbitMQ',
                    icon: 'pi pi-fw pi-send',
                    routerLink: ['/services', 'rabbitmq'],
                    permissions: ['admin', 'manage_servers']
                },

                {
                    label: 'REST API',
                    icon: 'pi pi-fw pi-server',
                    routerLink: ['/services', 'rest'],
                    permissions: ['admin', 'manage_servers']
                },
                {
                    label: 'Bastion gRPC',
                    icon: 'pi pi-fw pi-sitemap',
                    routerLink: ['/services', 'bastion-grpc'],
                    permissions: ['admin', 'manage_servers']
                },
                {
                    label: 'Reverse Proxy',
                    icon: 'pi pi-fw pi-directions',
                    routerLink: ['/services', 'reverseproxy'],
                    permissions: ['admin', 'manage_servers']
                },
                {
                    label: 'Discord Bot',
                    icon: 'pi pi-fw pi-discord',
                    routerLink: ['/services', 'discord'],
                    permissions: ['admin', 'manage_servers']
                }
            ]
        }, {
            separator: true
        }, {
            label: 'Administration',
            icon:
                'pi pi-cog',
            permissions:
                ['admin', 'manage_users'],
            items:
                [
                    {
                        label: 'Utilisateurs',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/users'],
                        permissions: ['admin', 'manage_users']
                    }
                ]
        }, {
            separator: true
        }, {
            label: 'Mon compte',
            icon:
                'pi pi-user',
            items:
                [
                    {
                        label: 'Mon profil',
                        icon: 'pi pi-fw pi-user-edit',
                        routerLink: ['/profile']
                    }
                ]
        }
    ]
}
