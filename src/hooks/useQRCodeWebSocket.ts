import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { QRCodeStatusUpdate, ConnectionStatusUpdate } from '@/lib/websocket';

interface QRCodeWebSocketOptions {
    instanceName: string;
    onQRCodeStatusUpdate?: (update: QRCodeStatusUpdate) => void;
    onConnectionStatusUpdate?: (update: ConnectionStatusUpdate) => void;
    onQRCodeGenerated?: (update: QRCodeStatusUpdate) => void;
    onQRCodeExpired?: (update: QRCodeStatusUpdate) => void;
    onQRCodeUsed?: (update: QRCodeStatusUpdate) => void;
    onConnectionSuccess?: (update: ConnectionStatusUpdate) => void;
    onExpirationWarning?: (data: { instanceName: string; timeRemaining: number; timestamp: Date }) => void;
    onError?: (error: Error) => void;
    enablePollingFallback?: boolean;
    pollingInterval?: number;
}

interface QRCodeWebSocketState {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    lastUpdate: Date | null;
    connectionAttempts: number;
}

export function useQRCodeWebSocket(options: QRCodeWebSocketOptions) {
    const {
        instanceName,
        onQRCodeStatusUpdate,
        onConnectionStatusUpdate,
        onQRCodeGenerated,
        onQRCodeExpired,
        onQRCodeUsed,
        onConnectionSuccess,
        onExpirationWarning,
        onError,
        enablePollingFallback = true,
        pollingInterval = 3000,
    } = options;

    const socketRef = useRef<Socket | null>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const maxReconnectAttempts = 5;
    const reconnectDelay = 2000;

    const [state, setState] = useState<QRCodeWebSocketState>({
        isConnected: false,
        isConnecting: false,
        error: null,
        lastUpdate: null,
        connectionAttempts: 0,
    });

    // Função para iniciar polling como fallback
    const startPollingFallback = useCallback(async () => {
        if (!enablePollingFallback || pollingIntervalRef.current) return;

        console.log(`Starting polling fallback for instance ${instanceName}`);

        const pollStatus = async () => {
            try {
                const response = await fetch(`/api/whatsapp/connection/status/${instanceName}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && onConnectionStatusUpdate) {
                        onConnectionStatusUpdate({
                            instanceName,
                            status: data.data.status,
                            lastStatusCheck: new Date(data.data.lastStatusCheck),
                            connectionDetails: data.data.connectionDetails,
                            errorMessage: data.data.errorMessage,
                        });
                    }
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        };

        // Poll imediatamente e depois em intervalos
        await pollStatus();
        pollingIntervalRef.current = setInterval(pollStatus, pollingInterval);
    }, [instanceName, enablePollingFallback, pollingInterval, onConnectionStatusUpdate]);

    // Função para parar polling
    const stopPollingFallback = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
            console.log(`Stopped polling fallback for instance ${instanceName}`);
        }
    }, [instanceName]);

    // Função para conectar WebSocket
    const connectWebSocket = useCallback(() => {
        if (socketRef.current?.connected) return;

        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        try {
            const socket = io({
                path: '/socket.io',
                transports: ['websocket', 'polling'],
                timeout: 10000,
                reconnection: true,
                reconnectionAttempts: maxReconnectAttempts,
            });

            socketRef.current = socket;

            // Event listeners para conexão
            socket.on('connect', () => {
                console.log(`WebSocket connected for QR Code instance ${instanceName}`);
                setState(prev => ({
                    ...prev,
                    isConnected: true,
                    isConnecting: false,
                    error: null,
                    connectionAttempts: 0,
                }));

                // Entrar nas salas específicas
                socket.emit('join-qrcode-room', instanceName);
                socket.emit('join-connection-status-room', instanceName);

                // Parar polling fallback se WebSocket conectou
                stopPollingFallback();
            });

            socket.on('disconnect', (reason) => {
                console.log(`WebSocket disconnected for instance ${instanceName}:`, reason);
                setState(prev => ({
                    ...prev,
                    isConnected: false,
                    isConnecting: false,
                }));

                // Iniciar polling fallback se WebSocket desconectou
                if (enablePollingFallback) {
                    startPollingFallback();
                }
            });

            socket.on('connect_error', (error) => {
                console.error(`WebSocket connection error for instance ${instanceName}:`, error);
                setState(prev => ({
                    ...prev,
                    isConnected: false,
                    isConnecting: false,
                    error: error.message,
                    connectionAttempts: prev.connectionAttempts + 1,
                }));

                if (onError) {
                    onError(error);
                }

                // Iniciar polling fallback se WebSocket falhou
                if (enablePollingFallback) {
                    startPollingFallback();
                }
            });

            // Event listeners específicos do QR Code
            socket.on('qrcode-status-update', (update: QRCodeStatusUpdate) => {
                console.log(`QR Code status update for ${instanceName}:`, update);
                setState(prev => ({ ...prev, lastUpdate: new Date() }));
                if (onQRCodeStatusUpdate) {
                    onQRCodeStatusUpdate(update);
                }
            });

            socket.on('qrcode-generated', (update: QRCodeStatusUpdate) => {
                console.log(`QR Code generated for ${instanceName}:`, update);
                setState(prev => ({ ...prev, lastUpdate: new Date() }));
                if (onQRCodeGenerated) {
                    onQRCodeGenerated(update);
                }
            });

            socket.on('qrcode-used', (update: QRCodeStatusUpdate) => {
                console.log(`QR Code used for ${instanceName}:`, update);
                setState(prev => ({ ...prev, lastUpdate: new Date() }));
                if (onQRCodeUsed) {
                    onQRCodeUsed(update);
                }
            });

            socket.on('qrcode-expiration-warning', (data) => {
                console.log(`QR Code expiration warning for ${instanceName}:`, data);
                if (onExpirationWarning) {
                    onExpirationWarning(data);
                }
            });

            socket.on('connection-status-update', (update: ConnectionStatusUpdate) => {
                console.log(`Connection status update for ${instanceName}:`, update);
                setState(prev => ({ ...prev, lastUpdate: new Date() }));
                if (onConnectionStatusUpdate) {
                    onConnectionStatusUpdate(update);
                }
            });

            socket.on('connection-success', (update: ConnectionStatusUpdate) => {
                console.log(`Connection success for ${instanceName}:`, update);
                setState(prev => ({ ...prev, lastUpdate: new Date() }));
                if (onConnectionSuccess) {
                    onConnectionSuccess(update);
                }
            });

        } catch (error) {
            console.error(`Failed to create WebSocket for instance ${instanceName}:`, error);
            setState(prev => ({
                ...prev,
                isConnecting: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            }));

            if (onError && error instanceof Error) {
                onError(error);
            }

            // Iniciar polling fallback se WebSocket falhou completamente
            if (enablePollingFallback) {
                startPollingFallback();
            }
        }
    }, [
        instanceName,
        onQRCodeStatusUpdate,
        onConnectionStatusUpdate,
        onQRCodeGenerated,
        onQRCodeExpired,
        onQRCodeUsed,
        onConnectionSuccess,
        onExpirationWarning,
        onError,
        enablePollingFallback,
        startPollingFallback,
        stopPollingFallback
    ]);

    // Função para desconectar WebSocket
    const disconnectWebSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.emit('leave-qrcode-room', instanceName);
            socketRef.current.emit('leave-connection-status-room', instanceName);
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        stopPollingFallback();

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        setState({
            isConnected: false,
            isConnecting: false,
            error: null,
            lastUpdate: null,
            connectionAttempts: 0,
        });
    }, [instanceName, stopPollingFallback]);

    // Função para reconectar manualmente
    const reconnect = useCallback(() => {
        disconnectWebSocket();
        setTimeout(connectWebSocket, 1000);
    }, [disconnectWebSocket, connectWebSocket]);

    // Efeito para conectar/desconectar
    useEffect(() => {
        connectWebSocket();

        return () => {
            disconnectWebSocket();
        };
    }, [connectWebSocket, disconnectWebSocket]);

    // Cleanup ao desmontar
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);

    return {
        ...state,
        connect: connectWebSocket,
        disconnect: disconnectWebSocket,
        reconnect,
        isPollingFallbackActive: pollingIntervalRef.current !== null,
    };
}