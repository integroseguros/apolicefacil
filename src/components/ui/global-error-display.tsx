'use client'

import { useErrorContext } from '@/contexts/ErrorContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, X, WifiOff } from 'lucide-react';
import { useState } from 'react';

export function GlobalErrorDisplay() {
    const { errors, isOnline, retry, canRetry, removeError, getRetryCount } = useErrorContext();
    const [collapsed, setCollapsed] = useState(false);

    const errorEntries = Array.from(errors.entries());

    if (!isOnline) {
        return (
            <Alert variant="destructive" className="mb-4">
                <WifiOff className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                    <span>Você está offline. Algumas funcionalidades podem não funcionar.</span>
                </AlertDescription>
            </Alert>
        );
    }

    if (errorEntries.length === 0) {
        return null;
    }

    if (collapsed) {
        return (
            <div className="mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCollapsed(false)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {errorEntries.length} erro{errorEntries.length > 1 ? 's' : ''} ativo{errorEntries.length > 1 ? 's' : ''}
                </Button>
            </div>
        );
    }

    return (
        <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-red-600">
                    Erros Ativos ({errorEntries.length})
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsed(true)}
                    className="h-6 w-6 p-0"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {errorEntries.map(([key, error]) => (
                <Alert key={key} variant="destructive" className="relative">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{key}</span>
                                <Badge variant="outline" className="text-xs">
                                    Tentativa {getRetryCount(key)}
                                </Badge>
                            </div>
                            <p className="text-sm">{error.message}</p>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                            {canRetry(key) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => retry(key, () => window.location.reload())}
                                    className="h-8"
                                >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Tentar
                                </Button>
                            )}

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeError(key)}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            ))}
        </div>
    );
}