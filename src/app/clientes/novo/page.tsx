// src/app/clientes/novo/page.tsx
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentInput } from "@/components/ui/document-input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { validateDocument } from "@/utils/document-validators";

// Enhanced schema with person type and conditional validation
const customerSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
    personType: z.enum(['PF', 'PJ'], {
        message: 'Selecione o tipo de pessoa',
    }),
    cnpjCpf: z.string().min(11, 'Documento inválido'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    socialName: z.string().optional().or(z.literal('')),
    // Pessoa Física fields
    birthDate: z.string().optional().or(z.literal('')),
    gender: z.enum(['MASCULINO', 'FEMININO', 'OUTRO']).optional(),
    maritalStatus: z.string().optional().or(z.literal('')),
    // Pessoa Jurídica fields
    business: z.string().optional().or(z.literal('')),
    revenue: z.string().optional().or(z.literal('')),
    website: z.string().url('URL inválida').optional().or(z.literal('')),
}).refine((data) => {
    // Validate document based on person type
    if (data.cnpjCpf) {
        const documentType = data.personType === 'PF' ? 'CPF' : 'CNPJ';
        return validateDocument(data.cnpjCpf, documentType);
    }
    return true;
}, {
    message: 'Documento inválido',
    path: ['cnpjCpf'],
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function NewCustomerPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const methods = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: '',
            personType: undefined,
            cnpjCpf: '',
            email: '',
            phone: '',
            socialName: '',
            birthDate: '',
            gender: undefined,
            maritalStatus: '',
            business: '',
            revenue: '',
            website: '',
        },
        mode: "onBlur",
    });

    const { handleSubmit, register, formState: { errors }, watch, setValue, reset } = methods;

    // Watch person type to show/hide conditional fields
    const personType = watch('personType');
    const cnpjCpf = watch('cnpjCpf');

    // Handle person type change - clear document and conditional fields
    useEffect(() => {
        if (personType) {
            // Clear document field when person type changes
            setValue('cnpjCpf', '');

            // Clear conditional fields based on person type
            if (personType === 'PF') {
                // Clear PJ fields
                setValue('business', '');
                setValue('revenue', '');
                setValue('website', '');
            } else {
                // Clear PF fields
                setValue('birthDate', '');
                setValue('gender', undefined);
                setValue('maritalStatus', '');
            }
        }
    }, [personType, setValue]);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log("❌ Erros de validação do formulário:", errors);
        }
    }, [errors]);


    const onSubmit: SubmitHandler<CustomerFormValues> = async (data) => {
        setIsSubmitting(true);

        try {
            console.log("Dados do formulário sendo enviados:", data);

            const response = await fetch('/api/clientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erro na resposta da API (frontend):", errorData);
                throw new Error(errorData.message || 'Erro desconhecido ao criar cliente.');
            }

            const result = await response.json();
            console.log("Resposta da API:", result);

            // Show success message
            toast.success("Cliente cadastrado com sucesso!", {
                description: "Redirecionando para o dashboard do cliente...",
                duration: 2000,
            });

            // Wait a moment for the toast to be visible, then redirect
            setTimeout(() => {
                if (result.customer && result.customer.id) {
                    // Redirect to client dashboard with success parameter
                    router.push(`/clientes/${result.customer.id}?created=true`);
                } else {
                    // Fallback to clients list if no customer ID is returned
                    router.push('/clientes');
                }
            }, 1000);

        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            toast.error("Erro ao cadastrar cliente", {
                description: `${error instanceof Error ? error.message : String(error)}`,
                className: "bg-red-500 text-white"
            });
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <PageHeader title="Novo Cliente" />
            <Card>
                <CardHeader>
                    <CardTitle>Novo Cliente</CardTitle>
                    <CardDescription>Insira os detalhes do novo cliente.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Information Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome *</Label>
                                <Input
                                    id="name"
                                    placeholder="Nome completo ou razão social"
                                    required
                                    {...register("name")}
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="personType">Tipo de Pessoa *</Label>
                                <Select
                                    value={personType || ''}
                                    onValueChange={(value: 'PF' | 'PJ') => setValue('personType', value)}
                                >
                                    <SelectTrigger className={errors.personType ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PF">Pessoa Física</SelectItem>
                                        <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.personType && <p className="text-sm text-red-500">{errors.personType.message}</p>}
                            </div>
                        </div>

                        {/* Document Input - Only show when person type is selected */}
                        {personType && (
                            <div className="space-y-2">
                                <DocumentInput
                                    personType={personType}
                                    value={cnpjCpf}
                                    onChange={(value) => setValue('cnpjCpf', value)}
                                    error={errors.cnpjCpf?.message}
                                    required
                                />
                            </div>
                        )}

                        {/* Social Name Field */}
                        <div className="space-y-2">
                            <Label htmlFor="socialName">
                                {personType === 'PF' ? 'Nome Social' : 'Nome Fantasia'}
                            </Label>
                            <Input
                                id="socialName"
                                placeholder={personType === 'PF' ? 'Nome social (opcional)' : 'Nome fantasia (opcional)'}
                                {...register("socialName")}
                                className={errors.socialName ? 'border-red-500' : ''}
                            />
                            {errors.socialName && <p className="text-sm text-red-500">{errors.socialName.message}</p>}
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@exemplo.com"
                                    {...register("email")}
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <Input
                                    id="phone"
                                    placeholder="(00) 00000-0000"
                                    {...register("phone")}
                                    className={errors.phone ? 'border-red-500' : ''}
                                />
                                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                            </div>
                        </div>

                        {/* Conditional Fields for Pessoa Física */}
                        {personType === 'PF' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                                    Informações Pessoais
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="birthDate">Data de Nascimento</Label>
                                        <Input
                                            id="birthDate"
                                            type="date"
                                            {...register("birthDate")}
                                            className={errors.birthDate ? 'border-red-500' : ''}
                                        />
                                        {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Gênero</Label>
                                        <Select
                                            value={watch('gender') || ''}
                                            onValueChange={(value: 'MASCULINO' | 'FEMININO' | 'OUTRO') => setValue('gender', value)}
                                        >
                                            <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MASCULINO">Masculino</SelectItem>
                                                <SelectItem value="FEMININO">Feminino</SelectItem>
                                                <SelectItem value="OUTRO">Outro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="maritalStatus">Estado Civil</Label>
                                        <Input
                                            id="maritalStatus"
                                            placeholder="Ex: Solteiro, Casado, Divorciado"
                                            {...register("maritalStatus")}
                                            className={errors.maritalStatus ? 'border-red-500' : ''}
                                        />
                                        {errors.maritalStatus && <p className="text-sm text-red-500">{errors.maritalStatus.message}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Conditional Fields for Pessoa Jurídica */}
                        {personType === 'PJ' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                                    Informações Empresariais
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="business">Ramo de Atividade</Label>
                                        <Input
                                            id="business"
                                            placeholder="Ex: Comércio, Serviços, Indústria"
                                            {...register("business")}
                                            className={errors.business ? 'border-red-500' : ''}
                                        />
                                        {errors.business && <p className="text-sm text-red-500">{errors.business.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="revenue">Faturamento Anual</Label>
                                        <Input
                                            id="revenue"
                                            placeholder="Ex: Até R$ 360.000,00"
                                            {...register("revenue")}
                                            className={errors.revenue ? 'border-red-500' : ''}
                                        />
                                        {errors.revenue && <p className="text-sm text-red-500">{errors.revenue.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        placeholder="https://www.exemplo.com.br"
                                        {...register("website")}
                                        className={errors.website ? 'border-red-500' : ''}
                                    />
                                    {errors.website && <p className="text-sm text-red-500">{errors.website.message}</p>}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-6 border-t">
                            <Button variant="outline" asChild disabled={isSubmitting}>
                                <Link href="/clientes">Cancelar</Link>
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Salvando...
                                    </>
                                ) : (
                                    'Salvar Cliente'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}