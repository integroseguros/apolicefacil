// src/components/items-list.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Package, Pencil, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InsuranceCompany } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

const fetchSeguradoras = async (): Promise<InsuranceCompany[]> => {
    const response = await fetch('/api/seguradoras');
    if (!response.ok) {
        throw new Error('Não foi possível buscar seguradoras.');
    }
    return response.json();
};

// Schema do Zod para validação do formulário
const formSchema = z.object({
    name: z.string().min(3, { message: "Nome precisa ter no mínimo 3 caracteres." }),
    susep: z.string().optional(),
    status: z.string().min(1, { message: "Status é obrigatório." }),
    phone: z.string().optional(),
    logo: z.any().optional(), // Para o arquivo de upload
    obsersvations: z.string().optional()
});

export default function ConfiguracoesSeguradorasPage() {
    const queryClient = useQueryClient();
    const { data: insurers, isLoading } = useQuery<InsuranceCompany[]>({
        queryKey: ['insurers'],
        queryFn: fetchSeguradoras
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInsurer, setEditingInsurer] = useState<InsuranceCompany | null>(null);

    const formMethods = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            susep: "",
            status: "A",
            phone: "",
            logo: null,
            obsersvations: ""
        },
    });

    // Mutation para criar seguradora
    const createMutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('susep', values.susep || '');
            formData.append('status', values.status);
            formData.append('phone', values.phone || '');
            formData.append('obsersvations', values.obsersvations || '');

            if (values.logo && values.logo[0]) {
                formData.append('logo', values.logo[0]);
            }

            const response = await fetch('/api/seguradoras', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao criar seguradora.');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['insurers'] });
            setIsModalOpen(false);
            formMethods.reset();
            setEditingInsurer(null);
            toast.success('Seguradora criada com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao criar seguradora:', error);
            toast.error('Erro ao criar seguradora');
        }
    });

    // Mutation para editar seguradora
    const updateMutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('susep', values.susep || '');
            formData.append('status', values.status);
            formData.append('phone', values.phone || '');
            formData.append('obsersvations', values.obsersvations || '');

            if (values.logo && values.logo[0]) {
                formData.append('logo', values.logo[0]);
            }

            const response = await fetch(`/api/seguradoras/${editingInsurer?.id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao atualizar seguradora.');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['insurers'] });
            setIsModalOpen(false);
            formMethods.reset();
            setEditingInsurer(null);
            toast.success('Seguradora atualizada com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao atualizar seguradora:', error);
            toast.error('Erro ao atualizar seguradora');
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (editingInsurer) {
            updateMutation.mutate(values);
        } else {
            createMutation.mutate(values);
        }
    };

    const handleEdit = (insurer: InsuranceCompany) => {
        setEditingInsurer(insurer);
        formMethods.reset({
            name: insurer.name,
            susep: insurer.susep || "",
            status: insurer.status,
            phone: insurer.phone || "",
            logo: null,
            obsersvations: insurer.obsersvations || ""
        });
        setIsModalOpen(true);
    };

    const handleNewInsurer = () => {
        setEditingInsurer(null);
        formMethods.reset({
            name: "",
            susep: "",
            status: "A",
            phone: "",
            logo: null,
            obsersvations: ""
        });
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 space-y-6">
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between p-4 bg-gray-50 rounded-t-lg border-b">
                    <div className="flex items-center">
                        <div className="inline-flex items-center mr-3 justify-center w-8 h-8 rounded-lg bg-purple-100">
                            <Package className="mt-1 h-5 w-5 text-purple-600" aria-label="Itens" />
                        </div>
                        <CardTitle className="text-lg font-semibold text-gray-800">Seguradoras</CardTitle>
                    </div>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button
                                className="bg-green-500 text-white hover:bg-green-600"
                                onClick={handleNewInsurer}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Incluir Nova Seguradora
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[920px]">
                            <DialogHeader>
                                <DialogTitle>{editingInsurer ? 'Editar Seguradora' : 'Nova Seguradora'}</DialogTitle>
                                <DialogDescription>
                                    {editingInsurer ? 'Edite os dados da seguradora.' : 'Inclua uma nova seguradora.'} Clique em salvar quando terminar.
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
                                                        <Label htmlFor="name">Nome <span className="text-red-500">*</span></Label>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formMethods.control}
                                                name="susep"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Label htmlFor="susep">SUSEP</Label>
                                                        <FormControl>
                                                            <Input {...field} />
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
                                                        <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Selecione" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="A">Ativa</SelectItem>
                                                                    <SelectItem value="I">Inativa</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formMethods.control}
                                                name="logo"
                                                render={({ field: { onChange, value, ...field } }) => (
                                                    <FormItem>
                                                        <Label htmlFor="logo">Logo</Label>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => onChange(e.target.files)}
                                                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                        {editingInsurer?.urlLogo && (
                                                            <div className="mt-2">
                                                                <p className="text-sm text-gray-600">Logo atual:</p>
                                                                <img
                                                                    src={editingInsurer.urlLogo}
                                                                    alt="Logo atual"
                                                                    className="mt-1 h-16 w-16 object-contain border rounded"
                                                                />
                                                            </div>
                                                        )}
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formMethods.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Label htmlFor="phone">Telefone</Label>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={formMethods.control}
                                                name="obsersvations"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Label htmlFor="obsersvations">Observação</Label>
                                                        <FormControl>
                                                            <Textarea {...field} />
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
                                id="item-search"
                                placeholder="Buscar Seguradora pelo nome"
                                className="flex-grow max-w-sm"
                            />
                            <Button>
                                <Search className="mr-2 h-4 w-4" /> Pesquisar
                            </Button>
                            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                                <X className="mr-2 h-4 w-4" /> Cancelar
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
                                        Nome
                                    </TableHead>
                                    <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-700 
                                        uppercase tracking-wider whitespace-nowrap">
                                        Status
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-white divide-y divide-gray-200">
                                {insurers && insurers.length > 0 ? insurers.map(insurer => (
                                    <TableRow key={insurer.id}>
                                        <TableCell className="px-4 py-2 whitespace-nowrap text-center">
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleEdit(insurer)}
                                            >
                                                <Pencil className="h-4 w-4 text-gray-600" />
                                            </Button>
                                        </TableCell>
                                        <TableCell className="px-4 py-2 whitespace-nowrap text-center">
                                            {insurer.urlLogo ? (
                                                <img
                                                    src={insurer.urlLogo}
                                                    alt={`Logo ${insurer.name}`}
                                                    className="h-8 w-8 object-contain mx-auto"
                                                />
                                            ) : (
                                                <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center mx-auto">
                                                    <Package className="h-4 w-4 text-gray-400" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell
                                            className="px-4 py-2 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            {insurer.name}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 whitespace-nowrap text-center">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${insurer.status === 'A'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {insurer.status === 'A' ? 'Ativa' : 'Inativa'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="px-4 py-2 text-center text-gray-500">
                                            {isLoading ? 'Carregando...' : 'Nenhuma seguradora encontrada'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between p-4 border-t bg-gray-50 rounded-b-lg">
                    <div className="flex space-x-1 text-sm text-gray-700">
                        <Button variant="ghost" size="sm" className="px-2">Primeira</Button>
                        <Button variant="ghost" size="sm" className="px-2">Anterior</Button>
                    </div>
                    <div className="text-sm font-medium text-gray-800">
                        1 de 1
                    </div>
                    <div className="flex space-x-1 text-sm text-gray-700">
                        <Button variant="ghost" size="sm" className="px-2">Próxima</Button>
                        <Button variant="ghost" size="sm" className="px-2">Última</Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}