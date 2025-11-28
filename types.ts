export enum AppView {
    LANDING = 'LANDING',
    DASHBOARD = 'DASHBOARD',
    PROPOSALS = 'PROPOSALS',
    TEMPLATES = 'TEMPLATES',
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
