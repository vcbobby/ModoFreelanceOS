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
