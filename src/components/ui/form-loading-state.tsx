'use client'

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

interface FormLoadingStateProps {
    isLoading?: boolean;
    error?: Error | null;
    onRetry?: () => void;
    loadingText?: string;
    children: React.ReactNode;
}

export function FormLoadingState({
    isLoading = false,
    error = null,
    onRetry,
    loadingText = 'Carregando...',
    children
}: FormLoadingStateProps) {
    if (error) {
        return (
            <div className="space-y-4">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>{error.message}</span>
                        {onRetry && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onRetry}
                                className="ml-4"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Tentar Novamente
                            </Button>
                        )}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-center py-8">
                    <div className="text-center space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="text-sm text-muted-foreground">{loadingText}</p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export function FormFieldSkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
}

export function FormSkeleton({ fields = 3 }: { fields?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: fields }).map((_, i) => (
                <FormFieldSkeleton key={i} />
            ))}
            <div className="flex gap-2 pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-20" />
            </div>
        </div>
    );
}

interface SubmitButtonProps {
    isSubmitting: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    loadingText?: string;
    className?: string;
}

export function SubmitButton({
    isSubmitting,
    disabled = false,
    children,
    loadingText = 'Salvando...',
    className
}: SubmitButtonProps) {
    return (
        <Button
            type="submit"
            disabled={isSubmitting || disabled}
            className={className}
        >
            {isSubmitting ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {loadingText}
                </>
            ) : (
                children
            )}
        </Button>
    );
}