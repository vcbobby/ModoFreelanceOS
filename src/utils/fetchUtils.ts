/**
 * Utilidades centralizadas para peticiones fetch con retry logic, timeout y manejo de errores CORS
 */

interface FetchOptions extends RequestInit {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
}

interface FetchError extends Error {
    status?: number;
    isCorsError?: boolean;
    isTimeout?: boolean;
    isNetworkError?: boolean;
}

/**
 * Crea un error tipado con información adicional
 */
function createFetchError(message: string, options: Partial<FetchError> = {}): FetchError {
    const error = new Error(message) as FetchError;
    Object.assign(error, options);
    return error;
}

/**
 * Detecta si un error es de CORS
 */
function isCorsError(error: Error): boolean {
    return (
        error.message.includes('CORS') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('Network request failed')
    );
}

/**
 * Espera un tiempo determinado (para retry delay)
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calcula el delay con backoff exponencial
 */
function getBackoffDelay(attempt: number, baseDelay: number): number {
    return baseDelay * Math.pow(2, attempt - 1);
}

/**
 * Fetch con timeout
 */
async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = 30000
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw createFetchError('Request timeout', { isTimeout: true });
            }
            if (isCorsError(error)) {
                throw createFetchError('CORS error - Check backend configuration', {
                    isCorsError: true,
                    isNetworkError: true
                });
            }
        }
        throw error;
    }
}

/**
 * Fetch con retry logic y manejo de errores mejorado
 */
export async function fetchWithRetry(
    url: string,
    options: FetchOptions = {}
): Promise<Response> {
    const {
        timeout = 30000,
        retries = 3,
        retryDelay = 1000,
        onRetry,
        ...fetchOptions
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetchWithTimeout(url, fetchOptions, timeout);

            // Si la respuesta es exitosa, retornarla
            if (response.ok) {
                return response;
            }

            // Si es un error del servidor (5xx), reintentar
            if (response.status >= 500 && attempt < retries) {
                const error = createFetchError(
                    `Server error: ${response.status} ${response.statusText}`,
                    { status: response.status }
                );
                lastError = error;

                if (onRetry) {
                    onRetry(attempt, error);
                }

                await delay(getBackoffDelay(attempt, retryDelay));
                continue;
            }

            // Si es un error del cliente (4xx), no reintentar (excepto 408 y 429)
            if (response.status === 408 || response.status === 429) {
                if (attempt < retries) {
                    const error = createFetchError(
                        `Retryable client error: ${response.status}`,
                        { status: response.status }
                    );
                    lastError = error;

                    if (onRetry) {
                        onRetry(attempt, error);
                    }

                    await delay(getBackoffDelay(attempt, retryDelay));
                    continue;
                }
            }

            // Retornar la respuesta incluso si no es exitosa (para que el caller maneje el error)
            return response;

        } catch (error) {
            lastError = error as Error;

            // Si es el último intento, lanzar el error
            if (attempt >= retries) {
                throw lastError;
            }

            // Si es un error de CORS o de red, reintentar
            const fetchError = lastError as FetchError;
            if (fetchError.isCorsError || fetchError.isNetworkError || fetchError.isTimeout) {
                if (onRetry) {
                    onRetry(attempt, lastError);
                }

                await delay(getBackoffDelay(attempt, retryDelay));
                continue;
            }

            // Para otros errores, lanzar inmediatamente
            throw lastError;
        }
    }

    // Si llegamos aquí, lanzar el último error
    throw lastError || new Error('Unknown error in fetchWithRetry');
}

/**
 * Fetch JSON con retry y manejo de errores
 */
export async function fetchJson<T = unknown>(
    url: string,
    options: FetchOptions = {}
): Promise<T> {
    const response = await fetchWithRetry(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
            const errorData = await response.json();
            errorMessage = errorData?.detail || errorData?.message || errorMessage;
        } catch {
            // Si no se puede parsear el JSON, usar el mensaje por defecto
        }

        throw createFetchError(errorMessage, { status: response.status });
    }

    return response.json() as Promise<T>;
}

/**
 * POST JSON con retry y manejo de errores
 */
export async function postJson<T = unknown>(
    url: string,
    data: unknown,
    options: FetchOptions = {}
): Promise<T> {
    return fetchJson<T>(url, {
        ...options,
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Logging para debugging (solo en desarrollo)
 */
export function logFetchError(error: Error, context: string): void {
    if (import.meta.env.DEV) {
        console.error(`[FetchUtils] Error in ${context}:`, error);

        const fetchError = error as FetchError;
        if (fetchError.isCorsError) {
            console.error('[FetchUtils] CORS Error detected. Check backend CORS configuration.');
        }
        if (fetchError.isTimeout) {
            console.error('[FetchUtils] Timeout Error. Consider increasing timeout or checking network.');
        }
        if (fetchError.status) {
            console.error(`[FetchUtils] HTTP Status: ${fetchError.status}`);
        }
    }
}
