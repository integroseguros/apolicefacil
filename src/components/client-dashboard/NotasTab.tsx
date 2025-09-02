'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText } from 'lucide-react';
import { useActivities } from '@/hooks/useActivities';

interface NotasTabProps {
    customerId: string;
    customerName: string;
}

export default function NotasTab({
    customerId
}: NotasTabProps & {
    customerId: string;
    customerName: string;

}) {

    // Use React Query to fetch activities with real-time updates
    const { data: isLoading, error } = useActivities({
        customerId
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Notas
                    </CardTitle>
                    <CardDescription>
                        Notas e observações sobre este cliente.
                    </CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Nova Nota
                </Button>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-48">
                <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
                    <h3 className="text-lg font-semibold mb-2">Funcionalidade em desenvolvimento</h3>
                    <p className="text-muted-foreground">
                        O sistema de notas estará disponível em breve.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}