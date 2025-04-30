import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {InputTextModule} from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import {DropdownModule} from 'primeng/dropdown';
import {TableModule} from 'primeng/table';
import {TooltipModule} from 'primeng/tooltip';
import {DividerModule} from 'primeng/divider';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {TextareaModule} from 'primeng/textarea';
import {CheckboxModule} from 'primeng/checkbox';
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
        CheckboxModule,
        Select
    ]
})
export class MinigameEditComponent implements OnInit, OnChanges {
    @Input() visible: boolean = false;
    @Input() minigame: any;
    @Input() isCreateMode: boolean = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() saveMinigame = new EventEmitter<any>();

    public minigameForm!: FormGroup;
    public formSubmitting: boolean = false;

    public serverTypeOptions = [
        {label: 'Mini-jeu', value: ServerType.MINIGAME},
        {label: 'Lobby', value: ServerType.LOBBY},
        {label: 'Proxy', value: ServerType.PROXY}
    ];

    constructor(private fb: FormBuilder) {
    }

    // Gestion des développeurs
    public get developerNames(): FormArray {
        return this.minigameForm.get('developerNames') as FormArray;
    }

    // Gestion des variables d'environnement
    public get envVars(): FormArray {
        return this.minigameForm.get('dockerSettings.env') as FormArray;
    }

    public ngOnInit(): void {
        this.createForm();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && this.visible) {
            if (this.isCreateMode) {
                this.createForm();
            } else if (this.minigame) {
                this.resetForm();
            }
        }
    }

    public addDeveloperName(): void {
        this.developerNames.push(new FormControl(''));
    }

    public removeDeveloperName(index: number): void {
        if (this.developerNames.length > 1) {
            this.developerNames.removeAt(index);
        }
    }

    public addEnvVar(): void {
        this.envVars.push(this.fb.group({
            key: [''],
            value: ['']
        }));
    }

    public removeEnvVar(index: number): void {
        this.envVars.removeAt(index);
    }

    public onHide(): void {
        this.visibleChange.emit(false);
    }

    public onSubmit(): void {
        // Récupérer les valeurs du formulaire
        const formValue = {...this.minigameForm.getRawValue()};

        // Formatage pour l'API
        formValue.key = formValue.name;
        formValue.name = formValue.displayName;
        delete formValue.displayName;

        // Type de serveur
        const serverTypeEnum = formValue.serverType;
        formValue.serverType = {
            isMinigame: serverTypeEnum === ServerType.MINIGAME,
            isLobby: serverTypeEnum === ServerType.LOBBY,
            isProxy: serverTypeEnum === ServerType.PROXY,
            isPermanent: formValue.isPermanent
        };
        delete formValue.isPermanent;

        // ID pour l'édition
        if (!this.isCreateMode && this.minigame?._id) {
            formValue._id = this.minigame._id;
        }

        // Émission de l'événement
        this.saveMinigame.emit({
            data: formValue,
            isCreateMode: this.isCreateMode
        });

        // Fermeture du dialogue
        this.visibleChange.emit(false);
    }

    private createForm(): void {
        this.minigameForm = this.fb.group({
            displayName: ['', Validators.required],
            name: [{value: '', disabled: true}],
            enabled: [true],
            description: [''],
            developerNames: this.fb.array([this.fb.control('', Validators.required)]),
            gameSettings: this.fb.group({
                minimalInstanceCount: [0],
                maxPlayers: [16],
                minPlayers: [2]
            }),
            serverSettings: this.fb.group({
                memory: ['2G'],
                cpu: ['1']
            }),
            dockerSettings: this.fb.group({
                env: this.fb.array([])
            }),
            serverType: [ServerType.MINIGAME],
            isPermanent: [false]
        });

        // Configuration de l'écouteur pour générer le nom à partir du titre
        this.minigameForm.get('displayName')?.valueChanges.subscribe(value => {
            if (value) {
                this.minigameForm.get('name')?.setValue(this.generateSlug(value));
            }
        });
    }

    private resetForm(): void {
        if (!this.minigame) return;

        // Déterminer le type de serveur
        let serverType = ServerType.MINIGAME;
        if (this.minigame?.serverType) {
            if (this.minigame.serverType.isLobby) serverType = ServerType.LOBBY;
            else if (this.minigame.serverType.isProxy) serverType = ServerType.PROXY;
        }

        // Réinitialiser le formulaire
        this.minigameForm.patchValue({
            displayName: this.minigame.name || '',
            name: this.minigame.key || '',
            enabled: this.minigame.enabled ?? true,
            description: this.minigame.description || '',
            gameSettings: {
                minimalInstanceCount: this.minigame.gameSettings?.minimalInstanceCount || 0,
                maxPlayers: this.minigame.gameSettings?.maxPlayers || 16,
                minPlayers: this.minigame.gameSettings?.minPlayers || 2
            },
            serverSettings: {
                memory: this.minigame.serverSettings?.memory || '2G',
                cpu: this.minigame.serverSettings?.cpu || '1'
            },
            serverType: serverType,
            isPermanent: this.minigame.serverType?.isPermanent || false
        });

        // Réinitialiser les tableaux
        this.initDeveloperNames();
        this.initEnvVars();
    }

    private generateSlug(text: string): string {
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    private initDeveloperNames(): void {
        // Vider le tableau
        while (this.developerNames.length > 0) {
            this.developerNames.removeAt(0);
        }

        const devNames = this.minigame?.developerNames || [];
        if (devNames.length === 0) {
            this.addDeveloperName();
            return;
        }

        // Ajouter les développeurs
        devNames.forEach((name: string) => {
            this.developerNames.push(new FormControl(name));
        });
    }

    private initEnvVars(): void {
        // Vider le tableau
        while (this.envVars.length > 0) {
            this.envVars.removeAt(0);
        }

        const envVars = this.minigame?.dockerSettings?.env || [];

        // Ajouter les variables
        envVars.forEach((env: { key: string; value: string; }) => {
            this.envVars.push(this.fb.group({
                key: [env.key],
                value: [env.value]
            }));
        });
    }
}
