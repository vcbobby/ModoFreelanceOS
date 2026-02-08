import { getBackendURL } from '@config/features';

export class BackendError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export interface BackendClient {
  request<T>(endpoint: string, options?: RequestInit): Promise<T>;
  get<T>(endpoint: string, options?: RequestInit): Promise<T>;
  post<T>(endpoint: string, body: BodyInit, options?: RequestInit): Promise<T>;
  ping(): Promise<void>;
}

interface BackendClientOptions {
  baseURL: string;
  fetchFn?: typeof fetch;
  timeoutMs?: number;
  maxRetries?: number;
}

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_MAX_RETRIES = 2;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const createBackendClient = ({
  baseURL,
  fetchFn = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxRetries = DEFAULT_MAX_RETRIES,
}: BackendClientOptions): BackendClient => {
  const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    let attempt = 0;

    while (attempt <= maxRetries) {
      attempt += 1;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetchFn(`${baseURL}${endpoint}`, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMessage = 'Request failed';
          try {
            const errorBody = await response.json();
            errorMessage = errorBody?.detail || errorBody?.message || errorMessage;
          } catch (error) {
            // Ignore JSON parse errors for non-JSON responses.
          }
          throw new BackendError(errorMessage, response.status);
        }

        if (response.status === 204) {
          return undefined as T;
        }

        const text = await response.text();
        return (text ? JSON.parse(text) : undefined) as T;
      } catch (error) {
        clearTimeout(timeoutId);

        const isBackendError = error instanceof BackendError;
        if (isBackendError && error.status >= 400 && error.status < 500) {
          throw error;
        }

        if (attempt > maxRetries) {
          if (isBackendError) throw error;
          throw new BackendError('Network error', 0);
        }

        await sleep(250 * attempt);
      }
    }

    throw new BackendError('Network error', 0);
  };

  return {
    request,
    get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, body, options) =>
      request(endpoint, {
        ...options,
        method: 'POST',
        body,
      }),
    ping: async () => {
      await request('/', { method: 'GET' });
    },
  };
};

export const backendClient = createBackendClient({
  baseURL: getBackendURL(),
});
