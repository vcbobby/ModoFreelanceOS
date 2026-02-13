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
  FIVERR = 'FIVERR',
  POMODORO = 'POMODORO',
  CV_BUILDER = 'CV_BUILDER',
  JOBS = 'JOBS',
  ACADEMY = 'ACADEMY',
  ADMIN = 'ADMIN',
  WEBSITE_BUILDER = 'WEBSITE_BUILDER',
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE',
  AUTOMATIONS = 'AUTOMATIONS',
  ANALYTICS = 'ANALYTICS',
}

export interface Proposal {
  type: 'Formal' | 'Corto' | 'Valor';
  title: string;
  content: string;
}

export interface UserState {
  isSubscribed: boolean;
  credits: number; // Unified total for simple displays
  baseCredits: number; // Weekly replenishable (0-3)
  purchasedCredits: number; // Bought and non-expiring
  subscriptionEnd?: number;
  nextReset?: number;
}

export interface HistoryItem {
  id: string;
  createdAt: string; // Fecha ISO
  clientName: string;
  platform?: string;
  type?: string; // Formal, Corto, etc.
  content: string;
  category?: 'proposal' | 'logo' | 'invoice' | 'tool'; // Para saber qué tarjeta mostrar
  imageUrl?: string;

  // Datos específicos para facturas (los guardaremos en el mismo objeto para simplificar)
  invoiceData?: unknown;
  gigData?: unknown;
}
