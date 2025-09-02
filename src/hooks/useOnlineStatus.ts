'use client'

import { useState, useEffect } from 'react';

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        // Check initial online status
        if (typeof navigator !== 'undefined') {
            setIsOnline(navigator.onLine);
        }

        const handleOnline = () => {
            setIsOnline(true);
            if (wasOffline) {
                // Show recovery message
                console.log('Connection restored');
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }
    }, [wasOffline]);

    return { isOnline, wasOffline };
}