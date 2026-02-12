import { getBackendURL } from '@config/features';
import { getAuthHeaders } from '@/services/backend/authHeaders';
import { auth } from '@config/firebase';

type HistoryMetadata = Record<string, unknown>;

type HistoryLogPayload = {
  userId: string;
  category: string;
  type?: string;
  clientName?: string;
  platform?: string;
  content?: string;
  imageUrl?: string;
  invoiceData?: Record<string, unknown>;
  metadata?: HistoryMetadata;
};

export const logHistory = async (payload: HistoryLogPayload) => {
  if (!auth.currentUser) {
    throw new Error('Usuario no autenticado. Por favor inicia sesión antes de guardar historial.');
  }
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${getBackendURL()}/api/v1/history/log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'Error guardando historial';
    try {
      const data = await response.json();
      message = data?.detail || data?.message || message;
    } catch {
      // Ignore JSON parse errors for non-JSON responses.
    }
    throw new Error(message);
  }

  return response.json().catch(() => ({ success: true }));
};
