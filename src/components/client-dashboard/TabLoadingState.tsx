'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface TabLoadingStateProps {
    title: string;
    description?: string;
}

export function TabLoadingState({ title, description }: TabLoadingStateProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    {description && <Skeleton className="h-4 w-64" />}
                </div>
                <Skeleton className="h-9 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-64" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-8 w-20" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

interface TabErrorStateProps {
    title: string;
    error: Error;
    onRetry?: () => void;
}

export function TabErrorState({ title, error, onRetry }: TabErrorStateProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <AlertTriangle className="h-12 w-12 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-red-600 mb-2">
                            Erro ao carregar {title.toLowerCase()}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {getErrorMessage(error)}
                        </p>
                    </div>
                    {onRetry && (
                        <Button
                            variant="outline"
                            onClick={onRetry}
                            className="gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Tentar Novamente
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

interface TabEmptyStateProps {
    title: string;
    description: string;
    actionLabel: string;
    onAction?: () => void;
    icon: React.ReactNode;
}

export function TabEmptyState({
    title,
    description,
    actionLabel,
    onAction,
    icon
}: TabEmptyStateProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center h-48 text-center">
                    <div className="mb-4 text-muted-foreground">
                        {icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{title}</h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                        {description}
                    </p>
                    {onAction && (
                        <Button onClick={onAction}>
                            {actionLabel}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function getErrorMessage(error: Error): string {
    if (error.message.includes('fetch') || error.message.includes('network')) {
        return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }

    if (error.message.includes('404')) {
        return 'Dados não encontrados.';
    }

    if (error.message.includes('403') || error.message.includes('unauthorized')) {
        return 'Você não tem permissão para acessar estes dados.';
    }

    if (error.message.includes('500')) {
        return 'Erro interno do servidor. Tente novamente em alguns minutos.';
    }

    return 'Ocorreu um erro inesperado. Tente novamente.';
}