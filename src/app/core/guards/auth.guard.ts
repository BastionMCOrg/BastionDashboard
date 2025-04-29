import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        const currentUser = this.authService.currentUserValue;

        if (currentUser) {
            // Vérifier les permissions requises s'il y en a
            const requiredPermissions = route.data['permissions'] as string[] || [];

            if (requiredPermissions.length > 0 && !this.authService.hasPermissions(requiredPermissions)) {
                // Rediriger vers une page d'accès refusé ou le tableau de bord
                this.router.navigate(['/']);
                return false;
            }

            // L'utilisateur est connecté et a les permissions requises
            return true;
        }

        // L'utilisateur n'est pas connecté, rediriger vers la page de connexion
        // avec l'URL actuelle comme paramètre de retour
        this.router.navigate(['/login'], {
            queryParams: { returnUrl: state.url }
        });
        return false;
    }
}
