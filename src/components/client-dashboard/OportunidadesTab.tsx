'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
    PlusCircle,
    Target,
    DollarSign,
    TrendingUp,
    Calendar,
    User,
    Edit,
    Trash2,
    Search,
    Filter,
    Eye,
    Percent,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { OpportunityForm } from './OpportunityForm';
import { OpportunityTimeline } from './OpportunityTimeline';
import { toast } from 'sonner';

interface Opportunity {
    id: string;
    name: string;
    stage: string;
    value: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user?: {
        id: string;
        name: string;
    } | null;
    product?: {
        id: string;
        name: string;
    } | null;
    customer?: {
        id: string;
        name: string;
        avatarUrl?: string;
    } | null;
}

interface OportunidadesTabProps {
    customerId: string;
    customerName: string;
    opportunities: Opportunity[];
}

function getStageColor(stage: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    const stageMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        'Nova': 'outline',
        'Contactada': 'secondary',
        'Proposta Enviada': 'default',
        'Ganha': 'default',
        'Perdida': 'destructive',
    };

    return stageMap[stage] || 'outline';
}

function getStageIcon(stage: string) {
    const iconMap: Record<string, any> = {
        'Nova': AlertCircle,
        'Contactada': Clock,
        'Proposta Enviada': Target,
        'Ganha': CheckCircle,
        'Perdida': XCircle,
    };

    return iconMap[stage] || Target;
}

function getProbabilityByStage(stage: string): number {
    const probabilityMap: Record<string, number> = {
        'Nova': 10,
        'Contactada': 25,
        'Proposta Enviada': 60,
        'Ganha': 100,
        'Perdida': 0,
    };

    return probabilityMap[stage] || 0;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString: Date | string | undefined): string {
    if (!dateString) return 'N/A';

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    try {
        return date.toLocaleDateString('pt-BR');
    } catch {
        return 'Data inválida';
    }
}

function getStageProgress(stage: string): number {
    const progressMap: Record<string, number> = {
        'Nova': 20,
        'Contactada': 40,
        'Proposta Enviada': 60,
        'Ganha': 100,
        'Perdida': 0,
    };

    return progressMap[stage] || 0;
}

export default function OportunidadesTab({ customerId, customerName, opportunities: initialOpportunities }: OportunidadesTabProps) {
    const [opportunities, setOpportunities] = useState<Opportunity[]>(initialOpportunities);
    const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>(initialOpportunities);
    const [searchTerm, setSearchTerm] = useState('');
    const [stageFilter, setStageFilter] = useState<string>('all');
    const [showForm, setShowForm] = useState(false);
    const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
    const [loading, setLoading] = useState(false);

    // Atualizar oportunidades quando as props mudarem
    useEffect(() => {
        setOpportunities(initialOpportunities);
        setFilteredOpportunities(initialOpportunities);
    }, [initialOpportunities]);

    // Filtrar oportunidades
    useEffect(() => {
        let filtered = opportunities;

        // Filtro por termo de busca
        if (searchTerm) {
            filtered = filtered.filter(opp =>
                opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                opp.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                opp.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro por estágio
        if (stageFilter !== 'all') {
            filtered = filtered.filter(opp => opp.stage === stageFilter);
        }

        setFilteredOpportunities(filtered);
    }, [opportunities, searchTerm, stageFilter]);

    const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
    const wonOpportunities = opportunities.filter(opp => opp.stage === 'Ganha');
    const activeOpportunities = opportunities.filter(opp =>
        opp.stage !== 'Ganha' && opp.stage !== 'Perdida'
    );
    const lostOpportunities = opportunities.filter(opp => opp.stage === 'Perdida');
    const averageValue = opportunities.length > 0 ? totalValue / opportunities.length : 0;
    const winRate = opportunities.length > 0 ? (wonOpportunities.length / opportunities.length) * 100 : 0;

    // Função para recarregar oportunidades
    const refreshOpportunities = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/opportunities?customerId=${customerId}`);
            if (response.ok) {
                const data = await response.json();
                setOpportunities(data.opportunities || []);
            }
        } catch (error) {
            console.error('Error refreshing opportunities:', error);
            toast.error('Erro ao carregar oportunidades');
        } finally {
            setLoading(false);
        }
    };

    // Função para excluir oportunidade
    const handleDeleteOpportunity = async (opportunityId: string) => {
        if (!confirm('Tem certeza que deseja excluir esta oportunidade?')) {
            return;
        }

        try {
            const response = await fetch(`/api/opportunities/${opportunityId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Oportunidade excluída com sucesso!');
                await refreshOpportunities();
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Erro ao excluir oportunidade');
            }
        } catch (error) {
            console.error('Error deleting opportunity:', error);
            toast.error('Erro interno do servidor');
        }
    };

    // Função para abrir formulário de edição
    const handleEditOpportunity = (opportunity: Opportunity) => {
        setEditingOpportunity(opportunity);
        setShowForm(true);
    };

    // Função para fechar formulário
    const handleCloseForm = () => {
        setShowForm(false);
        setEditingOpportunity(null);
    };

    // Função para sucesso do formulário
    const handleFormSuccess = async () => {
        await refreshOpportunities();
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Oportunidades
                        </CardTitle>
                        <CardDescription>
                            Gerencie oportunidades de negócio e acompanhe o pipeline de vendas.
                        </CardDescription>
                    </div>
                    <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => setShowForm(true)}
                    >
                        <PlusCircle className="h-4 w-4" />
                        Nova Oportunidade
                    </Button>
                </CardHeader>
                <CardContent>
                    {opportunities.length > 0 ? (
                        <div className="space-y-6">
                            {/* Métricas Aprimoradas */}
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-medium">Total</p>
                                                <p className="text-2xl font-bold">{opportunities.length}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-yellow-600" />
                                            <div>
                                                <p className="text-sm font-medium">Ativas</p>
                                                <p className="text-2xl font-bold">{activeOpportunities.length}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <div>
                                                <p className="text-sm font-medium">Ganhas</p>
                                                <p className="text-2xl font-bold">{wonOpportunities.length}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                            <div>
                                                <p className="text-sm font-medium">Perdidas</p>
                                                <p className="text-2xl font-bold">{lostOpportunities.length}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            <div>
                                                <p className="text-sm font-medium">Valor Total</p>
                                                <p className="text-lg font-bold">{formatCurrency(totalValue)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Percent className="h-4 w-4 text-purple-600" />
                                            <div>
                                                <p className="text-sm font-medium">Taxa Conversão</p>
                                                <p className="text-lg font-bold">{winRate.toFixed(1)}%</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Filtros e Busca */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar oportunidades..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Select value={stageFilter} onValueChange={setStageFilter}>
                                        <SelectTrigger className="w-48">
                                            <Filter className="h-4 w-4 mr-2" />
                                            <SelectValue placeholder="Filtrar por estágio" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos os estágios</SelectItem>
                                            <SelectItem value="Nova">Nova</SelectItem>
                                            <SelectItem value="Contactada">Contactada</SelectItem>
                                            <SelectItem value="Proposta Enviada">Proposta Enviada</SelectItem>
                                            <SelectItem value="Ganha">Ganha</SelectItem>
                                            <SelectItem value="Perdida">Perdida</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Tabela de Oportunidades Aprimorada */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">
                                        Lista de Oportunidades ({filteredOpportunities.length})
                                    </h3>
                                </div>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nome</TableHead>
                                                <TableHead>Produto</TableHead>
                                                <TableHead>Estágio</TableHead>
                                                <TableHead>Probabilidade</TableHead>
                                                <TableHead>Valor</TableHead>
                                                <TableHead>Responsável</TableHead>
                                                <TableHead>Criada em</TableHead>
                                                <TableHead>Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredOpportunities.map(opportunity => {
                                                const StageIcon = getStageIcon(opportunity.stage);
                                                const probability = getProbabilityByStage(opportunity.stage);

                                                return (
                                                    <TableRow key={opportunity.id}>
                                                        <TableCell className="font-medium">
                                                            {opportunity.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {opportunity.product?.name || 'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <StageIcon className="h-4 w-4" />
                                                                    <Badge variant={getStageColor(opportunity.stage)}>
                                                                        {opportunity.stage}
                                                                    </Badge>
                                                                </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-1">
                                                                    <div
                                                                        className="bg-primary h-1 rounded-full transition-all duration-300"
                                                                        style={{ width: `${getStageProgress(opportunity.stage)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Percent className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-sm font-medium">
                                                                    {probability}%
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-mono">
                                                            {formatCurrency(opportunity.value)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-sm">
                                                                    {opportunity.user?.name || 'N/A'}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-sm">
                                                                    {formatDate(opportunity.createdAt)}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="gap-1"
                                                                            onClick={() => setSelectedOpportunity(opportunity)}
                                                                        >
                                                                            <Eye className="h-3 w-3" />
                                                                            Ver
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                                                        {selectedOpportunity && (
                                                                            <OpportunityTimeline
                                                                                opportunityId={selectedOpportunity.id}
                                                                                opportunityName={selectedOpportunity.name}
                                                                                currentStage={selectedOpportunity.stage}
                                                                                value={selectedOpportunity.value}
                                                                                createdAt={selectedOpportunity.createdAt?.toString() || ''}
                                                                                updatedAt={selectedOpportunity.updatedAt?.toString() || ''}
                                                                            />
                                                                        )}
                                                                    </DialogContent>
                                                                </Dialog>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="gap-1"
                                                                    onClick={() => handleEditOpportunity(opportunity)}
                                                                >
                                                                    <Edit className="h-3 w-3" />
                                                                    Editar
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="gap-1 text-destructive hover:text-destructive"
                                                                    onClick={() => handleDeleteOpportunity(opportunity.id)}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                    Excluir
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Pipeline Visual Aprimorado */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Pipeline de Vendas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    {['Nova', 'Contactada', 'Proposta Enviada', 'Ganha', 'Perdida'].map(stage => {
                                        const stageOpportunities = opportunities.filter(opp => opp.stage === stage);
                                        const stageValue = stageOpportunities.reduce((sum, opp) => sum + opp.value, 0);
                                        const StageIcon = getStageIcon(stage);

                                        return (
                                            <Card key={stage} className="hover:shadow-md transition-shadow">
                                                <CardContent className="p-4">
                                                    <div className="text-center space-y-2">
                                                        <div className="flex items-center justify-center">
                                                            <StageIcon className="h-6 w-6 mb-2" />
                                                        </div>
                                                        <Badge variant={getStageColor(stage)} className="mb-2">
                                                            {stage}
                                                        </Badge>
                                                        <p className="text-2xl font-bold">{stageOpportunities.length}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatCurrency(stageValue)}
                                                        </p>
                                                        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                                                            <div
                                                                className="bg-primary h-1 rounded-full transition-all duration-300"
                                                                style={{
                                                                    width: `${opportunities.length > 0 ? (stageOpportunities.length / opportunities.length) * 100 : 0}%`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <Target className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Nenhuma oportunidade encontrada</h3>
                            <p className="text-muted-foreground mb-4">
                                Este cliente ainda não possui oportunidades cadastradas.
                            </p>
                            <Button onClick={() => setShowForm(true)}>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Criar Primeira Oportunidade
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal do Formulário */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <OpportunityForm
                        customerId={customerId}
                        customerName={customerName}
                        opportunity={editingOpportunity || undefined}
                        onClose={handleCloseForm}
                        onSuccess={handleFormSuccess}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}