'use client'

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentInput } from "@/components/ui/document-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { validateDocument } from "@/utils/document-validators";
import { Upload, X, Save, Undo2 } from "lucide-react";

// Enhanced schema with person type and conditional validation
const profileEditSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
    personType: z.enum(['PF', 'PJ'], {
        message: 'Selecione o tipo de pessoa',
    }),
    cnpjCpf: z.string().min(11, 'Documento inválido'),
    email: z.email('Email inválido').optional().or(z.literal('')),
    socialName: z.string().optional().or(z.literal('')),
    // Pessoa Física fields
    birthDate: z.string().optional().or(z.literal('')),
    gender: z.enum(['MASCULINO', 'FEMININO', 'OUTRO']).optional(),
    maritalStatus: z.string().optional().or(z.literal('')),
    // Pessoa Jurídica fields
    business: z.string().optional().or(z.literal('')),
    revenue: z.string().optional().or(z.literal('')),
    website: z.string().url('URL inválida').optional().or(z.literal('')),
    // Additional fields
    income: z.string().optional().or(z.literal('')),
    source: z.string().optional().or(z.literal('')),
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

type ProfileEditFormValues = z.infer<typeof profileEditSchema>;

interface Customer {
    id: string;
    name: string;
    personType: string | null;
    cnpjCpf: string | null;
    email: string | null;
    socialName: string | null;
    birthDate: string | null;
    gender: string | null;
    maritalStatus: string | null;
    business: string | null;
    revenue: string | null;
    website: string | null;
    income: string | null;
    source: string | null;
    avatarUrl: string | null;
    status: string | null;
    createdAt: Date;
    updatedAt: Date;
}

interface ProfileEditFormProps {
    customer: Customer;
    onSave: (updatedCustomer: Customer) => void;
    onCancel: () => void;
}

// Helper function to get client initials for avatar fallback
function getClientInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function ProfileEditForm({ customer, onSave, onCancel }: ProfileEditFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(customer.avatarUrl);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const methods = useForm<ProfileEditFormValues>({
        resolver: zodResolver(profileEditSchema),
        defaultValues: {
            name: customer.name || '',
            personType: (customer.personType as 'PF' | 'PJ') || undefined,
            cnpjCpf: customer.cnpjCpf || '',
            email: customer.email || '',
            socialName: customer.socialName || '',
            birthDate: customer.birthDate || '',
            gender: (customer.gender as 'MASCULINO' | 'FEMININO' | 'OUTRO') || undefined,
            maritalStatus: customer.maritalStatus || '',
            business: customer.business || '',
            revenue: customer.revenue || '',
            website: customer.website || '',
            income: customer.income || '',
            source: customer.source || '',
        },
        mode: "onBlur",
    });

    const { handleSubmit, register, formState: { errors, isDirty }, watch, setValue, reset } = methods;

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

    // Handle avatar file selection
    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Erro', {
                    description: 'Por favor, selecione apenas arquivos de imagem.',
                });
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Erro', {
                    description: 'A imagem deve ter no máximo 5MB.',
                });
                return;
            }

            setAvatarFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove avatar
    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
    };

    const onSubmit: SubmitHandler<ProfileEditFormValues> = async (data) => {
        setIsSubmitting(true);
        try {
            console.log("Dados do formulário sendo enviados:", data);

            // Create FormData for file upload if avatar is present
            const formData = new FormData();

            // Add form data
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    formData.append(key, value.toString());
                }
            });

            // Add avatar file if present
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            } else if (avatarPreview === null && customer.avatarUrl) {
                // Avatar was removed
                formData.append('removeAvatar', 'true');
            }

            const response = await fetch(`/api/clientes/${customer.id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erro na resposta da API:", errorData);
                throw new Error(errorData.message || 'Erro desconhecido ao atualizar cliente.');
            }

            const result = await response.json();
            console.log("Resposta da API:", result);

            toast.success("Sucesso!", {
                description: "Perfil atualizado com sucesso.",
            });

            // Call onSave callback with updated customer data
            onSave(result.customer);

        } catch (error) {
            console.error("Erro ao atualizar cliente:", error);
            toast.error("Erro", {
                description: `Falha ao atualizar perfil: ${error instanceof Error ? error.message : String(error)}`,
                className: "bg-red-500 text-white"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const clientInitials = getClientInitials(customer.name);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Editar Perfil do Cliente</CardTitle>
                <CardDescription>
                    Atualize as informações do cliente. Campos marcados com * são obrigatórios.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Avatar className="h-20 w-20">
                                <AvatarImage
                                    src={avatarPreview || undefined}
                                    alt={customer.name}
                                    data-ai-hint="person"
                                />
                                <AvatarFallback className="text-lg font-semibold">
                                    {clientInitials}
                                </AvatarFallback>
                            </Avatar>
                            {avatarPreview && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                    onClick={handleRemoveAvatar}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="avatar">Foto do Perfil</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById('avatar-input')?.click()}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Alterar Foto
                                </Button>
                                <input
                                    id="avatar-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                    aria-label="Selecionar foto do perfil"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Formatos aceitos: JPG, PNG, GIF. Máximo 5MB.
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Basic Information Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Informações Básicas</h3>

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
                                <Label htmlFor="source">Origem do Cliente</Label>
                                <Input
                                    id="source"
                                    placeholder="Ex: Indicação, Site, Redes Sociais"
                                    {...register("source")}
                                    className={errors.source ? 'border-red-500' : ''}
                                />
                                {errors.source && <p className="text-sm text-red-500">{errors.source.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Conditional Fields for Pessoa Física */}
                    {personType === 'PF' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Informações Pessoais</h3>

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

                            <div className="space-y-2">
                                <Label htmlFor="income">Renda</Label>
                                <Input
                                    id="income"
                                    placeholder="Ex: R$ 5.000,00"
                                    {...register("income")}
                                    className={errors.income ? 'border-red-500' : ''}
                                />
                                {errors.income && <p className="text-sm text-red-500">{errors.income.message}</p>}
                            </div>
                        </div>
                    )}

                    {/* Conditional Fields for Pessoa Jurídica */}
                    {personType === 'PJ' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Informações Empresariais</h3>

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

                    <Separator />

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            <Undo2 className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isDirty}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}