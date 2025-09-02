'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Importações do Shadcn UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

// Importações do Lucide React
import {
    PlusCircle,
    Users,
    Mail,
    Phone,
    Briefcase,
    Edit,
    Trash2,
    User,
    Loader2,
    Info,
    X,
    Save
} from 'lucide-react';

import { MaskedInput } from '@/components/ui/masked-input';

interface Contact {
    id: string;
    type?: string | null;
    name: string;
    birthDate?: string | null;
    gender?: string | null;
    email?: string | null;
    phone?: string | null;
    cellPhone?: string | null;
    position?: string | null;
}

interface ContatosTabProps {
    customerId: string;
    contacts: Contact[];
    onRefresh?: () => void;
}

const contactSchema = z.object({
    type: z.string().optional(),
    name: z.string().min(1, 'Nome é obrigatório.').max(100, 'Nome deve ter no máximo 100 caracteres.'),
    birthDate: z.string().optional().or(z.literal('')),
    gender: z.enum(['MASCULINO', 'FEMININO', 'OUTRO']).optional(),
    email: z.string().email('Email inválido.').optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    cellPhone: z.string().optional().or(z.literal('')),
    position: z.string().max(100, 'Cargo deve ter no máximo 100 caracteres.').optional().or(z.literal('')),
});

type ContactFormData = z.infer<typeof contactSchema>;

function getContactTypeIcon(type: string | null | undefined) {
    switch (type?.toLowerCase()) {
        case 'emergencia':
        case 'emergency':
            return <User className="h-4 w-4 text-red-500" />;
        case 'business':
        case 'trabalho':
            return <Briefcase className="h-4 w-4 text-blue-500" />;
        case 'familia':
        case 'family':
            return <Users className="h-4 w-4 text-green-500" />;
        default:
            return <User className="h-4 w-4" />;
    }
}

function getContactTypeLabel(type: string | null | undefined): string {
    if (!type) return 'Contato';

    const typeMap: Record<string, string> = {
        'emergencia': 'Emergência',
        'business': 'Trabalho',
        'trabalho': 'Trabalho',
        'familia': 'Família',
        'family': 'Família',
        'outro': 'Outro',
    };

    return typeMap[type.toLowerCase()] || type;
}

function getContactInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatPhone(phone: string | null | undefined): string {
    if (!phone) return '';

    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    return phone;
}

export default function ContatosTab({ customerId, contacts, onRefresh }: ContatosTabProps) {
    const { toast } = useToast();
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [contactToDeleteId, setContactToDeleteId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            type: 'outro',
            name: '',
            birthDate: '',
            gender: undefined,
            email: '',
            phone: '',
            cellPhone: '',
            position: '',
        },
    });

    const { handleSubmit, reset, formState: { isSubmitting } } = form;

    useEffect(() => {
        if (selectedContact) {
            reset({
                type: selectedContact.type || 'outro',
                name: selectedContact.name || '',
                birthDate: selectedContact.birthDate || '',
                gender: selectedContact.gender as 'MASCULINO' | 'FEMININO' | 'OUTRO' | undefined,
                email: selectedContact.email || '',
                phone: selectedContact.phone || '',
                cellPhone: selectedContact.cellPhone || '',
                position: selectedContact.position || '',
            });
        } else {
            reset({
                type: 'outro',
                name: '',
                birthDate: '',
                gender: undefined,
                email: '',
                phone: '',
                cellPhone: '',
                position: '',
            });
        }
    }, [selectedContact, reset]);

    // Adicionar/Editar Contato
    const handleFormSubmit = async (data: ContactFormData) => {
        setIsLoading(true);
        try {
            const payload = {
                ...data,
                customerId: customerId,
            };

            const url = selectedContact
                ? `/api/customers/${customerId}/contacts/${selectedContact.id}`
                : `/api/customers/${customerId}/contacts`;
            const method = selectedContact ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha na operação.');
            }

            toast({
                title: 'Sucesso!',
                description: `Contato ${selectedContact ? 'atualizado' : 'adicionado'} com sucesso.`,
            });
            setIsFormDialogOpen(false);
            setSelectedContact(null);
            onRefresh?.();
        } catch (error: any) {
            console.error('Erro ao salvar contato:', error);
            toast({
                title: 'Erro',
                description: error.message || 'Ocorreu um erro ao salvar o contato.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Excluir Contato
    const handleDeleteConfirm = async () => {
        if (contactToDeleteId === null) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/customers/${customerId}/contacts/${contactToDeleteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao excluir contato.');
            }

            toast({
                title: 'Sucesso!',
                description: 'Contato excluído com sucesso.',
            });
            setIsConfirmDialogOpen(false);
            setContactToDeleteId(null);
            onRefresh?.();
        } catch (error: any) {
            console.error('Erro ao excluir contato:', error);
            toast({
                title: 'Erro',
                description: error.message || 'Ocorreu um erro ao excluir o contato.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenFormDialog = (contact?: Contact) => {
        setSelectedContact(contact || null);
        setIsFormDialogOpen(true);
    };

    const handleCloseFormDialog = () => {
        setIsFormDialogOpen(false);
        setSelectedContact(null);
        form.reset();
    };

    const handleOpenConfirmDialog = (id: string) => {
        setContactToDeleteId(id);
        setIsConfirmDialogOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setIsConfirmDialogOpen(false);
        setContactToDeleteId(null);
    };


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Contatos
                    </CardTitle>
                    <CardDescription>
                        Pessoas de contato relacionadas a este cliente.
                    </CardDescription>
                </div>
                <Button size="sm" className="gap-2" onClick={() => handleOpenFormDialog()}>
                    <PlusCircle className="h-4 w-4" />
                    Novo Contato
                </Button>
            </CardHeader>
            <CardContent>
                {contacts.length > 0 ? (
                    <div className="space-y-4">
                        {/* Contact Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Total de Contatos</p>
                                            <p className="text-2xl font-bold">{contacts.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-red-500" />
                                        <div>
                                            <p className="text-sm font-medium">Emergência</p>
                                            <p className="text-2xl font-bold">
                                                {contacts.filter(c => c.type?.toLowerCase() === 'emergencia').length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-blue-500" />
                                        <div>
                                            <p className="text-sm font-medium">Trabalho</p>
                                            <p className="text-2xl font-bold">
                                                {contacts.filter(c =>
                                                    c.type?.toLowerCase() === 'business' ||
                                                    c.type?.toLowerCase() === 'trabalho'
                                                ).length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-green-500" />
                                        <div>
                                            <p className="text-sm font-medium">Família</p>
                                            <p className="text-2xl font-bold">
                                                {contacts.filter(c =>
                                                    c.type?.toLowerCase() === 'familia' ||
                                                    c.type?.toLowerCase() === 'family'
                                                ).length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact List */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Lista de Contatos</h3>
                            <div className="grid gap-4">
                                {contacts.map(contact => (
                                    <Card key={contact.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                {/* Avatar */}
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={undefined} alt={contact.name} />
                                                    <AvatarFallback>
                                                        {getContactInitials(contact.name)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                {/* Contact Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-semibold text-lg">{contact.name}</h4>
                                                        <Badge variant="outline" className="gap-1">
                                                            {getContactTypeIcon(contact.type)}
                                                            {getContactTypeLabel(contact.type)}
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-1 text-sm text-muted-foreground">
                                                        {contact.position && (
                                                            <div className="flex items-center gap-2">
                                                                <Briefcase className="h-3 w-3" />
                                                                <span>{contact.position}</span>
                                                            </div>
                                                        )}

                                                        {contact.email && (
                                                            <div className="flex items-center gap-2">
                                                                <Mail className="h-3 w-3" />
                                                                <a
                                                                    href={`mailto:${contact.email}`}
                                                                    className="text-primary hover:underline"
                                                                >
                                                                    {contact.email}
                                                                </a>
                                                            </div>
                                                        )}

                                                        {contact.phone && (
                                                            <div className="flex items-center gap-2">
                                                                <Phone className="h-3 w-3" />
                                                                <a
                                                                    href={`tel:${contact.phone}`}
                                                                    className="text-primary hover:underline"
                                                                >
                                                                    {formatPhone(contact.phone)}
                                                                </a>
                                                            </div>
                                                        )}

                                                        {contact.cellPhone && (
                                                            <div className="flex items-center gap-2">
                                                                <Phone className="h-3 w-3" />
                                                                <a
                                                                    href={`tel:${contact.cellPhone}`}
                                                                    className="text-primary hover:underline"
                                                                >
                                                                    {formatPhone(contact.cellPhone)} (Celular)
                                                                </a>
                                                            </div>
                                                        )}

                                                        {contact.birthDate && (
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-3 w-3" />
                                                                <span>Nascimento: {contact.birthDate}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action buttons */}
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1"
                                                        onClick={() => handleOpenFormDialog(contact)}
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                        Editar
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1 text-destructive hover:text-destructive"
                                                        onClick={() => handleOpenConfirmDialog(contact.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                        Excluir
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum contato encontrado</h3>
                        <p className="text-muted-foreground mb-4">
                            Este cliente ainda não possui contatos cadastrados.
                        </p>
                        <Button onClick={() => handleOpenFormDialog()}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Cadastrar Primeiro Contato
                        </Button>
                    </div>
                )}
            </CardContent>

            {/* Dialog para Adição/Edição de Contato */}
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedContact ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
                        <DialogDescription>
                            {selectedContact ? 'Edite os detalhes do contato.' : 'Preencha os campos para adicionar um novo contato.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Nome Completo *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nome completo do contato" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de Contato</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o tipo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="emergencia">Emergência</SelectItem>
                                                    <SelectItem value="business">Trabalho</SelectItem>
                                                    <SelectItem value="familia">Família</SelectItem>
                                                    <SelectItem value="outro">Outro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="position"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cargo/Posição</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Gerente, Filho, etc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="email@exemplo.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Telefone Fixo</FormLabel>
                                            <FormControl>
                                                <MaskedInput
                                                    placeholder="(00) 0000-0000"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cellPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Celular</FormLabel>
                                            <FormControl>
                                                <MaskedInput
                                                    placeholder="(00) 00000-0000"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="birthDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Data de Nascimento</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gênero</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o gênero" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                                                    <SelectItem value="FEMININO">Feminino</SelectItem>
                                                    <SelectItem value="OUTRO">Outro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter className="mt-6 flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseFormDialog}
                                    disabled={isLoading || isSubmitting}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isLoading || isSubmitting}>
                                    {isLoading || isSubmitting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Salvar Contato
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Dialog de Confirmação para Exclusão */}
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Info className="mr-2 h-5 w-5 text-yellow-500" />
                            Confirmar Exclusão
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir este contato? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCloseConfirmDialog}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}