// app/configuracoes/page.tsx
'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import {
    Settings,
    Database,
    Lock
} from 'lucide-react';

export default function ConfiguracoesSeguradorasProdutosPage() {
    const configItems = [
        {
            title: 'Seguradoras',
            description: 'Altere os dados de Seguradoras.',
            icon: <Lock className="h-8 w-8 text-purple-500" />,
            href: '/config/seguradoras-produtos/seguradoras'
        },
        {
            title: 'Produtos e Coberturas',
            description: 'Altere os dados de Produtos e Coberturas.',
            icon: <Database className="h-8 w-8 text-teal-500" />,
            href: '/config/seguradoras-produtos/produtos'
        }
    ];

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center mb-6">
                <Settings className="h-6 w-6 mr-2" />
                <h1 className="text-2xl font-bold">Configurações</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {configItems.map((item, index) => (
                    <Link key={index} href={item.href} className="block">
                        <Card className="h-full hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start">
                                    <div className="mr-4">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium mb-1">{item.title}</h3>
                                        <p className="text-gray-600 text-sm">{item.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}