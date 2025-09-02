'use client'

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorState {
    error: Error | null;
    isError: boolean;
    retryCount: number;
}

interface UseErrorHandlerOptions {
    maxRetries?: number;
    onError?: (error: Error) => void;
    showToast?: boolean;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
    const { maxRetries = 3, onError, showToast = true } = options;

    const [errorState, setErrorState] = useState<ErrorState>({
        error: null,
        isError: false,
        retryCount: 0,
    });

    const handleError = useCallback((error: Error) => {
        console.error('Error handled:', error);

        setErrorState(prev => ({
            error,
            isError: true,
            retryCount: prev.retryCount + 1,
        }));

        if (showToast) {
            toast.error(getErrorMessage(error));
        }

        onError?.(error);
    }, [onError, showToast]);

    const clearError = useCallback(() => {
        setErrorState({
            error: null,
            isError: false,
            retryCount: 0,
        });
    }, []);

    const canRetry = errorState.retryCount < maxRetries;

    const retry = useCallback((fn: () => Promise<void> | void) => {
        if (!canRetry) return;

        clearError();

        try {
            const result = fn();
            if (result instanceof Promise) {
                result.catch(handleError);
            }
        } catch (error) {
            handleError(error as Error);
        }
    }, [canRetry, clearError, handleError]);

    return {
        error: errorState.error,
        isError: errorState.isError,
        retryCount: errorState.retryCount,
        canRetry,
        handleError,
        clearError,
        retry,
    };
}

function getErrorMessage(error: Error): string {
    // Network errors
    if (error.message.includes('fetch')) {
        return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }

    // Validation errors
    if (error.message.includes('validation')) {
        return 'Dados inválidos. Verifique as informações e tente novamente.';
    }

    // Permission errors
    if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        return 'Você não tem permissão para realizar esta ação.';
    }

    // Not found errors
    if (error.message.includes('not found')) {
        return 'Recurso não encontrado.';
    }

    // Server errors
    if (error.message.includes('500') || error.message.includes('server')) {
        return 'Erro interno do servidor. Tente novamente em alguns minutos.';
    }

    // Default error message
    return error.message || 'Ocorreu um erro inesperado. Tente novamente.';
}