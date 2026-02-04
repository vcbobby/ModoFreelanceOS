class APIError extends Error {
    constructor(public message: string, public status: number) {
        super(message)
    }
}

class APIClient {
    private baseURL: string

    constructor(baseURL: string) {
        this.baseURL = baseURL
    }

    async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}`

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            })

            if (!response.ok) {
                const error = await response.json()
                throw new APIError(
                    error.detail || 'Request failed',
                    response.status,
                )
            }

            return await response.json()
        } catch (error) {
            if (error instanceof APIError) throw error
            throw new APIError('Network error', 0)
        }
    }

    async post<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' })
    }
}

export const apiClient = new APIClient(
    import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
)
