import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
import { CheckboxModule } from 'primeng/checkbox';

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
        CheckboxModule, // Correction: import CheckboxModule au lieu de Checkbox
    ]
})
export class MinigameEditComponent implements OnInit, OnChanges {
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
        // Création initiale du formulaire vide
        this.createForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Si le minigame change, réinitialiser le formulaire
        if (changes['minigame'] && this.minigame) {
            console.log('Minigame reçu dans ngOnChanges:', this.minigame);
            // Si le formulaire existe déjà, le réinitialiser
            if (this.minigameForm) {
                this.resetForm();
            } else {
                // Sinon, créer le formulaire
                this.createForm();
            }
        }

        // Si la visibilité change et que le dialogue devient visible
        if (changes['visible'] && this.visible && this.minigame) {
            console.log('Dialogue ouvert avec minigame:', this.minigame);
            // Actualiser le formulaire quand le dialogue devient visible
            this.resetForm();
        }
    }

    // Création initiale du formulaire
    createForm(): void {
        this.minigameForm = this.fb.group({
            // Informations de base
            displayName: ['', Validators.required],
            name: [{value: '', disabled: true}],
            enabled: [true],
            description: [''],
            developerNames: this.fb.array([]),

            // Configuration du jeu
            gameSettings: this.fb.group({
                minimalInstanceCount: [0, [Validators.min(0)]],
                maxPlayers: [16, [Validators.required, Validators.min(1)]],
                minPlayers: [2, [Validators.required, Validators.min(1)]]
            }),

            // Configuration technique
            serverSettings: this.fb.group({
                memory: ['2G', [Validators.required, Validators.pattern(/^\d+[GM]$/)]],
                cpu: ['1', [Validators.required, Validators.min(1)]]
            }),

            // Configuration Docker
            dockerSettings: this.fb.group({
                env: this.fb.array([])
            }),

            // Type de serveur et configuration permanente
            serverType: [ServerType.MINIGAME, Validators.required],
            isPermanent: [false]
        });

        // Setup des écouteurs de changement de valeur
        this.setupValueChanges();
    }

    // Réinitialisation du formulaire avec les valeurs du minigame
    resetForm(): void {
        if (!this.minigame) return;

        console.log('Réinitialisation du formulaire avec:', this.minigame);

        // Récupérer les valeurs existantes du mini-jeu
        const initialName = this.minigame?.name || '';
        const initialKey = this.minigame?.key || '';

        // Déterminer le type de serveur initial
        let initialServerType = ServerType.MINIGAME;
        if (this.minigame?.serverType) {
            if (this.minigame.serverType.isLobby) initialServerType = ServerType.LOBBY;
            else if (this.minigame.serverType.isProxy) initialServerType = ServerType.PROXY;
        }

        // Mettre à jour les valeurs du formulaire
        const formControls = this.minigameForm.controls;

        // Informations de base
        formControls['displayName'].setValue(initialName);
        formControls['name'].setValue(initialKey);
        formControls['enabled'].setValue(this.minigame?.enabled ?? true);
        formControls['description'].setValue(this.minigame?.description || '');

        // Réinitialiser le tableau des développeurs
        this.initDeveloperNames();

        // Configuration du jeu
        const gameSettingsGroup = this.minigameForm.get('gameSettings') as FormGroup;
        gameSettingsGroup.get('minimalInstanceCount')?.setValue(this.minigame?.gameSettings?.minimalInstanceCount || 0);
        gameSettingsGroup.get('maxPlayers')?.setValue(this.minigame?.gameSettings?.maxPlayers || 16);
        gameSettingsGroup.get('minPlayers')?.setValue(this.minigame?.gameSettings?.minPlayers || 2);

        // Configuration technique
        const serverSettingsGroup = this.minigameForm.get('serverSettings') as FormGroup;
        serverSettingsGroup.get('memory')?.setValue(this.minigame?.serverSettings?.memory || '2G');
        serverSettingsGroup.get('cpu')?.setValue(this.minigame?.serverSettings?.cpu || '1');

        // Réinitialiser les variables d'environnement
        this.initEnvVars();

        // Type de serveur et configuration permanente
        formControls['serverType'].setValue(initialServerType);
        formControls['isPermanent'].setValue(this.minigame?.serverType?.isPermanent || false);
    }

    // Configurer les écouteurs de changements de valeur
    setupValueChanges(): void {
        this.minigameForm.get('displayName')?.valueChanges.subscribe(displayName => {
            if (displayName) {
                const slug = this.generateSlug(displayName);
                this.minigameForm.get('name')?.setValue(slug);
            }
        });

        this.minigameForm.get('isPermanent')?.valueChanges.subscribe(isPermanent => {
            this.validateMinimalInstanceCount();
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
        // Vider le tableau existant
        while (this.developerNames.length > 0) {
            this.developerNames.removeAt(0);
        }

        const devNames = this.minigame?.developerNames || [];
        if (devNames.length === 0) {
            this.addDeveloperName();
            return;
        }

        // Ajouter les nouveaux contrôles
        devNames.forEach((name: string) => {
            this.developerNames.push(new FormControl(name, Validators.required));
        });
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
        // Vider le tableau existant
        while (this.envVars.length > 0) {
            this.envVars.removeAt(0);
        }

        const envVars = this.minigame?.dockerSettings?.env || [];

        // Ajouter les nouveaux groupes
        envVars.forEach((env: { key: string; value: string; }) => {
            this.envVars.push(this.fb.group({
                key: [env.key, Validators.required],
                value: [env.value, Validators.required]
            }));
        });

        // S'il n'y a pas de variables d'environnement, ajouter une ligne vide
        if (envVars.length === 0) {
            this.addEnvVar();
        }
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
            // Utiliser la méthode intégrée d'Angular
            this.minigameForm.markAllAsTouched();
            return;
        }

        const formValue = {...this.minigameForm.getRawValue()};

        // Assurons-nous que les données sont formatées correctement pour l'API
        // Renommer displayName en name pour la cohérence avec le backend
        formValue.name = formValue.displayName;
        delete formValue.displayName;

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

        // Conserve l'ID original du minigame si présent
        if (this.minigame?._id) {
            formValue._id = this.minigame._id;
        }

        // Conserver la clé originale
        formValue.key = this.minigame?.key || formValue.name;

        console.log('Formulaire soumis:', formValue);
        this.saveMinigame.emit(formValue);
        this.visibleChange.emit(false);
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
