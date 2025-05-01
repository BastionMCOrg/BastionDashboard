// src/app/pages/services/service-detail/service-detail.component.ts
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { Service } from '../../../core/models/service.model';
import { ServiceService } from '../../../core/services/service.service';
import { getStatusDisplay, getStatusSeverity } from '../../../core/utils/dashboard.utils';
import {Select} from 'primeng/select';

@Component({
    selector: 'app-service-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        CardModule,
        TagModule,
        TooltipModule,
        InputTextModule,
        IconFieldModule,
        InputIconModule,
        ProgressBarModule,
        ProgressSpinnerModule,
        SelectButtonModule,
        ToastModule,
        DialogModule,
        AvatarModule,
        Select
    ],
    templateUrl: './service-detail.component.html',
    styleUrls: ['./service-detail.component.scss'],
    providers: [MessageService]
})
export class ServiceDetailComponent implements OnInit, OnDestroy {
    @ViewChild('logsContainer') logsContainerRef!: ElementRef<HTMLDivElement>;

    serviceId: string = '';
    service: Service | null = null;
    loading = true;

    // Logs
    serverLogs: string[] = [];
    filteredLogs: string[] = [];
    logsEventSource: EventSource | null = null;
    logsFullscreen: boolean = false;
    autoScrollEnabled: boolean = true;
    logFilter: string = '';
    selectedLogLevel: string = 'all';
    commandText: string = '';
    executingCommand = false;

    // Stats
    memoryPercentage: number = 0;
    cpuPercentage: number = 0;
    cpuUpdateTime: string = '';
    memoryUpdateTime: string = '';

    // Log filtering options
    logLevels = [
        { label: 'Tous les niveaux', value: 'all' },
        { label: 'Info', value: 'info' },
        { label: 'Avertissement', value: 'warn' },
        { label: 'Erreur', value: 'error' }
    ];

    // Utility functions
    getStatusSeverity = getStatusSeverity;
    getStatusDisplay = getStatusDisplay;

    private readonly SCROLL_THRESHOLD = 30;

    constructor(
        private route: ActivatedRoute,
        private serviceService: ServiceService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.serviceId = params['id'];
            this.loadServiceDetails();
        });
    }

    ngOnDestroy(): void {
        if (this.logsEventSource) {
            this.logsEventSource.close();
        }
        document.body.style.overflow = '';
    }

    async loadServiceDetails(): Promise<void> {
        this.loading = true;
        try {
            this.service = await this.serviceService.getServiceDetails(this.serviceId);

            // Initialize stats
            this.memoryPercentage = this.service.memoryUsage * 100;
            this.cpuPercentage = this.service.cpuUsage;

            // Connect to logs stream
            this.connectToLogStream();
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Impossible de charger les détails du service: ${error instanceof Error ? error.message : String(error)}`
            });
            console.error('Error loading service details:', error);
        } finally {
            this.loading = false;
        }
    }

    @HostListener('document:keydown.escape', ['$event'])
    handleEscapeKey(event: KeyboardEvent): void {
        if (this.logsFullscreen) {
            this.toggleFullscreenLogs();
        }
    }

    onLogsScroll(): void {
        if (!this.logsContainerRef) return;

        const container = this.logsContainerRef.nativeElement;
        const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < this.SCROLL_THRESHOLD;

        if (atBottom && !this.autoScrollEnabled) {
            this.autoScrollEnabled = true;
        } else if (!atBottom && this.autoScrollEnabled) {
            this.autoScrollEnabled = false;
        }
    }

    scrollToBottom(enableAutoScroll: boolean = false): void {
        if (!this.logsContainerRef) return;

        const container = this.logsContainerRef.nativeElement;
        container.scrollTop = container.scrollHeight;

        if (enableAutoScroll) {
            this.autoScrollEnabled = true;
        }
    }

    filterLogs(): void {
        this.filteredLogs = this.serverLogs.filter(log => {
            // Filtre par texte
            if (this.logFilter && !log.toLowerCase().includes(this.logFilter.toLowerCase())) {
                return false;
            }

            // Filtre par niveau
            if (this.selectedLogLevel !== 'all') {
                const logLevel = this.getLogLevel(log);
                if (logLevel !== this.selectedLogLevel) {
                    return false;
                }
            }

            return true;
        });

        if (this.autoScrollEnabled) {
            setTimeout(() => this.scrollToBottom(), 0);
        }
    }

    getLogLevel(line: string): string {
        if (line.includes('ERROR') || line.includes('SEVERE')) return 'error';
        if (line.includes('WARN') || line.includes('WARNING')) return 'warn';
        if (line.includes('INFO')) return 'info';
        return 'default';
    }

    toggleFullscreenLogs(): void {
        this.logsFullscreen = !this.logsFullscreen;

        if (this.logsFullscreen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                if (this.logsContainerRef) {
                    this.logsContainerRef.nativeElement.focus();
                }
            }, 100);
        } else {
            document.body.style.overflow = '';
        }

        if (this.autoScrollEnabled) {
            setTimeout(() => this.scrollToBottom(), 100);
        }
    }

    async executeCommand(): Promise<void> {
        if (!this.commandText || !this.service) return;

        this.executingCommand = true;
        try {
            const result = await this.serviceService.executeCommand(this.service.id, this.commandText);

            // Add command to logs
            this.serverLogs.push(`> ${this.commandText}`);

            // Add command output to logs
            if (result.output) {
                const outputLines = result.output.split('\n');
                for (const line of outputLines) {
                    if (line.trim()) {
                        this.serverLogs.push(line);
                    }
                }
            }

            // Filter and scroll
            this.filterLogs();
            this.commandText = '';
            this.autoScrollEnabled = true;
            this.scrollToBottom();

            this.messageService.add({
                severity: 'success',
                summary: 'Commande exécutée',
                detail: `Code de sortie: ${result.exitCode}`
            });
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Impossible d'exécuter la commande: ${error instanceof Error ? error.message : String(error)}`
            });
        } finally {
            this.executingCommand = false;
        }
    }

    async restartService(): Promise<void> {
        if (!this.service) return;

        try {
            await this.serviceService.restartService(this.service.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: `Le service ${this.service.name} a été redémarré`
            });

            // Reload data after a short delay
            setTimeout(() => this.loadServiceDetails(), 2000);
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Impossible de redémarrer le service: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    async stopService(): Promise<void> {
        if (!this.service) return;

        try {
            await this.serviceService.stopService(this.service.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: `Le service ${this.service.name} a été arrêté`
            });

            // Reload data after a short delay
            setTimeout(() => this.loadServiceDetails(), 2000);
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Impossible d'arrêter le service: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    async startService(): Promise<void> {
        if (!this.service) return;

        try {
            await this.serviceService.startService(this.service.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: `Le service ${this.service.name} a été démarré`
            });

            // Reload data after a short delay
            setTimeout(() => this.loadServiceDetails(), 2000);
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Impossible de démarrer le service: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    getServiceTypeIcon(): string {
        if (!this.service) return 'pi pi-box';

        const iconMap: Record<string, string> = {
            'rest': 'pi-server',
            'build': 'pi-cog',
            'hub': 'pi-globe',
            'bastion-grpc': 'pi-sitemap',
            'discord': 'pi-discord',
            'mongodb': 'pi-database',
            'rabbitmq': 'pi-send',
            'velocity': 'pi-forward',
            'redis': 'pi-database',
            'unknown': 'pi-box'
        };

        return 'pi ' + (iconMap[this.service.type] || 'pi-box');
    }

    getServiceColor(): string {
        if (!this.service) return 'gray';

        const colorMap: Record<string, string> = {
            'rest': 'blue',
            'build': 'green',
            'hub': 'purple',
            'bastion-grpc': 'orange',
            'discord': 'indigo',
            'mongodb': 'green',
            'rabbitmq': 'orange',
            'velocity': 'blue',
            'redis': 'red',
            'unknown': 'gray'
        };

        return colorMap[this.service.type] || 'gray';
    }

    getMemoryClass(): string {
        if (!this.service) return '';

        const usage = this.service.memoryUsage;
        if (usage > 0.8) return 'bg-danger';
        if (usage > 0.6) return 'bg-warning';
        return 'bg-success';
    }

    getCpuClass(): string {
        if (!this.service) return '';

        const usage = this.service.cpuUsage;
        if (usage > 80) return 'bg-danger';
        if (usage > 50) return 'bg-warning';
        return 'bg-success';
    }

    private connectToLogStream(): void {
        if (this.logsEventSource) {
            this.logsEventSource.close();
        }

        const logsUrl = this.serviceService.getLogsUrl(this.serviceId);
        this.logsEventSource = new EventSource(logsUrl);

        this.logsEventSource.addEventListener('log', (event: any) => {
            const logMessage = event.data;
            this.serverLogs.push(logMessage);

            if (this.serverLogs.length > 500) {
                this.serverLogs = this.serverLogs.slice(-500);
            }

            this.filterLogs();

            if (this.autoScrollEnabled) {
                setTimeout(() => this.scrollToBottom(), 0);
            }
        });

        // Listen to stats events
        this.logsEventSource.addEventListener('stats', (event: any) => {
            try {
                const statsData = JSON.parse(event.data);
                this.cpuPercentage = parseFloat(statsData.cpu);
                this.memoryPercentage = parseFloat(statsData.memory.percent);

                // Update the service object with new stats
                if (this.service) {
                    this.service.cpuUsage = this.cpuPercentage;
                    this.service.memoryUsage = this.memoryPercentage / 100;
                }

                // Update timestamp
                const now = new Date();
                const timeString = now.toLocaleTimeString();
                this.cpuUpdateTime = timeString;
                this.memoryUpdateTime = timeString;
            } catch (error) {
                console.error('Error parsing stats data:', error);
            }
        });

        this.logsEventSource.onerror = (error) => {
            console.error('Error connecting to logs:', error);
            setTimeout(() => this.connectToLogStream(), 5000);
        };
    }

    protected readonly parseFloat = parseFloat;
}
