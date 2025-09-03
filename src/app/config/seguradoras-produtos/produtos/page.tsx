// src/components/items-list.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Package, Pencil, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, InsuranceCompany, Branch, PaginatedResponse } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

const fetchSeguradoras = async (): Promise<InsuranceCompany[]> => {
    const response = await fetch('/api/seguradoras');
    if (!response.ok) {
        throw new Error('Não foi possível buscar seguradoras.');
    }
    return response.json();
};

const fetchRamos = async (): Promise<Branch[]> => {
    const response = await fetch('/api/ramos');
    if (!response.ok) {
        throw new Error('Não foi possível buscar ramos.');
    }
    return response.json();
};

const fetchProdutos = async (page: number = 1, limit: number = 10, search: string = '', insurerSearch: string = ''): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(insurerSearch && { insurerSearch })
    });

    const response = await fetch(`/api/produtos?${params}`);
    if (!response.ok) {
        throw new Error('Não foi possível buscar produtos.');
    }
    return response.json();
};

// Schema do Zod para validação do formulário
const formSchema = z.object({
    name: z.string().min(3, { message: "Nome precisa ter no mínimo 3 caracteres." }),
    code: z.string().optional(),
    showBudget: z.boolean(),
    insuranceCompanyId: z.string().min(1, { message: "Seguradora é obrigatória." }),
    branchId: z.string().min(1, { message: "Ramo é obrigatório." }),
    additionalCommission: z.boolean(),
    iof: z.string().optional(),
    status: z.string().optional(),
    subscriptionInsurance: z.boolean().optional(),
});

export default function ConfiguracoesProdutosPage() {
    const queryClient = useQueryClient();

    // Estados - declarar primeiro
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [insurerSearchTerm, setInsurerSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [debouncedInsurerSearch, setDebouncedInsurerSearch] = useState('');
    const [mounted, setMounted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const { data: insurers, isLoading: loadingInsurers } = useQuery<InsuranceCompany[]>({
        queryKey: ['insurers'],
        queryFn: fetchSeguradoras,
        enabled: mounted
    });

    const { data: branches, isLoading: loadingBranches } = useQuery<Branch[]>({
        queryKey: ['branches'],
        queryFn: fetchRamos,
        enabled: mounted
    });

    const { data: productsResponse, isLoading: loadingProducts } = useQuery<PaginatedResponse<Product>>({
        queryKey: ['products', currentPage, debouncedSearch, debouncedInsurerSearch],
        queryFn: () => fetchProdutos(currentPage, 10, debouncedSearch, debouncedInsurerSearch),
        enabled: mounted
    });

    // Controle de montagem para evitar hidratação mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Debounce para busca
    useEffect(() => {
        if (!mounted) return;

        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setDebouncedInsurerSearch(insurerSearchTerm);
            setCurrentPage(1); // Reset para primeira página ao buscar
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, insurerSearchTerm, mounted]);

    const formMethods = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            code: "",
            showBudget: true,
            insuranceCompanyId: "",
            branchId: "",
            additionalCommission: false,
            iof: "",
            status: "A",
            subscriptionInsurance: false
        },
    });

    // Mutation para criar produtos
    const createMutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('code', values.code || '');
            formData.append('showBudget', values.showBudget.toString());
            formData.append('insuranceCompanyId', values.insuranceCompanyId);
            formData.append('branchId', values.branchId);
            formData.append('additionalCommission', values.additionalCommission.toString());
            formData.append('iof', values.iof || '');
            formData.append('status', values.status || 'A');
            formData.append('subscriptionInsurance', values.subscriptionInsurance?.toString() || 'false');

            const response = await fetch('/api/produtos', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao criar Produto.');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setIsModalOpen(false);
            formMethods.reset();
            setEditingProduct(null);
            toast.success('Produto criado com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao criar Produto:', error);
            toast.error('Erro ao criar Produto');
        }
    });

    // Mutation para editar produto
    const updateMutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('code', values.code || '');
            formData.append('showBudget', values.showBudget.toString());
            formData.append('insuranceCompanyId', values.insuranceCompanyId);
            formData.append('branchId', values.branchId);
            formData.append('additionalCommission', values.additionalCommission.toString());
            formData.append('iof', values.iof || '');
            formData.append('status', values.status || 'A');
            formData.append('subscriptionInsurance', values.subscriptionInsurance?.toString() || 'false');

            const response = await fetch(`/api/produtos/${editingProduct?.id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao atualizar produto.');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setIsModalOpen(false);
            formMethods.reset();
            setEditingProduct(null);
            toast.success('Produto atualizado com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao atualizar produto:', error);
            toast.error('Erro ao atualizar produto');
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (editingProduct) {
            updateMutation.mutate(values);
        } else {
            createMutation.mutate(values);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        formMethods.reset({
            name: product.name || "",
            code: product.code || "",
            showBudget: product.showBudget,
            insuranceCompanyId: product.insuranceCompanyId,
            branchId: product.branchId,
            additionalCommission: product.additionalCommission,
            iof: product.iof?.toString() || "",
            status: product.status,
            subscriptionInsurance: product.subscriptionInsurance || false
        });
        setIsModalOpen(true);
    };

    const handleNewProduct = () => {
        setEditingProduct(null);
        formMethods.reset({
            name: "",
            code: "",
            showBudget: true,
            insuranceCompanyId: "",
            branchId: "",
            additionalCommission: false,
            iof: "",
            status: "A",
            subscriptionInsurance: false
        });
        setIsModalOpen(true);
    };

    const handleSearch = () => {
        setCurrentPage(1);
        setDebouncedSearch(searchTerm);
        setDebouncedInsurerSearch(insurerSearchTerm);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setInsurerSearchTerm('');
        setDebouncedSearch('');
        setDebouncedInsurerSearch('');
        setCurrentPage(1);
    };

    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => {
        if (productsResponse?.pagination) {
            setCurrentPage(productsResponse.pagination.totalPages);
        }
    };
    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    const goToNextPage = () => {
        if (productsResponse?.pagination?.hasNext) {
            setCurrentPage(currentPage + 1);
        }
    };

    if (!mounted) {
        return (
            <div className="p-6 space-y-6">
                <Card className="shadow-lg">
                    <CardContent className="p-8 text-center">
                        <div className="animate-pulse">Carregando...</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between p-4 bg-gray-50 rounded-t-lg border-b">
                    <div className="flex items-center">
                        <div className="inline-flex items-center mr-3 justify-center w-8 h-8 rounded-lg bg-purple-100">
                            <Package className="mt-1 h-5 w-5 text-purple-600" aria-label="Itens" />
                        </div>
                        <CardTitle className="text-lg font-semibold text-gray-800">Produtos</CardTitle>
                    </div>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button
                                className="bg-green-500 text-white hover:bg-green-600"
                                onClick={handleNewProduct}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Incluir Novo Produto
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[920px]">
                            <DialogHeader>
                                <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
                                <DialogDescription>
                                    {editingProduct ? 'Edite os dados do produto.' : 'Inclua um novo produto.'} Clique em salvar quando terminar.
                                </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="h-[500px] md:w-[870px] rounded-md border">
                                <Form {...formMethods}>
                                    <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="mx-5 grid gap-4 py-4">
                                            <FormField
                                                control={formMethods.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Label htmlFor="name">Nome do Produto <span className="text-red-500">*</span></Label>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Ex: Seguro Auto Completo" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formMethods.control}
                                                name="code"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Label htmlFor="code">Código</Label>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Ex: AUTO001" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formMethods.control}
                                                name="insuranceCompanyId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Label htmlFor="insuranceCompanyId">Seguradora <span className="text-red-500">*</span></Label>
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Selecione uma seguradora" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {insurers?.map((insurer) => (
                                                                        <SelectItem key={insurer.id} value={insurer.id}>
                                                                            {insurer.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formMethods.control}
                                                name="branchId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Label htmlFor="branchId">Ramo <span className="text-red-500">*</span></Label>
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Selecione um ramo" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {branches?.map((branch) => (
                                                                        <SelectItem key={branch.id} value={branch.id}>
                                                                            {branch.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formMethods.control}
                                                name="showBudget"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Label htmlFor="showBudget">Exibir no Orçamento?</Label>
                                                        <FormControl>
                                                            <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value?.toString()}>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Selecione" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="true">Sim</SelectItem>
                                                                    <SelectItem value="false">Não</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formMethods.control}
                                                name="additionalCommission"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Label htmlFor="additionalCommission">Comissão Adicional?</Label>
                                                        <FormControl>
                                                            <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value?.toString()}>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Selecione" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="true">Sim</SelectItem>
                                                                    <SelectItem value="false">Não</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formMethods.control}
                                                name="iof"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Label htmlFor="iof">IOF (%)</Label>
                                                        <FormControl>
                                                            <Input {...field} type="number" step="0.01" placeholder="Ex: 7.38" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formMethods.control}
                                                name="subscriptionInsurance"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Label htmlFor="subscriptionInsurance">Seguro por Assinatura?</Label>
                                                        <FormControl>
                                                            <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value?.toString()}>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Selecione" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="true">Sim</SelectItem>
                                                                    <SelectItem value="false">Não</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formMethods.control}
                                                name="status"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Label htmlFor="status">Status</Label>
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Selecione" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="A">Ativo</SelectItem>
                                                                    <SelectItem value="I">Inativo</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </form>
                                </Form>
                            </ScrollArea>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" type="button">Cancelar</Button>
                                </DialogClose>
                                <Button
                                    type="button"
                                    onClick={formMethods.handleSubmit(onSubmit)}
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>

                <CardContent className="p-4">
                    <div className="mb-4">
                        <Label htmlFor="item-search" className="sr-only">Seguradora</Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                id="insurer-search"
                                placeholder="Buscar por seguradora"
                                className="flex-grow max-w-sm"
                                value={insurerSearchTerm}
                                onChange={(e) => setInsurerSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Input
                                id="product-search"
                                placeholder="Buscar por produto"
                                className="flex-grow max-w-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch}>
                                <Search className="mr-2 h-4 w-4" /> Pesquisar
                            </Button>
                            <Button
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={handleClearSearch}
                            >
                                <X className="mr-2 h-4 w-4" /> Limpar
                            </Button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <Table className="min-w-full divide-y divide-gray-200">
                            <TableHeader className="bg-gray-200">
                                <TableRow>
                                    <TableHead className="w-10 text-center"></TableHead>
                                    <TableHead className="w-16 text-center">Logo</TableHead>
                                    <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-700 
                                        uppercase tracking-wider whitespace-nowrap">
                                        Seguradora
                                    </TableHead>
                                    <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-700 
                                        uppercase tracking-wider whitespace-nowrap">
                                        Produto
                                    </TableHead>
                                    <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-700 
                                        uppercase tracking-wider whitespace-nowrap">
                                        Ramo
                                    </TableHead>
                                    <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-700 
                                        uppercase tracking-wider whitespace-nowrap">
                                        Status
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-white divide-y divide-gray-200">
                                {productsResponse?.products && productsResponse.products.length > 0 ? productsResponse.products.map(product => (
                                    <TableRow key={product.id}>
                                        <TableCell className="px-4 py-2 whitespace-nowrap text-center">
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleEdit(product)}
                                            >
                                                <Pencil className="h-4 w-4 text-gray-600" />
                                            </Button>
                                        </TableCell>
                                        <TableCell className="px-4 py-2 whitespace-nowrap text-center">
                                            {product.insuranceCompany?.urlLogo ? (
                                                <img
                                                    src={product.insuranceCompany.urlLogo}
                                                    alt={`Logo ${product.insuranceCompany.name}`}
                                                    className="h-8 w-8 object-contain mx-auto"
                                                />
                                            ) : (
                                                <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center mx-auto">
                                                    <Package className="h-4 w-4 text-gray-400" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {product.insuranceCompany?.name}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {product.name}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {product.branch?.name}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 whitespace-nowrap text-center">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.status === 'A'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {product.status === 'A' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="px-4 py-2 text-center text-gray-500">
                                            {loadingProducts ? 'Carregando...' : 'Nenhum produto encontrado'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                {productsResponse?.pagination && productsResponse.pagination.totalPages > 1 && (
                    <CardFooter className="flex justify-center mt-6">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => {
                                            if (productsResponse.pagination.hasPrev) goToPrevPage();
                                        }}
                                        aria-disabled={!productsResponse.pagination.hasPrev}
                                        className={!productsResponse.pagination.hasPrev ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {[...Array(productsResponse.pagination.totalPages)].map((_, i) => (
                                    <PaginationItem key={i} className='cursor-pointer'>
                                        <PaginationLink
                                            onClick={() => goToPage(i + 1)}
                                            isActive={productsResponse.pagination.currentPage === i + 1}
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => {
                                            if (productsResponse.pagination.hasNext) goToNextPage();
                                        }}
                                        aria-disabled={!productsResponse.pagination.hasNext}
                                        className={!productsResponse.pagination.hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}