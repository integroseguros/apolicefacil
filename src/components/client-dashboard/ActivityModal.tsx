'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const activitySchema = z.object({
    type: z.enum(['call', 'meeting', 'email', 'note', 'whatsapp'], {
        message: 'Selecione o tipo de atividade',
    }),
    title: z.string().min(1, 'Título é obrigatório').max(200, 'Título deve ter no máximo 200 caracteres'),
    description: z.string().optional(),
    date: z.date({
        message: 'Data é obrigatória',
    }),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface ActivityModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customerId: string;
    onSuccess?: () => void;
}

const activityTypes = [
    { value: 'call', label: 'Ligação' },
    { value: 'meeting', label: 'Reunião' },
    { value: 'email', label: 'E-mail' },
    { value: 'note', label: 'Nota' },
    { value: 'whatsapp', label: 'WhatsApp' },
];

export function ActivityModal({ open, onOpenChange, customerId, onSuccess }: ActivityModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ActivityFormData>({
        resolver: zodResolver(activitySchema),
        defaultValues: {
            type: 'note',
            title: '',
            description: '',
            date: new Date(),
        },
    });

    const onSubmit = async (data: ActivityFormData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/activities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    customerId,
                    date: data.date.toISOString(),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao criar atividade');
            }

            form.reset();
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Error creating activity:', error);
            // You could add toast notification here
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nova Atividade</DialogTitle>
                    <DialogDescription>
                        Registre uma nova atividade para este cliente.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Atividade</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {activityTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Digite o título da atividade" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Digite uma descrição detalhada..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Data e Hora</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="datetime-local"
                                            value={field.value ? field.value.toISOString().slice(0, 16) : ''}
                                            onChange={(e) => field.onChange(new Date(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Criar Atividade
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}