import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { User } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import {Severity} from '../../../core/models/utils.model';

interface PermissionOption {
    value: string;
    label: string;
    description: string;
    severity: Severity;
}

@Component({
    selector: 'app-users-admin',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        TableModule,
        TooltipModule,
        InputTextModule,
        ProgressSpinnerModule,
        DialogModule,
        CheckboxModule,
        PasswordModule,
        DividerModule,
        TagModule,
        ConfirmDialogModule,
        ToastModule
    ],
    templateUrl: './users-admin.component.html',
    providers: [ConfirmationService, MessageService]
})
export class UsersAdminComponent implements OnInit {
    // Liste des utilisateurs
    users: User[] = [];
    loading = false;
    submitting = false;

    // Utilisateur sélectionné pour les actions
    selectedUser: User | null = null;

    // Dialogues
    createUserDialogVisible = false;
    editPermissionsDialogVisible = false;
    editUserDialogVisible = false;
    resetPasswordDialogVisible = false;

    // Formulaires
    userForm!: FormGroup;
    editUserForm!: FormGroup;
    resetPasswordForm!: FormGroup;

    // Permissions
    selectedPermissions: { [key: string]: boolean } = {};
    availablePermissions: PermissionOption[] = [
        { value: 'admin', label: 'Administrateur', description: 'Accès complet à toutes les fonctionnalités', severity: 'danger' },
        { value: 'manage_servers', label: 'Gestion des serveurs', description: 'Peut gérer les serveurs', severity: 'warn' },
        { value: 'manage_minigames', label: 'Gestion des mini-jeux', description: 'Peut gérer les mini-jeux', severity: 'warn' },
        { value: 'manage_users', label: 'Gestion des utilisateurs', description: 'Peut gérer les utilisateurs', severity: 'warn' },
        { value: 'view_logs', label: 'Voir les logs', description: 'Peut consulter les logs des serveurs', severity: 'info' },
        { value: 'execute_rcon', label: 'Exécuter RCON', description: 'Peut exécuter des commandes RCON', severity: 'info' }
    ];

    constructor(
        private userService: UserService,
        private fb: FormBuilder,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.initForms();
        this.loadUsers();
    }

    /**
     * Initialise les formulaires
     */
    initForms(): void {
        // Formulaire de création d'utilisateur
        this.userForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            permissions: this.fb.array([])
        });

        // Formulaire de modification d'utilisateur
        this.editUserForm = this.fb.group({
            username: ['', [Validators.required]]
        });

        // Formulaire de réinitialisation de mot de passe
        this.resetPasswordForm = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    /**
     * Charge la liste des utilisateurs
     */
    async loadUsers(): Promise<void> {
        this.loading = true;
        try {
            this.users = await this.userService.getUsers();
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger les utilisateurs'
            });
        } finally {
            this.loading = false;
        }
    }

    /**
     * Affiche le dialogue de création d'utilisateur
     */
    showCreateUserDialog(): void {
        this.userForm.reset();
        this.createUserDialogVisible = true;
    }

    /**
     * Affiche le dialogue de modification des permissions
     */
    showEditPermissionsDialog(user: User): void {
        this.selectedUser = user;
        this.initSelectedPermissions(user.permissions);
        this.editPermissionsDialogVisible = true;
    }

    /**
     * Affiche le dialogue de modification d'utilisateur
     */
    showEditUserDialog(user: User): void {
        this.selectedUser = user;
        this.editUserForm.patchValue({
            username: user.username
        });
        this.editUserDialogVisible = true;
    }

    /**
     * Affiche le dialogue de réinitialisation de mot de passe
     */
    showResetPasswordDialog(user: User): void {
        this.selectedUser = user;
        this.resetPasswordForm.reset();
        this.resetPasswordDialogVisible = true;
    }

    /**
     * Confirme la suppression d'un utilisateur
     */
    confirmDeleteUser(user: User): void {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.username}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Non',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.deleteUser(user)
        });
    }

    /**
     * Supprime un utilisateur
     */
    async deleteUser(user: User): Promise<void> {
        try {
            await this.userService.deleteUser(user._id);
            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: `L'utilisateur "${user.username}" a été supprimé`
            });
            await this.loadUsers();
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Impossible de supprimer l'utilisateur: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    /**
     * Crée un nouvel utilisateur
     */
    async createUser(): Promise<void> {
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            return;
        }

        this.submitting = true;
        const { username, password } = this.userForm.value;
        const permissions = this.getSelectedPermissionsArray();

        try {
            await this.userService.createUser(username, password, permissions);
            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: `L'utilisateur "${username}" a été créé`
            });
            this.createUserDialogVisible = false;
            await this.loadUsers();
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Impossible de créer l'utilisateur: ${error instanceof Error ? error.message : String(error)}`
            });
        } finally {
            this.submitting = false;
        }
    }

    /**
     * Met à jour les permissions d'un utilisateur
     */
    async updatePermissions(): Promise<void> {
        if (!this.selectedUser) return;

        this.submitting = true;
        const permissions = Object.keys(this.selectedPermissions).filter(p => this.selectedPermissions[p]);

        try {
            await this.userService.updatePermissions(this.selectedUser._id, permissions);
            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: `Les permissions de "${this.selectedUser.username}" ont été mises à jour`
            });
            this.editPermissionsDialogVisible = false;
            await this.loadUsers();
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Impossible de mettre à jour les permissions: ${error instanceof Error ? error.message : String(error)}`
            });
        } finally {
            this.submitting = false;
        }
    }

    /**
     * Met à jour un utilisateur
     */
    async updateUser(): Promise<void> {
        if (!this.selectedUser || this.editUserForm.invalid) {
            this.editUserForm.markAllAsTouched();
            return;
        }

        this.submitting = true;
        const { username } = this.editUserForm.value;

        try {
            await this.userService.updateUser(this.selectedUser._id, { username });
            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: `L'utilisateur a été renommé en "${username}"`
            });
            this.editUserDialogVisible = false;
            await this.loadUsers();
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Impossible de mettre à jour l'utilisateur: ${error instanceof Error ? error.message : String(error)}`
            });
        } finally {
            this.submitting = false;
        }
    }

    /**
     * Réinitialise le mot de passe d'un utilisateur
     */
    async resetPassword(): Promise<void> {
        if (!this.selectedUser || this.resetPasswordForm.invalid) {
            this.resetPasswordForm.markAllAsTouched();
            return;
        }

        this.submitting = true;
        const { password } = this.resetPasswordForm.value;

        try {
            await this.userService.resetPassword(this.selectedUser._id, password);
            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: `Le mot de passe de "${this.selectedUser.username}" a été réinitialisé`
            });
            this.resetPasswordDialogVisible = false;
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Impossible de réinitialiser le mot de passe: ${error instanceof Error ? error.message : String(error)}`
            });
        } finally {
            this.submitting = false;
        }
    }

    /**
     * Gère le changement d'état d'une permission
     */
    onPermissionChange(event: any, permission: string): void {
        const permissionsArray = this.userForm.get('permissions') as FormArray;

        if (event.checked) {
            permissionsArray.push(new FormControl(permission));
        } else {
            const index = permissionsArray.controls.findIndex(control => control.value === permission);
            if (index !== -1) {
                permissionsArray.removeAt(index);
            }
        }
    }

    /**
     * Récupère un tableau des permissions sélectionnées
     */
    getSelectedPermissionsArray(): string[] {
        const permissionsArray = this.userForm.get('permissions') as FormArray;
        return permissionsArray.value;
    }

    /**
     * Initialise les permissions sélectionnées pour un utilisateur
     */
    initSelectedPermissions(permissions: string[]): void {
        this.selectedPermissions = {};
        this.availablePermissions.forEach(permission => {
            this.selectedPermissions[permission.value] = permissions.includes(permission.value);
        });
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
}
