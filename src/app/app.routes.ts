import {Routes} from '@angular/router';
import {AppLayout} from './shared/layout/app.layout';
import {DashboardComponent} from './pages/dashboard/dashboard.component';

export const routes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            {
                data: {
                    breadcrumb: 'Données générales'
                },
                path: '',
                component: DashboardComponent
                //loadComponent: () => import('./pages/dashboard/marketingdashboard').then(m => m.MarketingDashboard),
            }
        ]
    }
];
