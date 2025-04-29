import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

/**
 * Directive pour contrôler l'affichage des éléments selon les permissions utilisateur
 * Usage:
 * <div *hasPermission="'manage_servers'">Contenu visible uniquement avec la permission manage_servers</div>
 * <div *hasPermission="['manage_servers', 'manage_minigames']">Requiert toutes les permissions listées</div>
 */
@Directive({
    selector: '[hasPermission]',
    standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
    private hasView = false;
    private subscription?: Subscription;

    // Permissions requises (chaîne unique ou tableau de chaînes)
    @Input({ required: true }) set hasPermission(val: string | string[]) {
        this.permissions = Array.isArray(val) ? val : [val];
        this.updateView();
    }

    private permissions: string[] = [];

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        // Surveiller les changements d'utilisateur connecté
        this.subscription = this.authService.currentUser.subscribe(() => {
            this.updateView();
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private updateView(): void {
        const hasPermission = this.authService.hasPermissions(this.permissions);

        if (hasPermission && !this.hasView) {
            // Afficher le contenu
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else if (!hasPermission && this.hasView) {
            // Masquer le contenu
            this.viewContainer.clear();
            this.hasView = false;
        }
    }
}
