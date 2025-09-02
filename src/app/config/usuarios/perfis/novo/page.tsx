// src\app\config\usuarios\perfis\novo\page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner"

// Schema de validação com Zod
const perfilSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(50),
});

type PerfilFormValues = z.infer<typeof perfilSchema>;

export default function NewRolePage() {
    const router = useRouter();

    const methods = useForm<PerfilFormValues>({
        resolver: zodResolver(perfilSchema),
        defaultValues: {
            name: '',
        },
        mode: "onBlur",
    });

    const { handleSubmit, register, formState: { errors } } = methods;

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log("❌ Erros de validação do formulário:", errors);
            // toast({
            //     title: "Erro de Validação",
            //     description: "Por favor, corrija os campos destacados.",
            //     variant: "destructive",
            // });
        }
    }, [errors, toast]);


    const onSubmit: SubmitHandler<PerfilFormValues> = async (data) => {
        try {
            console.log("Dados do formulário sendo enviados:", data);

            const response = await fetch('/api/perfis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erro na resposta da API (frontend):", errorData);
                // Usa a mensagem do backend, ou um fallback
                throw new Error(errorData.message || 'Erro desconhecido ao criar perfil.');
            }

            const result = await response.json();
            console.log("Resposta da API:", result);
            toast.success("Sucesso!", {
                description: "Perfil cadastrado com sucesso.",
            });
            router.push('/config/usuarios');
            router.refresh();
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            toast.error("Erro", {
                description: `Falha ao cadastrar perfil: ${error instanceof Error ? error.message : String(error)}`,
                className: "bg-red-500 text-white" // Exemplo de classe Tailwind para estilo destrutivo
            });
        }
    };

    return (
        <>
            <PageHeader title="Incluir Novo Perfil" />
            <Card>
                <CardHeader>
                    <CardTitle>Novo Perfil</CardTitle>
                    <CardDescription>Insira o novo perfil.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                placeholder="Nome do perfil"
                                required
                                {...register("name")}
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" asChild>
                                <Link href="/config/usuarios/perfis">Cancelar</Link>
                            </Button>
                            <Button type="submit">Salvar Perfil</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}