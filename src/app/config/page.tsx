// app/configuracoes/page.tsx
'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import {
    Settings,
    MessageSquare,
    Users,
    Building,
    Database,
    Webhook,
    Mail,
    Lock,
    Filter,
    SatelliteDish,
    PersonStanding
} from 'lucide-react';

export default function ConfiguracoesPage() {
    const configItems = [
        {
            title: 'Canais de Comunicação',
            description: 'Configure os canais de comunicação utilizados pela corretora.',
            icon: <MessageSquare className="h-8 w-8 text-blue-500" />,
            href: '/config/canais'
        },
        {
            title: 'Usuários',
            description: 'Gerencie usuários e permissões de acesso ao sistema.',
            icon: <Users className="h-8 w-8 text-indigo-500" />,
            href: '/config/usuarios'
        },
        {
            title: 'Corretora',
            description: 'Configure informações da corretora e filiais.',
            icon: <Building className="h-8 w-8 text-green-500" />,
            href: '/config/corretora'
        },
        {
            title: 'Produtos, Coberturas e Seguradoras',
            description: 'Configurações de Produtos, Coberturas e Seguradoras.',
            icon: <Lock className="h-8 w-8 text-violet-500" />,
            href: '/config/seguradoras-produtos'
        },
        {
            title: 'Produtores',
            description: 'Configure produtores, níveis de produtor e regras de comissão.',
            icon: <PersonStanding className="h-8 w-8 text-red-500" />,
            href: '/config/produtores'
        },
        {
            title: 'Integração',
            description: 'Configure integrações com seguradoras e serviços externos.',
            icon: <Webhook className="h-8 w-8 text-purple-500" />,
            href: '/config/integracoes'
        },
        {
            title: 'E-mail',
            description: 'Configure servidores e modelos de e-mail.',
            icon: <Mail className="h-8 w-8 text-orange-500" />,
            href: '/config/emails'
        },
        {
            title: 'Dados do Sistema',
            description: 'Configurações gerais e gerenciamento de dados.',
            icon: <Database className="h-8 w-8 text-teal-500" />,
            href: '/config/dados'
        },
        {
            title: 'Funis de Venda',
            description: 'Altere, inclua ou exclua Funis de Venda.',
            icon: <Filter className="h-8 w-8 text-teal-500" />,
            href: '/config/crm/funis'
        },
        {
            title: 'Conexões',
            description: 'Gerencie conexões com WhatsApp, APIs e serviços externos.',
            icon: <SatelliteDish className="h-8 w-8 text-violet-500" />,
            href: '/config/conexoes'
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