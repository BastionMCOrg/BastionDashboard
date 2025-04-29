import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AvatarModule } from 'primeng/avatar';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService, User } from '../../../core/services/auth.service';
import { getInitials } from '../../../core/utils/dashboard.utils';
import {Severity} from '../../../core/models/utils.model';

interface PermissionOption {
    value: string;
    label: string;
    description: string;
    severity: Severity;
}

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        CardModule,
        TooltipModule,
        InputTextModule,
        ProgressSpinnerModule,
        AvatarModule,
        PasswordModule,
        DividerModule,
        TagModule,
        ToastModule
    ],
    templateUrl: './user-profile.component.html',
    providers: [MessageService]
})
export class UserProfileComponent implements OnInit {
    currentUser: User | null = null;
    loading = false;
    updatingUsername = false;
    updatingPassword = false;

    // Formulaires
    usernameForm!: FormGroup;
    passwordForm!: FormGroup;

    // Permissions
    availablePermissions: PermissionOption[] = [
        { value: 'admin', label: 'Administrateur', description: 'Accès complet à toutes les fonctionnalités', severity: 'danger' },
        { value: 'manage_servers', label: 'Gestion des serveurs', description: 'Peut gérer les serveurs', severity: 'warn' },
        { value: 'manage_minigames', label: 'Gestion des mini-jeux', description: 'Peut gérer les mini-jeux', severity: 'warn' },
        { value: 'manage_users', label: 'Gestion des utilisateurs', description: 'Peut gérer les utilisateurs', severity: 'warn' },
        { value: 'view_logs', label: 'Voir les logs', description: 'Peut consulter les logs des serveurs', severity: 'info' },
        { value: 'execute_rcon', label: 'Exécuter RCON', description: 'Peut exécuter des commandes RCON', severity: 'info' }
    ];

    // Helper functions
    getInitials = getInitials;

    constructor(
        private authService: AuthService,
        private fb: FormBuilder,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.initForms();
        this.loadUserProfile();
    }

    /**
     * Initialise les formulaires
     */
    initForms(): void {
        // Formulaire de modification du nom d'utilisateur
        this.usernameForm = this.fb.group({
            username: ['', [Validators.required]]
        });

        // Formulaire de modification du mot de passe
        this.passwordForm = this.fb.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    /**
     * Valide que le nouveau mot de passe et sa confirmation correspondent
     */
    passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
        const newPassword = form.get('newPassword')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;

        if (newPassword !== confirmPassword) {
            return { 'passwordMismatch': true };
        }

        return null;
    }

    /**
     * Charge le profil de l'utilisateur courant
     */
    async loadUserProfile(): Promise<void> {
        this.loading = true;
        try {
            const userInfo = await this.authService.getUserInfo();
            if (userInfo) {
                this.currentUser = userInfo;
                this.usernameForm.patchValue({ username: userInfo.username });
            }
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger les informations utilisateur'
            });
        } finally {
            this.loading = false;
        }
    }

    /**
     * Met à jour le nom d'utilisateur
     */
    async updateUsername(): Promise<void> {
        if (this.usernameForm.invalid) {
            this.usernameForm.markAllAsTouched();
            return;
        }

        const { username } = this.usernameForm.value;

        // Ne rien faire si le nom d'utilisateur n'a pas changé
        if (username === this.currentUser?.username) {
            return;
        }

        this.updatingUsername = true;
        try {
            await this.authService.changeUsername(username);
            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Votre nom d\'utilisateur a été mis à jour'
            });
            await this.loadUserProfile();
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Impossible de mettre à jour le nom d'utilisateur: ${error instanceof Error ? error.message : String(error)}`
            });
        } finally {
            this.updatingUsername = false;
        }
    }

    /**
     * Met à jour le mot de passe
     */
    async updatePassword(): Promise<void> {
        if (this.passwordForm.invalid) {
            this.passwordForm.markAllAsTouched();
            return;
        }

        const { currentPassword, newPassword } = this.passwordForm.value;

        this.updatingPassword = true;
        try {
            await this.authService.changePassword(currentPassword, newPassword);
            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Votre mot de passe a été mis à jour'
            });
            this.passwordForm.reset();
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Impossible de mettre à jour le mot de passe: ${error instanceof Error ? error.message : String(error)}`
            });
        } finally {
            this.updatingPassword = false;
        }
    }

    /**
     * Récupère le libellé d'une permission
     */
    getPermissionLabel(permission: string): string {
        const found = this.availablePermissions.find(p => p.value === permission);
        return found ? found.label : permission;
    }

    /**
     * Récupère la description d'une permission
     */
    getPermissionDescription(permission: string): string {
        const found = this.availablePermissions.find(p => p.value === permission);
        return found ? found.description : '';
    }

    /**
     * Récupère la sévérité d'une permission pour l'affichage
     */
    getPermissionSeverity(permission: string): Severity {
        const found = this.availablePermissions.find(p => p.value === permission);
        return found ? found.severity : 'info';
    }

    protected readonly Date = Date;
}
