'use client'

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OfflineBanner() {
    const { isOnline, wasOffline } = useOnlineStatus();
    const [showRecoveryMessage, setShowRecoveryMessage] = useState(false);

    useEffect(() => {
        if (isOnline && wasOffline) {
            setShowRecoveryMessage(true);
            const timer = setTimeout(() => {
                setShowRecoveryMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, wasOffline]);

    if (showRecoveryMessage) {
        return (
            <Alert className="border-green-200 bg-green-50 text-green-800 mb-4">
                <Wifi className="h-4 w-4 text-green-600" />
                <AlertDescription>
                    Conexão restaurada! Você está online novamente.
                </AlertDescription>
            </Alert>
        );
    }

    if (!isOnline) {
        return (
            <Alert variant="destructive" className="mb-4">
                <WifiOff className="h-4 w-4" />
                <AlertDescription>
                    Você está offline. Algumas funcionalidades podem não estar disponíveis.
                    Verifique sua conexão com a internet.
                </AlertDescription>
            </Alert>
        );
    }

    return null;
}