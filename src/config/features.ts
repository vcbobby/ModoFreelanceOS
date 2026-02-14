const FEATURES = {
  USE_BACKEND_V2: import.meta.env.VITE_USE_BACKEND_V2 === 'true',
  BACKEND_V2_PERCENTAGE: parseInt(import.meta.env.VITE_BACKEND_V2_PERCENTAGE || '0'),
};

export function shouldUseBackendV2(): boolean {
  return true;
}

export function getBackendURL(): string {
  const fallback = import.meta.env.PROD
    ? 'https://backend-freelanceos.onrender.com'
    : 'http://localhost:8000';
  const v2Url = import.meta.env.VITE_BACKEND_V2_URL || fallback;

  return v2Url;
}

/**
 * Configuración de timeouts y retries para peticiones fetch
 */
export const FETCH_CONFIG = {
  // Timeout por defecto (30 segundos)
  DEFAULT_TIMEOUT: 30000,

  // Timeout para operaciones de IA (60 segundos)
  AI_TIMEOUT: 60000,

  // Timeout para descargas (60 segundos)
  DOWNLOAD_TIMEOUT: 60000,

  // Número de reintentos por defecto
  DEFAULT_RETRIES: 3,

  // Delay inicial entre reintentos (ms)
  RETRY_DELAY: 1000,

  // Delay para operaciones de IA (ms)
  AI_RETRY_DELAY: 2000,
};
