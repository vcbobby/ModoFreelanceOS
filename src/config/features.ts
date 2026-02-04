const FEATURES = {
    USE_BACKEND_V2: import.meta.env.VITE_USE_BACKEND_V2 === 'true',
    BACKEND_V2_PERCENTAGE: parseInt(
        import.meta.env.VITE_BACKEND_V2_PERCENTAGE || '0',
    ),
}

export function shouldUseBackendV2(): boolean {
    if (FEATURES.USE_BACKEND_V2) return true

    // Canary release: porcentaje aleatorio
    const random = Math.random() * 100
    return random < FEATURES.BACKEND_V2_PERCENTAGE
}

export function getBackendURL(): string {
    const v2Url = import.meta.env.VITE_BACKEND_V2_URL
    const v1Url = import.meta.env.VITE_BACKEND_URL

    return shouldUseBackendV2() ? v2Url : v1Url
}
