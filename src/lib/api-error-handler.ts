import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export function createApiError(message: string, statusCode: number = 500, code?: string) {
    return new ApiError(message, statusCode, code);
}

export function handleApiError(error: unknown): NextResponse {
    console.error('API Error:', error);

    // Zod validation errors
    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                error: 'Dados inválidos',
                message: 'Os dados fornecidos não são válidos',
                details: error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
                code: 'VALIDATION_ERROR',
            },
            { status: 400 }
        );
    }

    // Custom API errors
    if (error instanceof ApiError) {
        return NextResponse.json(
            {
                error: error.message,
                message: error.message,
                code: error.code,
            },
            { status: error.statusCode }
        );
    }

    // Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as any;

        switch (prismaError.code) {
            case 'P2002':
                return NextResponse.json(
                    {
                        error: 'Dados duplicados',
                        message: 'Já existe um registro com essas informações',
                        code: 'DUPLICATE_ERROR',
                    },
                    { status: 409 }
                );

            case 'P2025':
                return NextResponse.json(
                    {
                        error: 'Registro não encontrado',
                        message: 'O registro solicitado não foi encontrado',
                        code: 'NOT_FOUND',
                    },
                    { status: 404 }
                );

            case 'P2003':
                return NextResponse.json(
                    {
                        error: 'Violação de restrição',
                        message: 'Operação não permitida devido a restrições de dados',
                        code: 'CONSTRAINT_ERROR',
                    },
                    { status: 400 }
                );
        }
    }

    // Network/connection errors
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
            {
                error: 'Erro de conexão',
                message: 'Não foi possível conectar ao banco de dados',
                code: 'CONNECTION_ERROR',
            },
            { status: 503 }
        );
    }

    // Generic error
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';

    return NextResponse.json(
        {
            error: 'Erro interno',
            message: process.env.NODE_ENV === 'development' ? message : 'Ocorreu um erro inesperado',
            code: 'INTERNAL_ERROR',
        },
        { status: 500 }
    );
}

// Wrapper for API route handlers with error handling
export function withErrorHandling<T extends any[]>(
    handler: (...args: T) => Promise<NextResponse>
) {
    return async (...args: T): Promise<NextResponse> => {
        try {
            return await handler(...args);
        } catch (error) {
            return handleApiError(error);
        }
    };
}

// Middleware for request validation
export function validateRequest<T>(
    schema: any,
    data: unknown
): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof ZodError) {
            throw error;
        }
        throw createApiError('Dados inválidos', 400, 'VALIDATION_ERROR');
    }
}

// Helper for checking authentication
export function requireAuth(request: NextRequest) {
    // Implement your authentication logic here
    // This is a placeholder
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
        throw createApiError('Token de autenticação necessário', 401, 'AUTH_REQUIRED');
    }

    // Validate token logic would go here
    // For now, just check if it exists
    if (!authHeader.startsWith('Bearer ')) {
        throw createApiError('Formato de token inválido', 401, 'INVALID_TOKEN');
    }

    return true;
}

// Helper for rate limiting (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000 // 1 minute
) {
    const now = Date.now();
    const record = requestCounts.get(identifier);

    if (!record || now > record.resetTime) {
        requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (record.count >= maxRequests) {
        throw createApiError(
            'Muitas requisições. Tente novamente em alguns minutos.',
            429,
            'RATE_LIMIT_EXCEEDED'
        );
    }

    record.count++;
    return true;
}