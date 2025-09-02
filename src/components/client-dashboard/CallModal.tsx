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

const callSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório').max(200, 'Título deve ter no máximo 200 caracteres'),
    description: z.string().optional(),
    date: z.date({
        message: 'Data é obrigatória',
    }),
    duration: z.string().optional(),
    outcome: z.enum(['successful', 'no_answer', 'busy', 'voicemail', 'other'], {
        message: 'Selecione o resultado da ligação',
    }),
});

type CallFormData = z.infer<typeof callSchema>;

interface CallModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customerId: string;
    customerName: string;
    onSuccess?: () => void;
}

const callOutcomes = [
    { value: 'successful', label: 'Ligação atendida' },
    { value: 'no_answer', label: 'Não atendeu' },
    { value: 'busy', label: 'Ocupado' },
    { value: 'voicemail', label: 'Caixa postal' },
    { value: 'other', label: 'Outro' },
];

export function CallModal({ open, onOpenChange, customerId, customerName, onSuccess }: CallModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CallFormData>({
        resolver: zodResolver(callSchema),
        defaultValues: {
            title: `Ligação para ${customerName}`,
            description: '',
            date: new Date(),
            duration: '',
            outcome: 'successful',
        },
    });

    const onSubmit = async (data: CallFormData) => {
        setIsSubmitting(true);
        try {
            // Create activity with call-specific information
            const activityDescription = [
                data.description,
                data.duration ? `Duração: ${data.duration}` : '',
                `Resultado: ${callOutcomes.find(o => o.value === data.outcome)?.label}`,
            ].filter(Boolean).join('\n');

            const response = await fetch('/api/activities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId,
                    type: 'call',
                    title: data.title,
                    description: activityDescription,
                    date: data.date.toISOString(),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao registrar ligação');
            }

            form.reset({
                title: `Ligação para ${customerName}`,
                description: '',
                date: new Date(),
                duration: '',
                outcome: 'successful',
            });
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Error creating call activity:', error);
            // You could add toast notification here
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Ligação</DialogTitle>
                    <DialogDescription>
                        Registre os detalhes da ligação realizada para {customerName}.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Digite o título da ligação" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="outcome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Resultado da Ligação</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o resultado" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {callOutcomes.map((outcome) => (
                                                <SelectItem key={outcome.value} value={outcome.value}>
                                                    {outcome.label}
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
                            name="duration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duração (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: 5 minutos, 1h 30min" {...field} />
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
                                    <FormLabel>Observações (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Digite observações sobre a ligação..."
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
                                Registrar Ligação
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}