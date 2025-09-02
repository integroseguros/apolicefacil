'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from "@/components/ui/sonner";
import { PropostaProvider } from '@/contexts/PropostaContext';
import { UserProvider } from '@/contexts/UserContext';
import { ErrorProvider } from '@/contexts/ErrorContext';
import { QuoteProvider } from '@/contexts/QuoteContext';
import { ThemeProvider } from "@/components/theme-provider";
import { QRCodeWebSocketProvider } from '@/contexts/QRCodeWebSocketContext';

export function Providers({ children }: { children: React.ReactNode }) {
    // Cria uma instância do QueryClient com configurações de error handling
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                retry: (failureCount, error) => {
                    // Don't retry on 4xx errors (client errors)
                    if (error instanceof Error && error.message.includes('4')) {
                        return false;
                    }
                    // Retry up to 3 times for other errors
                    return failureCount < 3;
                },
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
                staleTime: 5 * 60 * 1000, // 5 minutes
                gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
                refetchOnWindowFocus: false,

            },
            mutations: {
                retry: (failureCount, error) => {
                    // Don't retry mutations on client errors
                    if (error instanceof Error && error.message.includes('4')) {
                        return false;
                    }
                    return failureCount < 2;
                },

            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <QuoteProvider>
                <ErrorProvider>
                    <UserProvider>
                        <PropostaProvider>
                            <QRCodeWebSocketProvider>
                                <ThemeProvider
                                    attribute="class"
                                    defaultTheme="light"
                                    enableSystem={false}
                                    disableTransitionOnChange
                                >
                                    {children}
                                </ThemeProvider>
                            </QRCodeWebSocketProvider>
                        </PropostaProvider>
                    </UserProvider>
                </ErrorProvider>
                <Toaster
                    position="top-right"
                    expand={true}
                    richColors={true}
                    closeButton={true}
                    duration={5000}
                />
                <ReactQueryDevtools initialIsOpen={false} />
            </QuoteProvider>
        </QueryClientProvider>
    );
}

function getErrorMessage(error: Error): string {
    if (error.message.includes('fetch') || error.message.includes('network')) {
        return 'Erro de conexão. Verifique sua internet.';
    }

    if (error.message.includes('404')) {
        return 'Recurso não encontrado.';
    }

    if (error.message.includes('403') || error.message.includes('unauthorized')) {
        return 'Acesso negado.';
    }

    if (error.message.includes('500')) {
        return 'Erro do servidor. Tente novamente.';
    }

    return error.message || 'Erro inesperado.';
}