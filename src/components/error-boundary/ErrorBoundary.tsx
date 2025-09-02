'use client'

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ errorInfo });

        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex items-center justify-center min-h-[400px] p-6">
                    <div className="max-w-md w-full">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Ops! Algo deu errado</AlertTitle>
                            <AlertDescription className="mt-2">
                                Ocorreu um erro inesperado. Por favor, tente novamente ou entre em contato com o suporte se o problema persistir.
                            </AlertDescription>
                        </Alert>

                        <div className="mt-4 flex gap-2">
                            <Button
                                onClick={this.handleRetry}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Tentar Novamente
                            </Button>

                            <Button
                                onClick={() => window.location.reload()}
                                variant="default"
                            >
                                Recarregar Página
                            </Button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4 p-4 bg-gray-100 rounded-md text-sm">
                                <summary className="cursor-pointer font-medium">
                                    Detalhes do erro (desenvolvimento)
                                </summary>
                                <pre className="mt-2 whitespace-pre-wrap text-xs">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}