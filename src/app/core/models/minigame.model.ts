export interface Minigame {
    id: string;
    name: string;
    key: string;
    description: string;
    icon?: string;
    developerNames: string[];
    enabled: boolean;
    gameSettings: {
        maxPlayers: number;
        minPlayers: number;
    };
    serverSettings: {
        memory: string;
        cpu: string;
        javaVersion: string;
        serverVersion: string;
    };
    color: string;
    stats: {
        avgTps: number;
        avgMemoryUsage: number;
        avgCpuUsage: number;
        avgStartupTime: number;
        successRate: number;
        activeServers: number;
        peakPlayerCount: number;
        currentPlayerCount: number;
    };
}
