'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface UserContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Simular autenticação com o primeiro usuário do banco
    // Em produção, isso seria baseado em JWT/session
    const getCurrentUser = async (): Promise<User | null> => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                return data.user;
            }
            return null;
        } catch (error) {
            console.error('Error fetching current user:', error);
            return null;
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        // Em produção, limpar cookies/tokens aqui
    };

    const refreshUser = async () => {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
    };

    useEffect(() => {
        const initializeUser = async () => {
            // Para desenvolvimento, vamos usar o primeiro usuário Admin do banco
            // Em produção, isso seria baseado em autenticação real
            try {
                const response = await fetch('/api/users/current');
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Error initializing user:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeUser();
    }, []);

    return (
        <UserContext.Provider value={{
            user,
            loading,
            login,
            logout,
            refreshUser
        }}>
            {children}
        </UserContext.Provider>
    );
}