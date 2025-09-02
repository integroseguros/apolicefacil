interface ApiClientOptions {
    maxRetries?: number;
    retryDelay?: number;
    timeout?: number;
}

interface RetryOptions {
    attempt: number;
    maxRetries: number;
    error: Error;
}

class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class ApiClient {
    private maxRetries: number;
    private retryDelay: number;
    private timeout: number;

    constructor(options: ApiClientOptions = {}) {
        this.maxRetries = options.maxRetries ?? 3;
        this.retryDelay = options.retryDelay ?? 1000;
        this.timeout = options.timeout ?? 10000;
    }

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private shouldRetry(error: Error, attempt: number): boolean {
        if (attempt >= this.maxRetries) return false;

        // Retry on network errors
        if (error.message.includes('fetch') || error.message.includes('network')) {
            return true;
        }

        // Retry on timeout errors
        if (error.message.includes('timeout')) {
            return true;
        }

        // Retry on 5xx server errors
        if (error instanceof ApiError && error.status && error.status >= 500) {
            return true;
        }

        return false;
    }

    private async executeWithTimeout<T>(
        promise: Promise<T>,
        timeoutMs: number
    ): Promise<T> {
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Request timeout after ${timeoutMs}ms`));
            }, timeoutMs);
        });

        return Promise.race([promise, timeoutPromise]);
    }

    async request<T>(
        url: string,
        options: RequestInit = {},
        customOptions: ApiClientOptions = {}
    ): Promise<T> {
        const maxRetries = customOptions.maxRetries ?? this.maxRetries;
        const retryDelay = customOptions.retryDelay ?? this.retryDelay;
        const timeout = customOptions.timeout ?? this.timeout;

        let lastError: Error;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const fetchPromise = fetch(url, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers,
                    },
                });

                const response = await this.executeWithTimeout(fetchPromise, timeout);

                if (!response.ok) {
                    const errorText = await response.text();
                    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        // Use default error message if JSON parsing fails
                    }

                    throw new ApiError(errorMessage, response.status);
                }

                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return await response.json();
                }

                return await response.text() as T;
            } catch (error) {
                lastError = error as Error;

                if (this.shouldRetry(lastError, attempt)) {
                    console.warn(`Request failed (attempt ${attempt + 1}/${maxRetries + 1}):`, lastError.message);

                    if (attempt < maxRetries) {
                        await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
                        continue;
                    }
                }

                throw lastError;
            }
        }

        throw lastError!;
    }

    async get<T>(url: string, options?: ApiClientOptions): Promise<T> {
        return this.request<T>(url, { method: 'GET' }, options);
    }

    async post<T>(url: string, data?: any, options?: ApiClientOptions): Promise<T> {
        return this.request<T>(
            url,
            {
                method: 'POST',
                body: data ? JSON.stringify(data) : undefined,
            },
            options
        );
    }

    async put<T>(url: string, data?: any, options?: ApiClientOptions): Promise<T> {
        return this.request<T>(
            url,
            {
                method: 'PUT',
                body: data ? JSON.stringify(data) : undefined,
            },
            options
        );
    }

    async delete<T>(url: string, options?: ApiClientOptions): Promise<T> {
        return this.request<T>(url, { method: 'DELETE' }, options);
    }
}

// Default instance
export const apiClient = new ApiClient();

// Utility function for handling API calls with error handling
export async function withErrorHandling<T>(
    apiCall: () => Promise<T>,
    errorHandler?: (error: Error) => void
): Promise<T> {
    try {
        return await apiCall();
    } catch (error) {
        const apiError = error as Error;

        if (errorHandler) {
            errorHandler(apiError);
        } else {
            console.error('API Error:', apiError);
        }

        throw apiError;
    }
}