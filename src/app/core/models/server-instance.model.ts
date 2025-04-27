/**
 * Interface représentant un joueur connecté à un serveur
 */
export interface Player {
    uuid: string;
    username: string;
    joinedAt?: Date;
    ping?: number;
    isOp?: boolean;
    gameMode?: string;
}

/**
 * Interface représentant une instance de serveur Minecraft
 */
export interface ServerInstance {
    id: string;
    containerId: string;
    minigame: string;
    map: string;
    startedAt: Date;
    status: 'starting' | 'running' | 'stopped';
    tps: number;
    players: {
        current: number;
        max: number;
        list?: Player[];
    };
    resources: {
        ram: {
            usage: number;  // Pourcentage (0-1)
            total: string;  // Format: "2.0" pour 2GB
        };
        cpu: number;      // Pourcentage
    };
    color: string;      // Couleur associée pour l'UI
    version?: string;
    javaVersion?: string;
    plugins?: string[];
    worldSize?: number; // En MB
    serverProperties?: Record<string, string>;
}
