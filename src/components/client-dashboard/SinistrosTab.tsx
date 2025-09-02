'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
    Plus,
    AlertTriangle,
    Clock,
    CheckCircle,
    XCircle,
    FileText,
    Calendar,
    MapPin,
    DollarSign,
    MessageSquare,
    Eye,
    Search,
    Trash2,
    Download,
    Mail,
    Phone
} from 'lucide-react';
import { Claim, ClaimPriority, ClaimDocument, ClaimTimeline, ClaimCommunication } from '@/types';
import { useToast } from '@/hooks/use-toast';
import ClaimDocumentUpload from './ClaimDocumentUpload';
import ClaimCommunicationForm from './ClaimCommunicationForm';
import ClaimStatusUpdate from './ClaimStatusUpdate';

interface SinistrosTabProps {
    customerId: string;
    claims?: any[];
}

// Status configuration
const statusConfig = {
    REPORTED: { label: 'Reportado', variant: 'secondary' as const, icon: AlertTriangle },
    UNDER_REVIEW: { label: 'Em Análise', variant: 'default' as const, icon: Clock },
    INVESTIGATING: { label: 'Investigando', variant: 'default' as const, icon: Search },
    APPROVED: { label: 'Aprovado', variant: 'default' as const, icon: CheckCircle },
    REJECTED: { label: 'Rejeitado', variant: 'destructive' as const, icon: XCircle },
    SETTLED: { label: 'Liquidado', variant: 'default' as const, icon: DollarSign },
    CLOSED: { label: 'Fechado', variant: 'outline' as const, icon: CheckCircle },
};

// Priority configuration
const priorityConfig = {
    LOW: { label: 'Baixa', variant: 'outline' as const, color: 'text-green-600' },
    MEDIUM: { label: 'Média', variant: 'secondary' as const, color: 'text-yellow-600' },
    HIGH: { label: 'Alta', variant: 'default' as const, color: 'text-orange-600' },
    URGENT: { label: 'Urgente', variant: 'destructive' as const, color: 'text-red-600' },
};

export default function SinistrosTab({ customerId, claims: initialClaims = [] }: SinistrosTabProps) {
    const [claims, setClaims] = useState<Claim[]>(initialClaims);
    const [loading, setLoading] = useState(true);
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [detailTabValue, setDetailTabValue] = useState('details');
    const { toast } = useToast();

    // Form state for creating new claim
    const [newClaim, setNewClaim] = useState({
        title: '',
        description: '',
        incidentDate: '',
        claimType: '',
        priority: 'MEDIUM' as ClaimPriority,
        estimatedValue: '',
        location: '',
        witnesses: '',
        policeReport: '',
    });

    // Load claims
    useEffect(() => {
        if (initialClaims.length > 0) {
            setClaims(initialClaims);
            setLoading(false);
        } else {
            loadClaims();
        }
    }, [customerId, initialClaims]);

    // Update claims when initialClaims changes
    useEffect(() => {
        if (initialClaims.length > 0) {
            setClaims(initialClaims);
        }
    }, [initialClaims]);

    const loadClaims = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/customers/${customerId}/claims`);
            if (response.ok) {
                const data = await response.json();
                setClaims(data);
            } else {
                throw new Error('Erro ao carregar sinistros');
            }
        } catch (error) {
            console.error('Error loading claims:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar os sinistros',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Create new claim
    const handleCreateClaim = async () => {
        try {
            const response = await fetch(`/api/customers/${customerId}/claims`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newClaim,
                    estimatedValue: newClaim.estimatedValue ? parseFloat(newClaim.estimatedValue) : undefined,
                }),
            });

            if (response.ok) {
                const createdClaim = await response.json();
                setClaims(prev => [createdClaim, ...prev]);
                setIsCreateModalOpen(false);
                setNewClaim({
                    title: '',
                    description: '',
                    incidentDate: '',
                    claimType: '',
                    priority: 'MEDIUM',
                    estimatedValue: '',
                    location: '',
                    witnesses: '',
                    policeReport: '',
                });
                toast({
                    title: 'Sucesso',
                    description: 'Sinistro criado com sucesso',
                });
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao criar sinistro');
            }
        } catch (error) {
            console.error('Error creating claim:', error);
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao criar sinistro',
                variant: 'destructive',
            });
        }
    };

    // Load claim details
    const loadClaimDetails = async (claimId: string) => {
        try {
            const response = await fetch(`/api/customers/${customerId}/claims/${claimId}`);
            if (response.ok) {
                const data = await response.json();
                // Update the claim in the list
                setClaims(prev => prev.map(claim => claim.id === claimId ? data : claim));
                // Update selected claim if it's the one being viewed
                if (selectedClaim && selectedClaim.id === claimId) {
                    setSelectedClaim(data);
                }
                return data;
            } else {
                throw new Error('Erro ao carregar detalhes do sinistro');
            }
        } catch (error) {
            console.error('Error loading claim details:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar os detalhes do sinistro',
                variant: 'destructive',
            });
            return null;
        }
    };

    // Handle document upload success
    const handleDocumentUploadSuccess = (document: ClaimDocument) => {
        if (selectedClaim) {
            // Add the new document to the selected claim
            const updatedClaim = {
                ...selectedClaim,
                documents: [...(selectedClaim.documents || []), document],
            };
            setSelectedClaim(updatedClaim);

            // Update the claim in the list
            setClaims(prev => prev.map(claim => claim.id === selectedClaim.id ? updatedClaim : claim));

            // Switch to documents tab
            setDetailTabValue('documents');
        }
    };

    // Handle document deletion
    const handleDeleteDocument = async (documentId: string) => {
        if (!selectedClaim) return;

        try {
            const response = await fetch(`/api/claims/${selectedClaim.id}/documents?documentId=${documentId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Remove the document from the selected claim
                const updatedClaim = {
                    ...selectedClaim,
                    documents: (selectedClaim.documents || []).filter(doc => doc.id !== documentId),
                };
                setSelectedClaim(updatedClaim);

                // Update the claim in the list
                setClaims(prev => prev.map(claim => claim.id === selectedClaim.id ? updatedClaim : claim));

                toast({
                    title: 'Sucesso',
                    description: 'Documento excluído com sucesso',
                });

                // Reload claim details to get updated timeline
                loadClaimDetails(selectedClaim.id);
            } else {
                throw new Error('Erro ao excluir documento');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao excluir documento',
                variant: 'destructive',
            });
        }
    };

    // Handle communication success
    const handleCommunicationSuccess = (communication: ClaimCommunication) => {
        if (selectedClaim) {
            // Add the new communication to the selected claim
            const updatedClaim = {
                ...selectedClaim,
                communications: [communication, ...(selectedClaim.communications || [])],
            };
            setSelectedClaim(updatedClaim);

            // Update the claim in the list
            setClaims(prev => prev.map(claim => claim.id === selectedClaim.id ? updatedClaim : claim));

            // Switch to communications tab
            setDetailTabValue('communications');

            // Reload claim details to get updated timeline
            loadClaimDetails(selectedClaim.id);
        }
    };

    // Handle status update success
    const handleStatusUpdateSuccess = (updatedClaim: Claim) => {
        // Update the selected claim
        setSelectedClaim(updatedClaim);

        // Update the claim in the list
        setClaims(prev => prev.map(claim => claim.id === updatedClaim.id ? updatedClaim : claim));

        // Switch to details tab
        setDetailTabValue('details');

        // Reload claim details to get updated timeline
        loadClaimDetails(updatedClaim.id);
    };
    // Filter claims
    const filteredClaims = claims.filter(claim => {
        const matchesSearch = claim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || claim.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Format currency
    const formatCurrency = (value: number | undefined) => {
        if (!value) return 'N/A';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    // Format date with time
    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    // Get communication type label
    const getCommunicationTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            EMAIL: 'E-mail',
            PHONE: 'Ligação Telefônica',
            SMS: 'SMS',
            WHATSAPP: 'WhatsApp',
            INTERNAL_NOTE: 'Nota Interna',
        };

        return labels[type] || type;
    };

    // Get file icon based on mime type
    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return <FileText className="h-4 w-4 text-blue-500" />;
        if (mimeType === 'application/pdf') return <FileText className="h-4 w-4 text-red-500" />;
        if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="h-4 w-4 text-blue-700" />;
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <FileText className="h-4 w-4 text-green-700" />;

        return <FileText className="h-4 w-4" />;
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Sinistros</CardTitle>
                    <CardDescription>Carregando sinistros...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Sinistros
                        </CardTitle>
                        <CardDescription>
                            Gerencie os sinistros e reclamações do cliente
                        </CardDescription>
                    </div>
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Novo Sinistro
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Criar Novo Sinistro</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Título *</Label>
                                        <Input
                                            id="title"
                                            value={newClaim.title}
                                            onChange={(e) => setNewClaim(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="Título do sinistro"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="claimType">Tipo de Sinistro *</Label>
                                        <Select
                                            value={newClaim.claimType}
                                            onValueChange={(value) => setNewClaim(prev => ({ ...prev, claimType: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="AUTO">Automóvel</SelectItem>
                                                <SelectItem value="HEALTH">Saúde</SelectItem>
                                                <SelectItem value="LIFE">Vida</SelectItem>
                                                <SelectItem value="PROPERTY">Propriedade</SelectItem>
                                                <SelectItem value="TRAVEL">Viagem</SelectItem>
                                                <SelectItem value="OTHER">Outro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Descrição *</Label>
                                    <Textarea
                                        id="description"
                                        value={newClaim.description}
                                        onChange={(e) => setNewClaim(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Descreva o sinistro detalhadamente"
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="incidentDate">Data do Incidente *</Label>
                                        <Input
                                            id="incidentDate"
                                            type="date"
                                            value={newClaim.incidentDate}
                                            onChange={(e) => setNewClaim(prev => ({ ...prev, incidentDate: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Prioridade</Label>
                                        <Select
                                            value={newClaim.priority}
                                            onValueChange={(value: ClaimPriority) => setNewClaim(prev => ({ ...prev, priority: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="LOW">Baixa</SelectItem>
                                                <SelectItem value="MEDIUM">Média</SelectItem>
                                                <SelectItem value="HIGH">Alta</SelectItem>
                                                <SelectItem value="URGENT">Urgente</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="estimatedValue">Valor Estimado (R$)</Label>
                                        <Input
                                            id="estimatedValue"
                                            type="number"
                                            step="0.01"
                                            value={newClaim.estimatedValue}
                                            onChange={(e) => setNewClaim(prev => ({ ...prev, estimatedValue: e.target.value }))}
                                            placeholder="0,00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Local do Incidente</Label>
                                        <Input
                                            id="location"
                                            value={newClaim.location}
                                            onChange={(e) => setNewClaim(prev => ({ ...prev, location: e.target.value }))}
                                            placeholder="Endereço ou local"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="witnesses">Testemunhas</Label>
                                    <Textarea
                                        id="witnesses"
                                        value={newClaim.witnesses}
                                        onChange={(e) => setNewClaim(prev => ({ ...prev, witnesses: e.target.value }))}
                                        placeholder="Nome e contato das testemunhas"
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="policeReport">Boletim de Ocorrência</Label>
                                    <Input
                                        id="policeReport"
                                        value={newClaim.policeReport}
                                        onChange={(e) => setNewClaim(prev => ({ ...prev, policeReport: e.target.value }))}
                                        placeholder="Número do B.O. (se houver)"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsCreateModalOpen(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleCreateClaim}
                                        disabled={!newClaim.title || !newClaim.description || !newClaim.incidentDate || !newClaim.claimType}
                                    >
                                        Criar Sinistro
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Buscar sinistros..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Filtrar por status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Status</SelectItem>
                            {Object.entries(statusConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                    {config.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Filtrar por prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Prioridades</SelectItem>
                            {Object.entries(priorityConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                    {config.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {/* Claims List */}
                {filteredClaims.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {claims.length === 0 ? 'Nenhum sinistro encontrado' : 'Nenhum sinistro corresponde aos filtros'}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {claims.length === 0
                                ? 'Este cliente ainda não possui sinistros registrados.'
                                : 'Tente ajustar os filtros para encontrar sinistros.'
                            }
                        </p>
                        {claims.length === 0 && (
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Criar Primeiro Sinistro
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredClaims.map((claim) => {
                            const StatusIcon = statusConfig[claim.status]?.icon || AlertTriangle;

                            return (
                                <Card key={claim.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-lg">{claim.title}</h3>
                                                    <Badge variant={statusConfig[claim.status]?.variant || 'secondary'}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {statusConfig[claim.status]?.label || claim.status}
                                                    </Badge>
                                                    <Badge variant={priorityConfig[claim.priority]?.variant || 'outline'}>
                                                        {priorityConfig[claim.priority]?.label || claim.priority}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <FileText className="h-4 w-4" />
                                                        {claim.claimNumber}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(claim.incidentDate)}
                                                    </span>
                                                    {claim.estimatedValue && (
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign className="h-4 w-4" />
                                                            {formatCurrency(claim.estimatedValue)}
                                                        </span>
                                                    )}
                                                    {claim.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-4 w-4" />
                                                            {claim.location}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {claim.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 ml-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedClaim(claim);
                                                        setIsDetailModalOpen(true);
                                                        setDetailTabValue('details');
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
                {/* Claim Detail Modal */}
                <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        {selectedClaim && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" />
                                        {selectedClaim.title}
                                    </DialogTitle>
                                </DialogHeader>

                                <Tabs value={detailTabValue} onValueChange={setDetailTabValue} className="w-full">
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="details">Detalhes</TabsTrigger>
                                        <TabsTrigger value="timeline">Histórico</TabsTrigger>
                                        <TabsTrigger value="communications">Comunicações</TabsTrigger>
                                        <TabsTrigger value="documents">Documentos</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="details" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium">Número do Sinistro</Label>
                                                <p className="text-sm text-muted-foreground">{selectedClaim.claimNumber}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Tipo</Label>
                                                <p className="text-sm text-muted-foreground">{selectedClaim.claimType}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Data do Incidente</Label>
                                                <p className="text-sm text-muted-foreground">{formatDate(selectedClaim.incidentDate)}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Data de Reporte</Label>
                                                <p className="text-sm text-muted-foreground">{formatDate(selectedClaim.reportedDate)}</p>
                                            </div>
                                            {selectedClaim.estimatedValue && (
                                                <div>
                                                    <Label className="text-sm font-medium">Valor Estimado</Label>
                                                    <p className="text-sm text-muted-foreground">{formatCurrency(selectedClaim.estimatedValue)}</p>
                                                </div>
                                            )}
                                            {selectedClaim.location && (
                                                <div>
                                                    <Label className="text-sm font-medium">Local</Label>
                                                    <p className="text-sm text-muted-foreground">{selectedClaim.location}</p>
                                                </div>
                                            )}
                                            {selectedClaim.witnesses && (
                                                <div className="col-span-2">
                                                    <Label className="text-sm font-medium">Testemunhas</Label>
                                                    <p className="text-sm text-muted-foreground">{selectedClaim.witnesses}</p>
                                                </div>
                                            )}
                                            {selectedClaim.policeReport && (
                                                <div>
                                                    <Label className="text-sm font-medium">Boletim de Ocorrência</Label>
                                                    <p className="text-sm text-muted-foreground">{selectedClaim.policeReport}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium">Descrição</Label>
                                            <p className="text-sm text-muted-foreground mt-1">{selectedClaim.description}</p>
                                        </div>

                                        <Separator className="my-4" />

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold">Atualizar Status</h3>
                                            <ClaimStatusUpdate
                                                claim={selectedClaim}
                                                onSuccess={handleStatusUpdateSuccess}
                                            />
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="timeline" className="space-y-4">
                                        <h3 className="text-lg font-semibold">Histórico do Sinistro</h3>

                                        {selectedClaim.timeline && selectedClaim.timeline.length > 0 ? (
                                            <div className="space-y-4">
                                                {selectedClaim.timeline.map((entry: ClaimTimeline) => (
                                                    <div key={entry.id} className="border rounded-lg p-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="font-medium">{entry.action}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {formatDateTime(entry.timestamp)}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm">{entry.description}</p>
                                                        {entry.user && (
                                                            <div className="text-xs text-muted-foreground mt-2">
                                                                Por: {entry.user.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-muted-foreground">Nenhum histórico disponível</p>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="communications" className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold">Nova Comunicação</h3>
                                                <ClaimCommunicationForm
                                                    claimId={selectedClaim.id}
                                                    onSuccess={handleCommunicationSuccess}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold">Histórico de Comunicações</h3>

                                                {selectedClaim.communications && selectedClaim.communications.length > 0 ? (
                                                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                                        {selectedClaim.communications.map((comm: ClaimCommunication) => (
                                                            <div key={comm.id} className="border rounded-lg p-4">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="font-medium flex items-center gap-2">
                                                                        {comm.type === 'EMAIL' && <Mail className="h-4 w-4" />}
                                                                        {comm.type === 'PHONE' && <Phone className="h-4 w-4" />}
                                                                        {(comm.type === 'SMS' || comm.type === 'WHATSAPP') && <MessageSquare className="h-4 w-4" />}
                                                                        {comm.type === 'INTERNAL_NOTE' && <MessageSquare className="h-4 w-4" />}
                                                                        {getCommunicationTypeLabel(comm.type)}
                                                                        {comm.type !== 'INTERNAL_NOTE' && (
                                                                            <Badge variant="outline">
                                                                                {comm.direction === 'INBOUND' ? 'Recebido' : 'Enviado'}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {formatDateTime(comm.timestamp)}
                                                                    </div>
                                                                </div>

                                                                {comm.subject && (
                                                                    <div className="font-medium text-sm mb-2">
                                                                        Assunto: {comm.subject}
                                                                    </div>
                                                                )}

                                                                <p className="text-sm whitespace-pre-wrap">{comm.content}</p>

                                                                {(comm.fromEmail || comm.toEmail || comm.fromPhone || comm.toPhone) && (
                                                                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                                                                        {comm.fromEmail && <div>De: {comm.fromEmail}</div>}
                                                                        {comm.toEmail && <div>Para: {comm.toEmail}</div>}
                                                                        {comm.fromPhone && <div>De: {comm.fromPhone}</div>}
                                                                        {comm.toPhone && <div>Para: {comm.toPhone}</div>}
                                                                    </div>
                                                                )}

                                                                {comm.user && (
                                                                    <div className="text-xs text-muted-foreground mt-2">
                                                                        Registrado por: {comm.user.name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 border rounded-lg">
                                                        <p className="text-muted-foreground">Nenhuma comunicação registrada</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="documents" className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold">Upload de Documento</h3>
                                                <ClaimDocumentUpload
                                                    claimId={selectedClaim.id}
                                                    onSuccess={handleDocumentUploadSuccess}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold">Documentos do Sinistro</h3>

                                                {selectedClaim.documents && selectedClaim.documents.length > 0 ? (
                                                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                                                        {selectedClaim.documents.map((doc: ClaimDocument) => (
                                                            <div key={doc.id} className="border rounded-lg p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        {getFileIcon(doc.mimeType)}
                                                                        <div>
                                                                            <div className="font-medium">{doc.name}</div>
                                                                            <div className="text-xs text-muted-foreground">
                                                                                {doc.originalName} • {(doc.size / 1024 / 1024).toFixed(2)} MB
                                                                            </div>
                                                                            {doc.description && (
                                                                                <div className="text-sm mt-1">{doc.description}</div>
                                                                            )}
                                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                                Enviado em {formatDateTime(doc.createdAt)}
                                                                                {doc.user && ` por ${doc.user.name}`}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Button variant="ghost" size="sm" asChild>
                                                                            <a href={doc.filePath} target="_blank" rel="noopener noreferrer">
                                                                                <Download className="h-4 w-4" />
                                                                            </a>
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleDeleteDocument(doc.id)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 border rounded-lg">
                                                        <p className="text-muted-foreground">Nenhum documento enviado</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}