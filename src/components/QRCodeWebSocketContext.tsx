'use client';

import React, { createContext, useContext, useCallback, useRef } from 'react';
import { useQRCodeWebSocket } from '@/hooks/useQRCodeWebSocket';
import { QRCodeStatusUpdate, ConnectionStatusUpdate } from '@/lib/websocket';

interface QRCodeWebSocketContextType {
    // Função para criar uma nova conexão WebSocket para uma instância
    createConnection: (instanceName: string, callbacks?: QRCodeWebSocketCallbacks) => QRCodeWebSocketConnection;

    // Função para remover uma conexão
    removeConnection: (instanceName: string) => void;

    // Função para verificar se uma conexão existe
    hasConnection: (instanceName: string) => boolean;

    // Função para obter estatísticas globais
    getGlobalStats: () => {
        totalConnections: number;
        connectedInstances: string[];
        disconnectedInstances: string[];
    };
}

interface QRCodeWebSocketCallbacks {
    onQRCodeStatusUpdate?: (update: QRCodeStatusUpdate) => void;
    onConnectionStatusUpdate?: (update: ConnectionStatusUpdate) => void;
    onQRCodeGenerated?: (update: QRCodeStatusUpdate) => void;
    onQRCodeExpired?: (update: QRCodeStatusUpdate) => void;
    onQRCodeUsed?: (update: QRCodeStatusUpdate) => void;
    onConnectionSuccess?: (update: ConnectionStatusUpdate) => void;
    onExpirationWarning?: (data: { instanceName: string; timeRemaining: number; timestamp: Date }) => void;
    onError?: (error: Error) => void;
}

interface QRCodeWebSocketConnection {
    instanceName: string;
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    lastUpdate: Date | null;
    connectionAttempts: number;
    isPollingFallbackActive: boolean;
    connect: () => void;
    disconnect: () => void;
    reconnect: () => void;
}

const QRCodeWebSocketContext = createContext<QRCodeWebSocketContextType | null>(null);

export function QRCodeWebSocketProvider({ children }: { children: React.ReactNode }) {
    const connectionsRef = useRef<Map<string, QRCodeWebSocketConnection>>(new Map());

    const createConnection = useCallback((instanceName: string, callbacks: QRCodeWebSocketCallbacks = {}) => {
        // Se já existe uma conexão, retornar a existente
        const existingConnection = connectionsRef.current.get(instanceName);
        if (existingConnection) {
            return existingConnection;
        }

        // Criar nova conexão usando o hook
        const connection = {
            instanceName,
            isConnected: false,
            isConnecting: false,
            error: null,
            lastUpdate: null,
            connectionAttempts: 0,
            isPollingFallbackActive: false,
            connect: () => { },
            disconnect: () => { },
            reconnect: () => { },
        };

        connectionsRef.current.set(instanceName, connection);
        return connection;
    }, []);

    const removeConnection = useCallback((instanceName: string) => {
        const connection = connectionsRef.current.get(instanceName);
        if (connection) {
            connection.disconnect();
            connectionsRef.current.delete(instanceName);
        }
    }, []);

    const hasConnection = useCallback((instanceName: string) => {
        return connectionsRef.current.has(instanceName);
    }, []);

    const getGlobalStats = useCallback(() => {
        const connections = Array.from(connectionsRef.current.values());
        return {
            totalConnections: connections.length,
            connectedInstances: connections
                .filter(conn => conn.isConnected)
                .map(conn => conn.instanceName),
            disconnectedInstances: connections
                .filter(conn => !conn.isConnected)
                .map(conn => conn.instanceName),
        };
    }, []);

    const contextValue: QRCodeWebSocketContextType = {
        createConnection,
        removeConnection,
        hasConnection,
        getGlobalStats,
    };

    return (
        <QRCodeWebSocketContext.Provider value={contextValue}>
            {children}
        </QRCodeWebSocketContext.Provider>
    );
}

export function useQRCodeWebSocketContext() {
    const context = useContext(QRCodeWebSocketContext);
    if (!context) {
        throw new Error('useQRCodeWebSocketContext must be used within a QRCodeWebSocketProvider');
    }
    return context;
}

// Hook simplificado para usar WebSocket em componentes específicos
export function useQRCodeWebSocketConnection(instanceName: string, callbacks?: QRCodeWebSocketCallbacks) {
    const webSocketState = useQRCodeWebSocket({
        instanceName,
        ...callbacks,
    });

    return webSocketState;
}