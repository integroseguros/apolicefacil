'use client';

import { useState, Suspense, lazy } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { TabLoadingState, TabErrorState } from './TabLoadingState';

// Lazy load tab components for better performance
const AtividadesTab = lazy(() => import('./AtividadesTab'));
const NotasTab = lazy(() => import('./NotasTab'));
const EnderecosTab = lazy(() => import('./EnderecosTab'));
const TelefonesTab = lazy(() => import('./TelefonesTab'));
const ContatosTab = lazy(() => import('./ContatosTab'));
const OportunidadesTab = lazy(() => import('./OportunidadesTab'));
const ApolicesTab = lazy(() => import('./ApolicesTab'));
const ArquivosTab = lazy(() => import('./ArquivosTab'));
const SinistrosTab = lazy(() => import('./SinistrosTab'));

interface ClientTabsProps {
    customerId: string;
    customerName: string;
    policies?: any[];
    opportunities?: any[];
    phones?: any[];
    addresses?: any[];
    contacts?: any[];
    activities?: any[];
    claims?: any[];
}

// Loading skeleton component for tab content
function TabLoadingSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </CardContent>
        </Card>
    );
}

// Coming soon placeholder for tabs not yet implemented
function ComingSoonTab({ title }: { title: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>Funcionalidade em desenvolvimento.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-48">
                <p className="text-muted-foreground">Em breve</p>
            </CardContent>
        </Card>
    );
}

export function ClientTabs({
    customerId,
    customerName,
    policies = [],
    opportunities = [],
    phones = [],
    addresses = [],
    contacts = [],
    activities = [],
    claims = []
}: ClientTabsProps) {
    const [activeTab, setActiveTab] = useState('atividades');
    const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(['atividades']));
    const [phonesData, setPhonesData] = useState(phones);
    const [contactsData, setContactsData] = useState(contacts);

    // Track which tabs have been loaded for lazy loading
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setLoadedTabs(prev => new Set([...prev, value]));
    };

    // Function to refresh phones data
    const refreshPhones = async () => {
        try {
            const response = await fetch(`/api/customers/${customerId}/phones`);
            if (response.ok) {
                const updatedPhones = await response.json();
                setPhonesData(updatedPhones);
            }
        } catch (error) {
            console.error('Error refreshing phones:', error);
        }
    };

    // Function to refresh contacts data
    const refreshContacts = async () => {
        try {
            const response = await fetch(`/api/customers/${customerId}/contacts`);
            if (response.ok) {
                const updatedContacts = await response.json();
                setContactsData(updatedContacts);
            }
        } catch (error) {
            console.error('Error refreshing contacts:', error);
        }
    };

    const tabConfig = [
        { value: 'atividades', label: 'Atividades', component: AtividadesTab },
        { value: 'notas', label: 'Notas', component: NotasTab },
        { value: 'enderecos', label: 'Endereços', component: EnderecosTab },
        { value: 'telefones', label: 'Telefones', component: TelefonesTab },
        { value: 'contatos', label: 'Contatos', component: ContatosTab },
        { value: 'oportunidades', label: 'Oportunidades', component: OportunidadesTab },
        { value: 'apolices', label: 'Apólices', component: ApolicesTab },
        { value: 'arquivos', label: 'Arquivos', component: ArquivosTab },
        { value: 'sinistros', label: 'Sinistros', component: SinistrosTab },
    ];

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 lg:w-auto">
                {tabConfig.map(tab => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="text-xs lg:text-sm"
                    >
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>

            {tabConfig.map(tab => (
                <TabsContent key={tab.value} value={tab.value}>
                    {loadedTabs.has(tab.value) ? (
                        <ErrorBoundary
                            fallback={
                                <TabErrorState
                                    title={tab.label}
                                    error={new Error('Erro ao carregar conteúdo')}
                                    onRetry={() => window.location.reload()}
                                />
                            }
                        >
                            <Suspense fallback={<TabLoadingState title={tab.label} />}>
                                {tab.value === 'atividades' && (
                                    <AtividadesTab
                                        customerId={customerId}
                                        customerName={customerName}
                                        activities={activities}
                                    />
                                )}
                                {tab.value === 'notas' && (
                                    <NotasTab
                                        customerId={customerId}
                                        customerName={customerName}
                                    />
                                )}
                                {tab.value === 'enderecos' && (
                                    <EnderecosTab
                                        customerId={customerId}
                                    />
                                )}
                                {tab.value === 'telefones' && (
                                    <TelefonesTab
                                        customerId={customerId}
                                        phones={phonesData}
                                        onRefresh={refreshPhones}
                                    />
                                )}
                                {tab.value === 'contatos' && (
                                    <ContatosTab
                                        customerId={customerId}
                                        contacts={contactsData}
                                        onRefresh={refreshContacts}
                                    />
                                )}
                                {tab.value === 'oportunidades' && (
                                    <OportunidadesTab
                                        customerId={customerId}
                                        customerName={customerName}
                                        opportunities={opportunities}
                                    />
                                )}
                                {tab.value === 'apolices' && (
                                    <ApolicesTab
                                        customerId={customerId}
                                        policies={policies}
                                    />
                                )}
                                {tab.value === 'arquivos' && (
                                    <ArquivosTab
                                        customerId={customerId}
                                    />
                                )}
                                {tab.value === 'sinistros' && (
                                    <SinistrosTab
                                        customerId={customerId}
                                        claims={claims}
                                    />
                                )}
                            </Suspense>
                        </ErrorBoundary>
                    ) : (
                        <TabLoadingState title={tab.label} />
                    )}
                </TabsContent>
            ))}
        </Tabs>
    );
}