import { getBackendURL } from '@config/features';
import { getAuthHeaders } from '@/services/backend/authHeaders';

const API_BASE = `${getBackendURL()}/api/v1/copilot`;

export interface CopilotProjectPhase {
    title: string;
    description: string;
    tasks: string[];
    is_completed: boolean;
}

export interface CopilotProject {
    id: string;
    profession: string;
    client_request: string;
    phases: CopilotProjectPhase[];
    current_phase: number;
    created_at: string;
}

export interface CopilotMessage {
    role: 'user' | 'assistant';
    content: string;
    created_at?: string;
}

export const startCopilotProject = async (userId: string, profession: string, client_request: string): Promise<CopilotProject> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/start`, {
        method: 'POST',
        headers: {
            ...headers,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, profession, client_request }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Fallo al inicializar el Copiloto.');
    }

    const data = await response.json();
    return data.project;
};

export const chatWithMentor = async (userId: string, projectId: string, message: string): Promise<string> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
            ...headers,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, projectId, message }),
    });

    if (!response.ok) {
        throw new Error('Fallo al conectar con el Mentor.');
    }

    const data = await response.json();
    return data.reply;
};

export const updatePhaseStatus = async (userId: string, projectId: string, phaseIndex: number, isCompleted: boolean) => {
    const headers = await getAuthHeaders();
    await fetch(`${API_BASE}/update-phase`, {
        method: 'POST',
        headers: {
            ...headers,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, projectId, phaseIndex, is_completed: isCompleted }),
    });
};

export const setCurrentPhase = async (userId: string, projectId: string, globalPhaseIndex: number) => {
    const headers = await getAuthHeaders();
    await fetch(`${API_BASE}/set-current-phase`, {
        method: 'POST',
        headers: {
            ...headers,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, projectId, globalPhaseIndex }),
    });
};

export const getCopilotProjects = async (userId: string): Promise<CopilotProject[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/list/${userId}`, {
        headers,
    });
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.projects || [];
};

export const getCopilotProject = async (userId: string, projectId: string): Promise<{project: CopilotProject, messages: CopilotMessage[]}> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/get/${userId}/${projectId}`, {
        headers,
    });
    if (!response.ok) throw new Error('No se encontró el proyecto');
    
    return await response.json();
};
