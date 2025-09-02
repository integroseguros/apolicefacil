'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

interface ErrorState {
    errors: Map<string, Error>;
    isOnline: boolean;
    retryAttempts: Map<string, number>;
}

interface ErrorContextValue {
    errors: Map<string, Error>;
    isOnline: boolean;
    addError: (key: string, error: Error) => void;
    removeError: (key: string) => void;
    clearAllErrors: () => void;
    retry: (key: string, fn: () => Promise<void> | void) => Promise<void>;
    canRetry: (key: string) => boolean;
    getRetryCount: (key: string) => number;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

interface ErrorProviderProps {
    children: ReactNode;
    maxRetries?: number;
}

export function ErrorProvider({ children, maxRetries = 3 }: ErrorProviderProps) {
    const [errorState, setErrorState] = useState<ErrorState>({
        errors: new Map(),
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        retryAttempts: new Map(),
    });

    const addError = useCallback((key: string, error: Error) => {
        setErrorState(prev => {
            const newErrors = new Map(prev.errors);
            newErrors.set(key, error);

            const newRetryAttempts = new Map(prev.retryAttempts);
            const currentAttempts = newRetryAttempts.get(key) || 0;
            newRetryAttempts.set(key, currentAttempts + 1);

            return {
                ...prev,
                errors: newErrors,
                retryAttempts: newRetryAttempts,
            };
        });

        // Show toast notification
        toast.error(getErrorMessage(error), {
            id: key, // Prevent duplicate toasts for the same error
        });
    }, []);

    const removeError = useCallback((key: string) => {
        setErrorState(prev => {
            const newErrors = new Map(prev.errors);
            newErrors.delete(key);

            const newRetryAttempts = new Map(prev.retryAttempts);
            newRetryAttempts.delete(key);

            return {
                ...prev,
                errors: newErrors,
                retryAttempts: newRetryAttempts,
            };
        });

        // Dismiss toast
        toast.dismiss(key);
    }, []);

    const clearAllErrors = useCallback(() => {
        setErrorState(prev => ({
            ...prev,
            errors: new Map(),
            retryAttempts: new Map(),
        }));
    }, []);

    const canRetry = useCallback((key: string) => {
        const attempts = errorState.retryAttempts.get(key) || 0;
        return attempts < maxRetries;
    }, [errorState.retryAttempts, maxRetries]);

    const getRetryCount = useCallback((key: string) => {
        return errorState.retryAttempts.get(key) || 0;
    }, [errorState.retryAttempts]);

    const retry = useCallback(async (key: string, fn: () => Promise<void> | void) => {
        if (!canRetry(key)) {
            toast.error('Número máximo de tentativas excedido');
            return;
        }

        removeError(key);

        try {
            const result = fn();
            if (result instanceof Promise) {
                await result;
            }

            // Success - reset retry count
            setErrorState(prev => {
                const newRetryAttempts = new Map(prev.retryAttempts);
                newRetryAttempts.delete(key);
                return {
                    ...prev,
                    retryAttempts: newRetryAttempts,
                };
            });

            toast.success('Operação realizada com sucesso');
        } catch (error) {
            addError(key, error as Error);
        }
    }, [canRetry, removeError, addError]);

    // Listen for online/offline events
    React.useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleOnline = () => {
            setErrorState(prev => ({ ...prev, isOnline: true }));
            toast.success('Conexão restaurada');
        };

        const handleOffline = () => {
            setErrorState(prev => ({ ...prev, isOnline: false }));
            toast.error('Conexão perdida');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const value: ErrorContextValue = {
        errors: errorState.errors,
        isOnline: errorState.isOnline,
        addError,
        removeError,
        clearAllErrors,
        retry,
        canRetry,
        getRetryCount,
    };

    return (
        <ErrorContext.Provider value={value}>
            {children}
        </ErrorContext.Provider>
    );
}

export function useErrorContext() {
    const context = useContext(ErrorContext);
    if (context === undefined) {
        throw new Error('useErrorContext must be used within an ErrorProvider');
    }
    return context;
}

function getErrorMessage(error: Error): string {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
        return 'Erro de conexão. Verifique sua internet.';
    }

    // Validation errors
    if (error.message.includes('validation')) {
        return 'Dados inválidos fornecidos.';
    }

    // Permission errors
    if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        return 'Acesso negado.';
    }

    // Not found errors
    if (error.message.includes('not found') || error.message.includes('404')) {
        return 'Recurso não encontrado.';
    }

    // Server errors
    if (error.message.includes('500') || error.message.includes('server')) {
        return 'Erro do servidor. Tente novamente.';
    }

    // Default error message
    return error.message || 'Erro inesperado ocorreu.';
}