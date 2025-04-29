import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { User } from './auth.service';

export interface UserUpdateRequest {
    username?: string;
    permissions?: string[];
    password?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private apiService: ApiService) {}

    /**
     * Récupère la liste de tous les utilisateurs
     */
    public async getUsers(): Promise<User[]> {
        try {
            const response = await this.apiService.get<{ success: boolean, users: User[] }>('/auth/users');
            return response.users;
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            throw error;
        }
    }

    /**
     * Crée un nouvel utilisateur
     */
    public async createUser(username: string, password: string, permissions: string[] = []): Promise<User> {
        try {
            const response = await this.apiService.post<{ success: boolean, user: User, message: string }>('/auth/users', {
                username,
                password,
                permissions
            });
            return response.user;
        } catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur:', error);
            throw error;
        }
    }

    /**
     * Met à jour les permissions d'un utilisateur
     */
    public async updatePermissions(userId: string, permissions: string[]): Promise<User> {
        try {
            const response = await this.apiService.put<{ success: boolean, user: User, message: string }>(
                `/auth/users/${userId}/permissions`,
                { permissions }
            );
            return response.user;
        } catch (error) {
            console.error('Erreur lors de la mise à jour des permissions:', error);
            throw error;
        }
    }

    /**
     * Supprime un utilisateur
     */
    public async deleteUser(userId: string): Promise<{ success: boolean, message: string }> {
        try {
            return await this.apiService.delete<{ success: boolean, message: string }>(`/auth/users/${userId}`);
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur:', error);
            throw error;
        }
    }

    /**
     * Réinitialise le mot de passe d'un utilisateur (admin uniquement)
     */
    public async resetPassword(userId: string, newPassword: string): Promise<{ success: boolean, message: string }> {
        try {
            return await this.apiService.put<{ success: boolean, message: string }>(
                `/auth/users/${userId}/password`,
                { newPassword }
            );
        } catch (error) {
            console.error('Erreur lors de la réinitialisation du mot de passe:', error);
            throw error;
        }
    }

    /**
     * Met à jour les informations d'un utilisateur (admin uniquement)
     */
    public async updateUser(userId: string, updateData: UserUpdateRequest): Promise<User> {
        try {
            const response = await this.apiService.put<{ success: boolean, user: User, message: string }>(
                `/auth/users/${userId}`,
                updateData
            );
            return response.user;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
            throw error;
        }
    }
}
