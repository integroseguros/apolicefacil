'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    PlusCircle,
    FileText,
    DollarSign,
    Search,
    Filter,
    AlertTriangle,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Download,
    RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface PolicyForTab {
    id: string;
    document: string;
    proposalNumber: string;
    proposalDate?: string | null;
    policyNumber: string | null;
    issueDate: string | null;
    situationDocument: string;
    renewal: string;
    tipoRenewal?: string;
    previousPolicy?: string;
    previousInsuranceCompany?: string;
    source?: string;
    paymentMethod?: string;
    liquidPrize?: number | null;
    totalPrize?: number | null;
    iof?: number | null;
    commissionValue?: number | null;
    product?: {
        id: string;
        name: string;
        code: string;
    } | null;
    branch?: {
        id: string;
        name: string;
        code: string;
    } | null;
    insuranceCompany?: {
        id: string;
        name: string;
        susep?: string;
    } | null;
}

interface ApolicesTabProps {
    customerId: string;
    policies: PolicyForTab[];
}

function getStatusBadge(situationDocument: string, policyNumber?: string | null) {
    const statusMap: Record<string, {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        icon: React.ComponentType<{ className?: string }>;
        color: string;
    }> = {
        '1': {
            label: policyNumber ? 'Aguardando Emissão' : 'Proposta - Em Análise',
            variant: 'outline',
            icon: Clock,
            color: 'text-yellow-600'
        },
        '2': { label: 'Aprovada', variant: 'default', icon: CheckCircle, color: 'text-green-600' },
        '3': { label: 'Recusada', variant: 'destructive', icon: XCircle, color: 'text-red-600' },
        '4': { label: 'Apólice Emitida', variant: 'default', icon: CheckCircle, color: 'text-blue-600' },
        '5': { label: 'Cancelada', variant: 'secondary', icon: XCircle, color: 'text-gray-600' },
    };

    return statusMap[situationDocument] || {
        label: 'Desconhecido',
        variant: 'outline' as const,
        icon: AlertTriangle,
        color: 'text-gray-500'
    };
}

function isRenewalDue(issueDate: string | null, renewal: string): boolean {
    if (!issueDate || renewal !== '1') return false;

    try {
        const issue = new Date(issueDate.includes('/') ?
            issueDate.split('/').reverse().join('-') : issueDate);
        const renewalDate = new Date(issue);
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);

        const today = new Date();
        const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return daysUntilRenewal <= 60 && daysUntilRenewal >= 0;
    } catch {
        return false;
    }
}

function getRenewalAlert(issueDate: string | null, renewal: string): { show: boolean; days: number; urgent: boolean } {
    if (!issueDate || renewal !== '1') return { show: false, days: 0, urgent: false };

    try {
        const issue = new Date(issueDate.includes('/') ?
            issueDate.split('/').reverse().join('-') : issueDate);
        const renewalDate = new Date(issue);
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);

        const today = new Date();
        const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilRenewal <= 60 && daysUntilRenewal >= 0) {
            return { show: true, days: daysUntilRenewal, urgent: daysUntilRenewal <= 30 };
        }

        return { show: false, days: daysUntilRenewal, urgent: false };
    } catch {
        return { show: false, days: 0, urgent: false };
    }
}

function formatCurrency(value: number | null | undefined): string {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString: string | null | undefined | Date): string {
    if (!dateString) return 'N/A';

    // Se é um objeto Date, converte diretamente
    if (dateString instanceof Date) {
        return dateString.toLocaleDateString('pt-BR');
    }

    // Se é string, verifica o formato
    if (typeof dateString === 'string') {
        // Se já está no formato DD/MM/YYYY, retorna como está
        if (dateString.includes('/')) return dateString;

        // Se está no formato ISO, converte
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        } catch {
            return dateString;
        }
    }

    return 'N/A';
}

export default function ApolicesTab({ customerId, policies }: ApolicesTabProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');



    // Filtrar e buscar apólices
    const filteredPolicies = useMemo(() => {
        if (!policies || policies.length === 0) return [];

        return policies.filter(policy => {
            const matchesSearch = searchTerm === '' ||
                policy.proposalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                policy.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                policy.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                policy.insuranceCompany?.name.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesStatus = true;
            if (statusFilter === 'proposals') {
                matchesStatus = !policy.policyNumber; // Propostas não têm número de apólice
            } else if (statusFilter === 'policies') {
                matchesStatus = !!policy.policyNumber; // Apólices têm número de apólice
            } else if (statusFilter !== 'all') {
                matchesStatus = policy.situationDocument === statusFilter;
            }

            return matchesSearch && matchesStatus;
        });
    }, [policies, searchTerm, statusFilter]);

    // Calcular estatísticas
    const stats = useMemo(() => {
        if (!policies || policies.length === 0) {
            return { total: 0, proposals: 0, active: 0, pending: 0, renewalsDue: 0, totalPremium: 0 };
        }

        const total = policies.length;
        const proposals = policies.filter(p => !p.policyNumber).length; // Propostas (sem número de apólice)
        const active = policies.filter(p => p.situationDocument === '4' && p.policyNumber).length; // Apólices emitidas
        const pending = policies.filter(p => p.situationDocument === '1').length; // Em análise
        const renewalsDue = policies.filter(p => isRenewalDue(p.issueDate, p.renewal)).length;
        const totalPremium = policies.reduce((sum, policy) => sum + (policy.totalPrize || 0), 0);

        return { total, proposals, active, pending, renewalsDue, totalPremium };
    }, [policies]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Apólices & Propostas
                    </CardTitle>
                    <CardDescription>
                        Gerencie todas as apólices e propostas associadas a este cliente.
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Atualizar
                    </Button>
                    <Button size="sm" className="gap-2" asChild>
                        <Link href={`/apolices/nova?customerId=${customerId}`}>
                            <PlusCircle className="h-4 w-4" />
                            Nova Proposta
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {policies && policies.length > 0 ? (
                    <div className="space-y-6">
                        {/* Alertas de Renovação */}
                        {stats.renewalsDue > 0 && (
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>{stats.renewalsDue}</strong> apólice{stats.renewalsDue > 1 ? 's' : ''}
                                    {stats.renewalsDue > 1 ? ' precisam' : ' precisa'} de renovação nos próximos 60 dias.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Cartões de Resumo Aprimorados */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Total</p>
                                            <p className="text-2xl font-bold">{stats.total}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-orange-600" />
                                        <div>
                                            <p className="text-sm font-medium">Propostas</p>
                                            <p className="text-2xl font-bold text-orange-600">{stats.proposals}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium">Apólices Ativas</p>
                                            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-yellow-600" />
                                        <div>
                                            <p className="text-sm font-medium">Em Análise</p>
                                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Prêmio Total</p>
                                            <p className="text-lg font-bold">
                                                {formatCurrency(stats.totalPremium)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filtros e Busca */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por número da proposta, apólice, produto ou seguradora..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Filtrar por status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os Status</SelectItem>
                                        <SelectItem value="proposals">Apenas Propostas</SelectItem>
                                        <SelectItem value="policies">Apenas Apólices</SelectItem>
                                        <SelectItem value="1">Em Análise</SelectItem>
                                        <SelectItem value="2">Aprovada</SelectItem>
                                        <SelectItem value="3">Recusada</SelectItem>
                                        <SelectItem value="4">Emitida</SelectItem>
                                        <SelectItem value="5">Cancelada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator />

                        {/* Tabela de Apólices Aprimorada */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Produto</TableHead>
                                        <TableHead>Seguradora</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Nº Proposta</TableHead>
                                        <TableHead>Nº Apólice</TableHead>
                                        <TableHead>Prêmio</TableHead>
                                        <TableHead>Data Emissão</TableHead>
                                        <TableHead>Renovação</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPolicies.length > 0 ? (
                                        filteredPolicies.map(policy => {
                                            const status = getStatusBadge(policy.situationDocument, policy.policyNumber);
                                            const StatusIcon = status.icon;
                                            const renewalAlert = getRenewalAlert(policy.issueDate, policy.renewal);

                                            return (
                                                <TableRow key={policy.id}>
                                                    <TableCell>
                                                        <Badge
                                                            variant={policy.policyNumber ? "default" : "secondary"}
                                                            className="text-xs"
                                                        >
                                                            {policy.policyNumber ? "Apólice" : "Proposta"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {policy.product?.name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {policy.insuranceCompany?.name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={status.variant} className="gap-1">
                                                            <StatusIcon className="h-3 w-3" />
                                                            {status.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">
                                                        {policy.proposalNumber}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">
                                                        {policy.policyNumber || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatCurrency(policy.totalPrize)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(policy.issueDate)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {policy.renewal === '1' ? (
                                                                <>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        Renovável
                                                                    </Badge>
                                                                    {renewalAlert.show && (
                                                                        <Badge
                                                                            variant={renewalAlert.urgent ? "destructive" : "secondary"}
                                                                            className="text-xs gap-1"
                                                                        >
                                                                            <AlertTriangle className="h-3 w-3" />
                                                                            {renewalAlert.days}d
                                                                        </Badge>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Não renovável
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                title="Visualizar detalhes"
                                                                asChild
                                                            >
                                                                <Link href={`/apolices/${policy.id}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            {!policy.policyNumber && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 text-blue-600"
                                                                    title="Emitir Apólice"
                                                                    asChild
                                                                >
                                                                    <Link href={`/apolices/${policy.id}/emitir`}>
                                                                        <FileText className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                title="Baixar documentos"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                                {searchTerm || statusFilter !== 'all'
                                                    ? 'Nenhuma apólice ou proposta encontrada com os filtros aplicados.'
                                                    : 'Nenhuma apólice ou proposta encontrada.'
                                                }
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Ações Rápidas */}
                        {filteredPolicies.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-sm font-medium mb-3">Ações Rápidas</h4>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Download className="h-4 w-4" />
                                        Exportar Lista
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <FileText className="h-4 w-4" />
                                        Relatório de Apólices
                                    </Button>
                                    {stats.renewalsDue > 0 && (
                                        <Button variant="outline" size="sm" className="gap-2 text-orange-600 border-orange-200">
                                            <AlertTriangle className="h-4 w-4" />
                                            Gerenciar Renovações ({stats.renewalsDue})
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <FileText className="h-16 w-16 text-muted-foreground mb-6" />
                        <h3 className="text-xl font-semibold mb-2">Nenhuma apólice encontrada</h3>
                        <p className="text-muted-foreground mb-6 max-w-md">
                            Este cliente ainda não possui apólices ou propostas cadastradas.
                            Comece criando uma nova proposta ou importando dados existentes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button asChild>
                                <Link href={`/apolices/nova?customerId=${customerId}`}>
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Criar Nova Proposta
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/apolices">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Ver Todas as Apólices
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}