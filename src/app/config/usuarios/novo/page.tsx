// src\app\config\usuarios\novo\page.tsx
'use client'

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Role } from '@/types';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const usuarioSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(50),
    email: z.string().email('Email inválido').max(70).optional().or(z.literal('')),
    phone: z.string().max(16).optional().or(z.literal('')),
    status: z.string().max(1, 'Status é obrigatorio'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(20),
    avatarUrl: z.string().optional().or(z.literal('')),
    role: z.string().max(15, 'Perfil é obrigatorio'),
    roleId: z.string().optional().or(z.literal('')),
});

type UsuarioFormValues = z.infer<typeof usuarioSchema>;

export default function NewUserPage() {
    const router = useRouter();

    const methods = useForm<UsuarioFormValues>({
        resolver: zodResolver(usuarioSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            status: '1',
            password: '',
            avatarUrl: '',
            role: '',
            roleId: '',
        },
        mode: "onBlur",
    });

    const { handleSubmit, control, formState: { errors, isSubmitting } } = methods;

    const fetchPerfis = async (): Promise<Role[]> => {
        const response = await fetch('/api/perfis');
        if (!response.ok) {
            throw new Error('Não foi possível buscar os perfis.');
        }
        const data = await response.json();
        return data.perfis || [];
    };

    const { data: roles, isLoading: isLoadingPerfis } = useQuery<Role[]>({
        queryKey: ['roles'],
        queryFn: fetchPerfis,
    });

    const onSubmit: SubmitHandler<UsuarioFormValues> = async (data) => {
        try {
            const response = await fetch('/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro desconhecido ao criar usuário.');
            }

            toast.success("Sucesso!", { description: "Usuário cadastrado com sucesso." });
            setTimeout(() => {
                router.push('/config/usuarios');
                router.refresh();
            }, 4000);
            router.refresh();
        } catch (error) {
            toast.error("Erro", {
                description: `Falha ao cadastrar usuario: ${error instanceof Error ? error.message : String(error)}`,
                className: "bg-red-500 text-white"
            });
        }
    };

    if (isLoadingPerfis) {
        return (
            <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Carregando dados...</span>
            </div>
        );
    }

    return (
        <>
            <PageHeader title="Novo Usuario" />
            <Card>
                <CardHeader>
                    <CardTitle>Novo Usuario</CardTitle>
                    <CardDescription>Insira os detalhes do novo usuário.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nome completo" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="email@exemplo.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Senha</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="********" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Perfil</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione um perfil" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles?.length === 0 ? (
                                                        <SelectItem value="no-roles" disabled>Nenhum perfil encontrado</SelectItem>
                                                    ) : (
                                                        roles?.map((role) => (
                                                            <SelectItem key={role.id} value={role.name}>
                                                                {role.name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Telefone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione um status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">Ativo</SelectItem>
                                                    <SelectItem value="0">Inativo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" asChild>
                                    <Link href="/config/usuarios">Cancelar</Link>
                                </Button>
                                <Button type="submit">Salvar Usuário</Button>
                            </div>
                        </form>
                    </FormProvider>
                </CardContent>
            </Card>
        </>
    );
}
