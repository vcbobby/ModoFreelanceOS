export enum AppView {
    LANDING = 'LANDING',
    DASHBOARD = 'DASHBOARD',
    PROPOSALS = 'PROPOSALS',
    TEMPLATES = 'TEMPLATES',
    HISTORY = 'history',
}

export interface Proposal {
    type: 'Formal' | 'Corto' | 'Valor'
    title: string
    content: string
}

export interface UserState {
    isSubscribed: boolean
    credits: number // Demo credits before forced upgrade
    subscriptionEnd?: number // <--- NUEVO (Fecha fin plan PRO)
    nextReset?: number
}

export interface HistoryItem {
    id: string
    createdAt: string // Fecha ISO
    clientName: string
    platform: string
    type: string // Formal, Corto, etc.
    content: string
}
