import { Routes } from '@angular/router';
import { AppLayout } from './shared/layout/app.layout';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ServerDetailComponent } from './pages/dashboard/server-detail/server-detail.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './pages/auth/login/login.component';
import { UsersAdminComponent } from './pages/users/users-admin/users-admin.component';
import { UserProfileComponent } from './pages/users/user-profile/user-profile.component';

export const routes: Routes = [
    // Route de login - accessible uniquement si non connecté
    {
        path: 'login',
        component: LoginComponent,
    },
    // Routes protégées avec layout commun
    {
        path: '',
        component: AppLayout,
        canActivate: [AuthGuard], // Protection de toutes les routes internes
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
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
            {
                path: 'users',
                data: {
                    breadcrumb: 'Gestion des utilisateurs',
                    permissions: ['admin', 'manage_users'] // Protection par permission
                },
                component: UsersAdminComponent,
            },
            {
                path: 'profile',
                data: {
                    breadcrumb: 'Mon profil'
                },
                component: UserProfileComponent,
            }
        ]
    },
    // Redirection fallback
    { path: '**', redirectTo: '/login' }
];
