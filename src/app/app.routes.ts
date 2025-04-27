import {Routes} from '@angular/router';
import {AppLayout} from './shared/layout/app.layout';
import {MinigameComponent} from './pages/minigame/minigame.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {ServerDetailComponent} from './pages/server-detail/server-detail.component';

export const routes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            {
                path: '',
                data: {
                    breadcrumb: 'Données générales'
                },
                component: DashboardComponent,
            },
            {
                path: 'minigames/:id',
                data: {
                    breadcrumb: 'Mini-jeux'
                },
                component: MinigameComponent,
            },
            {
                path: 'servers/:id',
                data: {
                    breadcrumb: 'Serveur'
                },
                component: ServerDetailComponent,
            },
            {path: '**', redirectTo: '/dashboard'}
        ]
    },
];
