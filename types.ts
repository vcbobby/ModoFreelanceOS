export enum AppView {
    LANDING = 'LANDING',
    DASHBOARD = 'DASHBOARD',
    PROPOSALS = 'PROPOSALS',
    TEMPLATES = 'TEMPLATES',
    HISTORY = 'history',
    LOGOS = 'logos',
    INVOICES = 'invoices',
    NOTES = 'notes',
    QR = 'qr',
    OPTIMIZER = 'optimizer',
    ANALYZER = 'analyzer',
    FINANCES = 'finances',
    PORTFOLIO = 'PORTFOLIO',
    BRIEFING = 'BRIEFING',
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
    platform?: string
    type?: string // Formal, Corto, etc.
    content: string
    category?: 'proposal' | 'logo' | 'invoice' | 'tool' // Para saber qué tarjeta mostrar
    imageUrl?: string

    // Datos específicos para facturas (los guardaremos en el mismo objeto para simplificar)
    invoiceData?: any
}
