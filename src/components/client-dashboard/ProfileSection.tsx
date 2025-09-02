'use client'

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, FileText, MapPin, Building2, Phone, Edit, History } from "lucide-react";
import { ProfileEditForm } from "./ProfileEditForm";
import { formatarTelefone } from '@/utils/validacoes';
import { formatarData } from '@/utils/formatters';

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

interface Phone {
    id: string;
    type: string;
    number: string;
    contact: string | null;
}

interface ProfileSectionProps {
    customer: Customer;
    phones: Phone[];
    onCustomerUpdate: (updatedCustomer: Customer) => void;
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

// Helper function to get status badge variant
function getStatusVariant(status: string | null): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case '1':
        case 'ativo':
        case 'Ativo':
            return 'default';
        case '0':
        case 'inativo':
        case 'Inativo':
            return 'secondary';
        default:
            return 'outline';
    }
}

export function ProfileSection({ customer, phones, onCustomerUpdate }: ProfileSectionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const clientInitials = getClientInitials(customer.name);
    const formattedDocument = formatDocument(customer.cnpjCpf, customer.personType);
    const registrationDate = formatarData(customer.createdAt.toISOString().split('T')[0]);
    const lastUpdateDate = formatarData(customer.updatedAt.toISOString().split('T')[0]);

    const handleSave = (updatedCustomer: Customer) => {
        onCustomerUpdate(updatedCustomer);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <ProfileEditForm
                customer={customer}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Perfil do Cliente</CardTitle>
                        <CardDescription>
                            Informações detalhadas do cliente
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowHistory(!showHistory)}
                        >
                            <History className="h-4 w-4 mr-2" />
                            Histórico
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Perfil
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Enhanced Client Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Avatar and Basic Info */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 lg:h-24 lg:w-24">
                            <AvatarImage
                                src={customer.avatarUrl || undefined}
                                alt={customer.name}
                                data-ai-hint="person"
                            />
                            <AvatarFallback className="text-lg font-semibold">
                                {clientInitials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
                                {customer.name}
                            </h2>
                            {customer.socialName && customer.socialName !== customer.name && (
                                <p className="text-muted-foreground">
                                    Nome Social: {customer.socialName}
                                </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={getStatusVariant(customer.status)}>
                                    {customer.status === '1' ? 'Ativo' : customer.status === '0' ? 'Inativo' : 'Status Desconhecido'}
                                </Badge>
                                <Badge variant="outline">
                                    {customer.personType === 'PF' ? 'Pessoa Física' : customer.personType === 'PJ' ? 'Pessoa Jurídica' : 'Tipo não definido'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Client Details Grid */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        {/* Document Information */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                <span className="font-medium">
                                    {customer.personType === 'PF' ? 'CPF' : customer.personType === 'PJ' ? 'CNPJ' : 'Documento'}
                                </span>
                            </div>
                            <p className="font-mono">{formattedDocument}</p>
                        </div>

                        {/* Contact Information */}
                        {customer.email && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium">Email</span>
                                </div>
                                <p className="break-all">{customer.email}</p>
                            </div>
                        )}

                        {phones.length > 0 && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    <span className="font-medium">Telefone Principal</span>
                                </div>
                                <p>{formatarTelefone(phones[0].number)}</p>
                            </div>
                        )}

                        {/* Registration Date */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">Cliente desde</span>
                            </div>
                            <p>{registrationDate}</p>
                        </div>

                        {/* Person Type Specific Information */}
                        {customer.personType === 'PF' && customer.birthDate && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span className="font-medium">Data de Nascimento</span>
                                </div>
                                <p>{formatarData(customer.birthDate)}</p>
                            </div>
                        )}

                        {customer.personType === 'PJ' && customer.business && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Building2 className="h-4 w-4" />
                                    <span className="font-medium">Ramo de Atividade</span>
                                </div>
                                <p>{customer.business}</p>
                            </div>
                        )}

                        {customer.website && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span className="font-medium">Website</span>
                                </div>
                                <p className="break-all">
                                    <a
                                        href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        {customer.website}
                                    </a>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Information Sections */}
                {(customer.personType === 'PF' && (customer.gender || customer.maritalStatus || customer.income)) && (
                    <>
                        <Separator />
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Informações Pessoais</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                {customer.gender && (
                                    <div className="space-y-1">
                                        <span className="font-medium text-muted-foreground">Gênero</span>
                                        <p>{customer.gender}</p>
                                    </div>
                                )}
                                {customer.maritalStatus && (
                                    <div className="space-y-1">
                                        <span className="font-medium text-muted-foreground">Estado Civil</span>
                                        <p>{customer.maritalStatus}</p>
                                    </div>
                                )}
                                {customer.income && (
                                    <div className="space-y-1">
                                        <span className="font-medium text-muted-foreground">Renda</span>
                                        <p>{customer.income}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {(customer.personType === 'PJ' && (customer.revenue || customer.business)) && (
                    <>
                        <Separator />
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Informações Empresariais</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {customer.business && (
                                    <div className="space-y-1">
                                        <span className="font-medium text-muted-foreground">Ramo de Atividade</span>
                                        <p>{customer.business}</p>
                                    </div>
                                )}
                                {customer.revenue && (
                                    <div className="space-y-1">
                                        <span className="font-medium text-muted-foreground">Faturamento Anual</span>
                                        <p>{customer.revenue}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Additional Fields */}
                {customer.source && (
                    <>
                        <Separator />
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Informações Adicionais</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <span className="font-medium text-muted-foreground">Origem do Cliente</span>
                                    <p>{customer.source}</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Profile History */}
                {showHistory && (
                    <>
                        <Separator />
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Histórico do Perfil</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <span className="font-medium text-muted-foreground">Criado em</span>
                                    <p>{registrationDate}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-medium text-muted-foreground">Última atualização</span>
                                    <p>{lastUpdateDate}</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}