import {Routes} from '@angular/router';
import {AppLayout} from './shared/layout/app.layout';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {ServerDetailComponent} from './pages/dashboard/server-detail/server-detail.component';

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
