import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import {Select} from 'primeng/select';

enum ServerType {
    MINIGAME = 'MINIGAME',
    LOBBY = 'LOBBY',
    PROXY = 'PROXY'
}

@Component({
    selector: 'app-minigame-edit',
    templateUrl: './minigame-edit.component.html',
    styleUrls: ['./minigame-edit.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        InputNumberModule,
        DropdownModule,
        TableModule,
        TooltipModule,
        DividerModule,
        MessagesModule,
        MessageModule,
        TextareaModule,
        Select
    ]
})
export class MinigameEditComponent implements OnInit {
    @Input() visible: boolean = false;
    @Input() minigame: any;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() saveMinigame = new EventEmitter<any>();

    minigameForm!: FormGroup;

    serverTypeOptions = [
        { label: 'Mini-jeu', value: ServerType.MINIGAME },
        { label: 'Lobby', value: ServerType.LOBBY },
        { label: 'Proxy', value: ServerType.PROXY }
    ];

    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
        this.initForm();
    }

    initForm(): void {
        const initialName = this.minigame?.name || '';
        const initialDisplayName = this.minigame?.displayName || '';

        // Déterminer le type de serveur initial
        let initialServerType = ServerType.MINIGAME;
        if (this.minigame?.serverType) {
            if (this.minigame.serverType.isLobby) initialServerType = ServerType.LOBBY;
            else if (this.minigame.serverType.isProxy) initialServerType = ServerType.PROXY;
        }

        this.minigameForm = this.fb.group({
            // Informations de base
            displayName: [initialDisplayName, Validators.required],
            name: [{value: initialName, disabled: true}],
            enabled: [this.minigame?.enabled ?? true],
            description: [this.minigame?.description || ''],
            developerNames: this.fb.array([]),

            // Configuration du jeu
            gameSettings: this.fb.group({
                minimalInstanceCount: [this.minigame?.gameSettings?.minimalInstanceCount || 0, [Validators.min(0)]],
                maxPlayers: [this.minigame?.gameSettings?.maxPlayers || 16, [Validators.required, Validators.min(1)]],
                minPlayers: [this.minigame?.gameSettings?.minPlayers || 2, [Validators.required, Validators.min(1)]]
            }),

            // Configuration technique
            serverSettings: this.fb.group({
                memory: [this.minigame?.serverSettings?.memory || '2G', [Validators.required, Validators.pattern(/^\d+[GM]$/)]],
                cpu: [this.minigame?.serverSettings?.cpu || '1', [Validators.required, Validators.min(1)]]
            }),

            // Configuration Docker
            dockerSettings: this.fb.group({
                env: this.fb.array([])
            }),

            // Type de serveur (en tant qu'option unique)
            serverType: [initialServerType, Validators.required],
            isPermanent: [this.minigame?.serverType?.isPermanent || false]
        });

        // Initialisation des tableaux
        this.initDeveloperNames();
        this.initEnvVars();

        // Mise à jour dynamique du slug basé sur le nom d'affichage
        this.minigameForm.get('displayName')?.valueChanges.subscribe(displayName => {
            if (displayName) {
                const slug = this.generateSlug(displayName);
                this.minigameForm.get('name')?.setValue(slug);
            }
        });
    }

    // Génère un slug à partir du nom d'affichage
    generateSlug(text: string): string {
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD') // Normaliser les accents
            .replace(/[\u0300-\u036f]/g, '') // Supprimer les diacritiques
            .replace(/[^a-z0-9\s-]/g, '') // Conserver uniquement les lettres, chiffres, tirets et espaces
            .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
            .replace(/-+/g, '-') // Éviter les tirets multiples
            .trim(); // Supprimer les espaces au début et à la fin
    }

    // Gestion des développeurs
    get developerNames(): FormArray {
        return this.minigameForm.get('developerNames') as FormArray;
    }

    initDeveloperNames(): void {
        const devNames = this.minigame?.developerNames || [];
        if (devNames.length === 0) {
            this.addDeveloperName();
            return;
        }

        // Optimisation: créer tous les FormControl en une seule fois
        const controls = devNames.map((name: any) =>
            new FormControl(name, Validators.required)
        );

        const formArray = this.fb.array(controls);
        this.minigameForm.setControl('developerNames', formArray);
    }

    addDeveloperName(): void {
        this.developerNames.push(new FormControl('', Validators.required));
    }

    removeDeveloperName(index: number): void {
        this.developerNames.removeAt(index);
    }

    // Gestion des variables d'environnement
    get envVars(): FormArray {
        return this.minigameForm.get('dockerSettings.env') as FormArray;
    }

    initEnvVars(): void {
        const envVars = this.minigame?.dockerSettings?.env || [];

        // Optimisation: créer tous les FormGroup en une seule fois
        const groups = envVars.map((env: { key: any; value: any; }) => this.fb.group({
            key: [env.key, Validators.required],
            value: [env.value, Validators.required]
        }));

        const formArray = this.fb.array(groups);
        this.minigameForm.setControl('dockerSettings.env', formArray);
    }

    addEnvVar(): void {
        this.envVars.push(this.fb.group({
            key: ['', Validators.required],
            value: ['', Validators.required]
        }));
    }

    removeEnvVar(index: number): void {
        this.envVars.removeAt(index);
    }

    onHide(): void {
        this.visibleChange.emit(false);
    }

    onSubmit(): void {
        if (this.minigameForm.invalid) {
            this.markFormGroupTouched(this.minigameForm);
            return;
        }

        const formValue = {...this.minigameForm.getRawValue()};

        // Convertir le type de serveur en structure attendue par l'API
        const serverTypeEnum = formValue.serverType;
        formValue.serverType = {
            isMinigame: serverTypeEnum === ServerType.MINIGAME,
            isLobby: serverTypeEnum === ServerType.LOBBY,
            isProxy: serverTypeEnum === ServerType.PROXY,
            isPermanent: formValue.isPermanent
        };

        // Supprimer la propriété isPermanent qui est maintenant intégrée dans serverType
        delete formValue.isPermanent;

        this.saveMinigame.emit(formValue);
        this.visibleChange.emit(false);
    }

    // Marque tous les champs comme touchés pour déclencher les validations
    markFormGroupTouched(formGroup: FormGroup): void {
        Object.values(formGroup.controls).forEach(control => {
            control.markAsTouched();

            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            } else if (control instanceof FormArray) {
                control.controls.forEach(arrayControl => {
                    if (arrayControl instanceof FormGroup) {
                        this.markFormGroupTouched(arrayControl);
                    } else {
                        arrayControl.markAsTouched();
                    }
                });
            }
        });
    }

    // Vérification si le minimalInstanceCount doit être >0
    validateMinimalInstanceCount(): void {
        const isPermanent = this.minigameForm.get('isPermanent')?.value;
        const minimalInstanceCount = this.minigameForm.get('gameSettings.minimalInstanceCount');

        if (isPermanent && minimalInstanceCount && minimalInstanceCount.value < 1) {
            minimalInstanceCount.setValue(1);
        }
    }
}
