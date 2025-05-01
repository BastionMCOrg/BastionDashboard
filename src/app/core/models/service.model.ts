// src/app/core/models/service.model.ts
export interface Service {
    id: string;
    name: string;
    containerId: string;
    image: string;
    state: string;
    status: string;
    type: string;
    description?: string;
    createdAt: string;
    startedAt: string;
    memoryUsage: number;
    memoryLimit: string;
    cpuUsage: number;
}
