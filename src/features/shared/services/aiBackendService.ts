import { getBackendURL } from '@config/features';
import { auth } from '@config/firebase';
import { fetchWithRetry, logFetchError } from '@utils/fetchUtils';

const getAuthHeader = async () => {
  const user = auth.currentUser;
  if (!user) return undefined;
  const token = await user.getIdToken();
  return `Bearer ${token}`;
};

const postJson = async <T>(endpoint: string, payload: unknown): Promise<T> => {
  try {
    const authHeader = await getAuthHeader();
    const response = await fetchWithRetry(`${getBackendURL()}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(payload),
      timeout: 60000, // 60 segundos para operaciones de IA
      retries: 3,
      retryDelay: 2000,
      onRetry: (attempt: number, error: Error) => {
        console.warn(`[AI Backend] Retry attempt ${attempt} for ${endpoint}:`, error.message);
      },
    });

    if (!response.ok) {
      let message = 'Error de conexion con IA';
      try {
        const data = await response.json();
        message = data?.detail || data?.message || message;
      } catch {
        // Ignore JSON parse errors for non-JSON responses.
      }
      throw new Error(message);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    logFetchError(error as Error, `AI Backend - ${endpoint}`);
    throw error;
  }
};

export const analyzeDocument = async (
  text: string,
  mode: 'resumen' | 'riesgos' | 'accion' | 'mejora'
) => {
  const data = await postJson<{ success: boolean; text: string }>('/api/analyze-document', {
    text,
    mode,
  });
  return data.text;
};

export const analyzeFinancialHealth = async (
  transactions: Array<{
    date: string;
    type: 'income' | 'expense';
    status: 'paid' | 'pending';
    amount: number;
    description: string;
  }>,
  summary: { income: number; expense: number; balance: number },
  pending: { toCollect: number; toPay: number }
) => {
  const data = await postJson<{ success: boolean; text: string }>('/api/analyze-finance', {
    transactions,
    summary,
    pending,
  });
  return data.text;
};

export const chatWithAssistant = async (
  userId: string,
  message: string,
  history: { role: 'user' | 'model'; text: string }[],
  contextData: {
    finances: string;
    agenda: string;
    notes: string;
    history: string;
    portfolio: string;
    knowledgeBase: string;
    currentTime: string;
    currentDate: string;
  }
) => {
  const data = await postJson<{ success: boolean; text: string }>('/api/chat-assistant', {
    userId,
    message,
    history,
    contextData,
    allowedTools: ['create_event', 'create_note', 'search_jobs', 'create_course'],
    storeMemory: true,
  });
  return data.text || 'No pude generar una respuesta.';
};

export const ingestAssistantDocuments = async (
  userId: string,
  documents: Array<{
    id?: string;
    text: string;
    source?: string;
    metadata?: Record<string, unknown>;
  }>,
  source?: string
) => {
  const data = await postJson<{ success: boolean; stored: number }>('/api/assistant/ingest', {
    userId,
    documents,
    source,
  });
  return data.stored || 0;
};
