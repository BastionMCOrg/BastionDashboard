import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputTextModule, CheckboxModule, RouterLink, ToastModule],
    templateUrl: './login.component.html',
    providers: [MessageService]
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    currentYear: number = new Date().getFullYear();
    loading = false;
    returnUrl: string = '/dashboard';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService
    ) {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]],
            remember: [false]
        });
    }

    ngOnInit() {
        // Récupérer l'URL de retour des paramètres de requête ou utiliser la valeur par défaut
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

        // Vérifier si l'utilisateur est déjà connecté
        if (this.authService.currentUserValue) {
            this.router.navigate([this.returnUrl]);
        }
    }

    async onSubmit() {
        if (this.loginForm.invalid) {
            // Marquer tous les champs comme touchés pour afficher les erreurs
            Object.keys(this.loginForm.controls).forEach(key => {
                const control = this.loginForm.get(key);
                control?.markAsTouched();
            });
            return;
        }

        this.loading = true;

        try {
            const { username, password, remember } = this.loginForm.value;

            const response = await this.authService.login(username, password);

            if (response.success) {
                // Stockage persistant du refresh token si "se souvenir de moi" est activé
                if (remember) {
                    localStorage.setItem('remember_token', 'true');
                } else {
                    localStorage.removeItem('remember_token');
                }

                // Rediriger vers l'URL d'origine ou le tableau de bord
                await this.router.navigateByUrl(this.returnUrl);
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: response.message || 'Échec de la connexion'
                });
            }
        } catch (error: any) {
            console.error('Erreur de connexion:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: error.response?.data?.message || 'Une erreur est survenue lors de la connexion'
            });
        } finally {
            this.loading = false;
        }
    }
}
