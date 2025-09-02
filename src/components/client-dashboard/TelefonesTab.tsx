'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Importações do Shadcn UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    Pencil,
    Trash2,
    Phone,
    Smartphone,
    Loader2,
    Info,
    X,
    Save,
    PlusCircle,
    MessageSquare
} from 'lucide-react';

import { MaskedInput } from '@/components/ui/masked-input';

interface Phone {
    id: string;
    type: string;
    number: string;
    contact?: string | null;
}

interface TelefonesTabProps {
    customerId: string;
    phones: Phone[];
    onRefresh?: () => void;
}

const phoneSchema = z.object({
    type: z.string().min(1, 'Selecione um tipo de telefone.'),
    number: z.string().min(10, 'Número inválido.').max(15, 'Número inválido.'),
    contact: z.string().max(50).optional().or(z.literal('')),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

function getPhoneTypeIcon(type: string) {
    switch (type?.toLowerCase()) {
        case 'celular':
        case 'c':
        case 'mobile':
            return <Smartphone className="h-4 w-4" />;
        case 'whatsapp':
            return <MessageSquare className="h-4 w-4" />;
        default:
            return <Phone className="h-4 w-4" />;
    }
}

function getPhoneTypeLabel(type: string): string {
    const typeMap: Record<string, string> = {
        'C': 'Celular',
        'F': 'Fixo',
        'W': 'WhatsApp',
        'celular': 'Celular',
        'fixo': 'Fixo',
        'whatsapp': 'WhatsApp',
    };

    return typeMap[type] || type;
}

function formatPhoneNumber(number: string): string {
    const cleaned = number.replace(/\D/g, '');

    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    return number;
}

export default function TelefonesTab({ customerId, phones, onRefresh }: TelefonesTabProps) {
    const { toast } = useToast();
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);
    const [phoneToDeleteId, setPhoneToDeleteId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<PhoneFormData>({
        resolver: zodResolver(phoneSchema),
        defaultValues: {
            type: 'C', // Celular como padrão
            number: '',
            contact: '',
        },
    });

    const { handleSubmit, reset, formState: { isSubmitting } } = form;

    useEffect(() => {
        if (selectedPhone) {
            reset({
                type: selectedPhone.type || '',
                number: selectedPhone.number || '',
                contact: selectedPhone.contact || '',
            });
        } else {
            reset({
                type: 'C',
                number: '',
                contact: '',
            });
        }
    }, [selectedPhone, reset]);

    // Adicionar/Editar Telefone
    const handleFormSubmit = async (data: PhoneFormData) => {
        setIsLoading(true);
        try {
            const payload = {
                ...data,
                customerId: customerId,
            };

            const url = selectedPhone ? `/api/customers/${customerId}/phones/${selectedPhone.id}` : `/api/customers/${customerId}/phones`;
            const method = selectedPhone ? 'PUT' : 'POST';

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
                description: `Telefone ${selectedPhone ? 'atualizado' : 'adicionado'} com sucesso.`,
            });
            setIsFormDialogOpen(false);
            setSelectedPhone(null);
            onRefresh?.();
        } catch (error: any) {
            console.error('Erro ao salvar telefone:', error);
            toast({
                title: 'Erro',
                description: error.message || 'Ocorreu um erro ao salvar o telefone.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Excluir Telefone
    const handleDeleteConfirm = async () => {
        if (phoneToDeleteId === null) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/customers/${customerId}/phones/${phoneToDeleteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao excluir telefone.');
            }

            toast({
                title: 'Sucesso!',
                description: 'Telefone excluído com sucesso.',
            });
            setIsConfirmDialogOpen(false);
            setPhoneToDeleteId(null);
            onRefresh?.();
        } catch (error: any) {
            console.error('Erro ao excluir telefone:', error);
            toast({
                title: 'Erro',
                description: error.message || 'Ocorreu um erro ao excluir o telefone.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenFormDialog = (phone?: Phone) => {
        setSelectedPhone(phone || null);
        setIsFormDialogOpen(true);
    };

    const handleCloseFormDialog = () => {
        setIsFormDialogOpen(false);
        setSelectedPhone(null);
        form.reset(); // Limpa o formulário ao fechar
    };

    const handleOpenConfirmDialog = (id: string) => {
        setPhoneToDeleteId(id);
        setIsConfirmDialogOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setIsConfirmDialogOpen(false);
        setPhoneToDeleteId(null);
    };

    // Função para determinar a máscara do telefone
    // const getPhoneMask = (value: string) => {
    //     const numericValue = value ? value.replace(/\D/g, '') : '';
    //     return numericValue.length > 10 ? '(99) 99999-9999' : '(99) 9999-9999';
    // };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Telefones
                    </CardTitle>
                    <CardDescription>
                        Números de telefone cadastrados para este cliente.
                    </CardDescription>
                </div>
                <Button size="sm" className="gap-2" onClick={() => handleOpenFormDialog()}>
                    <PlusCircle className="h-4 w-4" />
                    Novo Telefone
                </Button>
            </CardHeader>
            <CardContent>
                {phones.length > 0 ? (
                    <div className="space-y-4">
                        {/* Phone Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Total de Telefones</p>
                                            <p className="text-2xl font-bold">{phones.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Celulares</p>
                                            <p className="text-2xl font-bold">
                                                {phones.filter(p => p.type === 'C' || p.type === 'celular').length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">WhatsApp</p>
                                            <p className="text-2xl font-bold">
                                                {phones.filter(p => p.type === 'W' || p.type === 'whatsapp').length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Phone List */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Lista de Telefones</h3>
                            <div className="grid gap-4">
                                {phones.map(phone => (
                                    <Card key={phone.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline" className="gap-1">
                                                            {getPhoneTypeIcon(phone.type)}
                                                            {getPhoneTypeLabel(phone.type)}
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <p className="font-medium text-lg">
                                                            {formatPhoneNumber(phone.number)}
                                                        </p>

                                                        {phone.contact && (
                                                            <p className="text-sm text-muted-foreground">
                                                                Contato: {phone.contact}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action buttons */}
                                                <div className="flex items-center gap-2 ml-4">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1"
                                                        onClick={() => handleOpenFormDialog(phone)}
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                        Editar
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1 text-destructive hover:text-destructive"
                                                        onClick={() => handleOpenConfirmDialog(phone.id)}
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
                        <Phone className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum telefone encontrado</h3>
                        <p className="text-muted-foreground mb-4">
                            Este cliente ainda não possui telefones cadastrados.
                        </p>
                        <Button onClick={() => handleOpenFormDialog()}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Cadastrar Primeiro Telefone
                        </Button>
                    </div>
                )}
            </CardContent>

            {/* Dialog para Adição/Edição de Telefone */}
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{selectedPhone ? 'Editar Telefone' : 'Novo Telefone'}</DialogTitle>
                        <DialogDescription>
                            {selectedPhone ? 'Edite os detalhes do telefone.' : 'Preencha os campos para adicionar um novo telefone.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Telefone</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="C">Celular</SelectItem>
                                                <SelectItem value="F">Fixo</SelectItem>
                                                <SelectItem value="W">WhatsApp</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número</FormLabel>
                                        <FormControl>
                                            <MaskedInput
                                                id="phone"
                                                placeholder="(00) 00000-0000"
                                                {...field}
                                                onChange={(e) => {
                                                    const numericValue = e.target.value.replace(/\D/g, '');
                                                    field.onChange(numericValue);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contact"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contato</FormLabel>
                                        <FormControl><Input placeholder="Pessoa de contato (opcional)" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className="mt-6 flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={handleCloseFormDialog} disabled={isLoading || isSubmitting}>
                                    <X className="mr-2 h-4 w-4" /> Cancelar
                                </Button>
                                <Button type="submit" disabled={isLoading || isSubmitting}>
                                    {isLoading || isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Salvar Telefone
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
                            <Info className="mr-2 h-5 w-5 text-yellow-500" /> Confirmar Exclusão
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir este telefone? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseConfirmDialog} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}