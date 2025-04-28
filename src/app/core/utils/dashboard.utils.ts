import {Severity} from '../models/utils.model';

export function getUptime(startDate: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - startDate.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHrs > 0) {
        return `${diffHrs}h ${diffMins}m`;
    } else {
        return `${diffMins}m`;
    }
}

export function getInitials(name: string): string {
    if (!name) return '';

    const words = name.split(' ');
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }

    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

export function getRamStatusClass(usage: number): string {
    if (usage > 0.8) return 'ram-high';
    if (usage > 0.6) return 'ram-medium';
    return 'ram-low';
}

export function getCpuStatusClass(usage: number): string {
    if (usage > 50) return 'cpu-high';
    if (usage > 25) return 'cpu-medium';
    return 'cpu-low';
}

export function getTpsSeverity(tps: number): Severity {
    if (tps >= 19) return 'success';
    if (tps >= 17) return 'warn';
    return 'danger';
}

export function getStatusSeverity(status: string): Severity {
    switch (status) {
        case 'running':
            return 'success';
        case 'starting':
            return 'info';
        case 'stopped':
            return 'danger';
        default:
            return 'warn';
    }
}

export function getStatusDisplay(status: string): string {
    switch (status) {
        case 'running':
            return 'Actif';
        case 'starting':
            return 'Démarrage';
        case 'stopped':
            return 'Arrêté';
        default:
            return status;
    }
}
