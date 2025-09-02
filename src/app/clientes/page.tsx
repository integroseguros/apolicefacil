// src\app\clientes\page.tsx

'use client';

import React, { memo, useEffect, useState, useCallback } from 'react';
import type { Customer } from '@/types';
import { formatPhone } from '@/utils/formatters';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from "sonner"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

// Lucide React Icons
import {
    Building2,
    Trash2,
    Pencil,
    Mail,
    Phone,
    RefreshCw,
    UserPlus,
    User,
    MoreHorizontal,
    Search,
    Loader2, // Para o spinner de carregamento
    FileText, // Para o estado de "nenhum cliente encontrado"
    Info,
    XIcon,
    Eye, // Para o ícone de alerta no modal de confirmação
} from 'lucide-react';
import Link from 'next/link';

// Helper function to format document based on person type
function formatDocument(document: string | null, personType: string | null): string {
    if (!document) return 'N/A';

    const cleaned = document.replace(/\D/g, '');

    if (personType === 'PF' && cleaned.length === 11) {
        // CPF format: 000.000.000-00
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (personType === 'PJ' && cleaned.length === 14) {
        // CNPJ format: 00.000.000/0000-00
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    return document;
}

const ClientesPage = memo(() => {

    const [loading, setLoading] = useState(false);
    const [clientes, setClientes] = useState<Customer[]>([]);
    const [clienteToDelete, setClienteToDelete] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [openFormDialog, setOpenFormDialog] = useState(false); // Renomeado para clareza
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // Para o modal de confirmação de exclusão
    const [selectedCliente, setSelectedCliente] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [tipoFilter, setTipoFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const handleClear = () => {
        setSearchTerm("")
    }

    // Função para buscar clientes (refresh)
    const fetchClientes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/clientes');
            if (!response.ok) {
                throw new Error('Falha ao buscar clientes');
            }
            const data = await response.json();
            setClientes(data.clientes || []);
            toast.success("Sucesso!", {
                description: "Clientes atualizados.",
                action: {
                    label: "Ok",
                    onClick: () => console.log("Ok"),
                },
            });
        } catch (err) {
            console.error('Erro ao buscar clientes:', err);
            toast.error("Erro!", {
                description: "Falha ao carregar clientes.",
                action: {
                    label: "Ok",
                    onClick: () => console.log("Ok"),
                },
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchClientes();
    }, [fetchClientes]);

    // Funções de manipulação do formulário e modal
    const showFormDialog = useCallback((cliente?: Customer) => {
        setSelectedCliente(cliente || null);
        setOpenFormDialog(true);
    }, []);

    const handleFormSuccess = useCallback(() => {
        setOpenFormDialog(false);
        fetchClientes();
        toast.info("Sucesso!", {
            description: selectedCliente ? 'Cliente atualizado.' : 'Cliente adicionado.',
            action: {
                label: "Ok",
                onClick: () => console.log("Ok"),
            },
        });
    }, [fetchClientes, selectedCliente, toast]);

    const handleFormCancel = useCallback(() => {
        setOpenFormDialog(false);
    }, []);

    // Funções de exclusão
    const showConfirmDeleteDialog = useCallback((clienteId: string) => {
        setClienteToDelete(clienteId);
        setOpenConfirmDialog(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (clienteToDelete === null) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/clientes/${clienteToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Falha ao excluir cliente');
            }

            toast.success("Sucesso!", {
                description: "Cliente excluído com sucesso.",
                action: {
                    label: "Ok",
                    onClick: () => console.log("Ok"),
                },
            });
            fetchClientes();
        } catch (err) {
            console.error('Erro ao excluir cliente:', err);
            toast.error("Erro!", {
                description: "Falha ao excluir cliente.",
                action: {
                    label: "Ok",
                    onClick: () => console.log("Ok"),
                },
            });
        } finally {
            setOpenConfirmDialog(false);
            setClienteToDelete(null);
            setLoading(false);
        }
    }, [clienteToDelete, fetchClientes, toast]);

    const handleDeleteCancel = useCallback(() => {
        setOpenConfirmDialog(false);
        setClienteToDelete(null);
    }, []);

    // Filtragem e Paginação
    const filteredClientes = clientes.filter(cliente => {
        const matchesSearch = searchTerm === '' ||
            cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.cnpjCpf?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTipo = tipoFilter === 'all' || cliente.personType === tipoFilter;
        const matchesStatus = statusFilter === 'all' || (cliente.status === "1" && statusFilter === 'Ativo') || (cliente.status === "2" && statusFilter === 'Inativo');

        return matchesSearch && matchesTipo && matchesStatus;
    });

    const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredClientes.slice(startIndex, endIndex);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-bold">Clientes</CardTitle>
                    <div className="flex items-center space-x-2">
                        <Button onClick={fetchClientes} variant="outline" size="sm" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            <span className="sr-only">Atualizar</span>
                        </Button>
                        <Button size="sm" className="gap-1" asChild>
                            <Link href="/clientes/novo">
                                <UserPlus className="h-4 w-4" />
                                Adicionar Cliente
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 relative">
                        {/* <div className="absolute right-60 flex items-center pl-3 pointer-events-none">
                            <Search className="h-5 w-5" />
                        </div> */}
                        <Input
                            placeholder="Buscar por nome ou documento..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Resetar página ao buscar
                            }}
                            className="col-span-full md:col-span-2 lg:col-span-2"
                        //    prefix={<Search className="mr-2 h-4 w-4 text-muted-foreground" />} // Adiciona ícone de busca
                        />
                        {searchTerm ? (
                            <Button variant="ghost" size="icon" className="absolute top-1/2 right-3 -translate-y-1/2" onClick={handleClear}>
                                <XIcon className="h-4 w-4" />
                                <span className="sr-only">Limpar</span>
                            </Button>
                        ) : (
                            <Search className="absolute top-1/2 right-3 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        )}
                        <Select value={tipoFilter} onValueChange={(value) => {
                            setTipoFilter(value);
                            setCurrentPage(1); // Resetar página ao filtrar
                        }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Filtrar por Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Tipos</SelectItem>
                                <SelectItem value="PF">Pessoa Física</SelectItem>
                                <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={(value) => {
                            setStatusFilter(value);
                            setCurrentPage(1); // Resetar página ao filtrar
                        }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Filtrar por Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Status</SelectItem>
                                <SelectItem value="ativo">Ativo</SelectItem>
                                <SelectItem value="inativo">Inativo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {loading && clientes.length === 0 ? ( // Mostra spinner se estiver carregando e não há clientes
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : currentItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentItems.map(cliente => (
                                <Card key={cliente.id} className="flex flex-col hover:shadow-lg transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-lg font-semibold">{cliente.name}</CardTitle>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/clientes/${cliente.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" /> Detalhes</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => showFormDialog(cliente)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => showConfirmDeleteDialog(cliente.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                                        <p className="flex items-center">
                                            <User className="mr-2 h-4 w-4" />
                                            {cliente.personType === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'} - {formatDocument(cliente.cnpjCpf, cliente.personType)}
                                        </p>
                                        {cliente.email && (
                                            <p className="flex items-center">
                                                <Mail className="mr-2 h-4 w-4" /> {cliente.email}
                                            </p>
                                        )}
                                        {cliente.phone && cliente.phone.length > 0 && (
                                            <p className="flex items-center">
                                                <Phone className="mr-2 h-4 w-4" /> {formatPhone(cliente.phone[0].number)}
                                            </p>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex justify-between items-center text-xs text-muted-foreground">
                                        <span className={`px-2.5 py-0.5 rounded-full ${cliente.status === "1" ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {cliente.status === "1" ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-16 rounded-lg border-2 border-dashed">
                            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold">Nenhum cliente encontrado.</h3>
                            <p className="text-muted-foreground mb-6">Comece adicionando um novo cliente ou ajuste os filtros de busca.</p>
                            <Button size="sm" className="gap-1" asChild>
                                <Link href="/clientes/novo">
                                    <UserPlus className="h-4 w-4" />
                                    Adicionar Novo Cliente
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-center mt-6">
                    {totalPages > 1 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => {
                                            if (currentPage > 1) handlePageChange(currentPage - 1);
                                        }}
                                        aria-disabled={currentPage === 1}
                                        tabIndex={currentPage === 1 ? -1 : 0}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {[...Array(totalPages)].map((_, i) => (
                                    <PaginationItem key={i} className='cursor-pointer'>
                                        <PaginationLink onClick={() => handlePageChange(i + 1)} isActive={currentPage === i + 1}>
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => {
                                            if (currentPage < totalPages) handlePageChange(currentPage + 1);
                                        }}
                                        aria-disabled={currentPage === totalPages}
                                        tabIndex={currentPage === totalPages ? -1 : 0}
                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </CardFooter>
            </Card>



            {/* Dialog de Confirmação para Exclusão (Substitui Ant Design Modal.confirm) */}
            <Dialog open={openConfirmDialog} onOpenChange={setOpenConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Info className="mr-2 h-5 w-5 text-yellow-500" /> Confirmar Exclusão
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleDeleteCancel} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
});

ClientesPage.displayName = 'ClientesPage';

export default ClientesPage;