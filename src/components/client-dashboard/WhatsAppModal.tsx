'use client';

import React, { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const whatsappSchema = z.object({
    phoneNumber: z.string().min(1, 'Número de telefone é obrigatório'),
    message: z.string().min(1, 'Mensagem é obrigatória').max(1000, 'Mensagem deve ter no máximo 1000 caracteres'),
});

type WhatsAppFormData = z.infer<typeof whatsappSchema>;

interface WhatsAppModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customerId: string;
    customerName: string;
    customerPhone?: string;
    onSuccess?: () => void;
}

export function WhatsAppModal({
    open,
    onOpenChange,
    customerId,
    customerName,
    customerPhone,
    onSuccess
}: WhatsAppModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [whatsappAvailable, setWhatsappAvailable] = useState<boolean | null>(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    const form = useForm<WhatsAppFormData>({
        resolver: zodResolver(whatsappSchema),
        defaultValues: {
            phoneNumber: customerPhone || '',
            message: `Olá ${customerName}, como posso ajudá-lo hoje?`,
        },
    });

    // Check WhatsApp availability when modal opens
    useEffect(() => {
        if (open) {
            checkWhatsAppAvailability();
        }
    }, [open]);

    const checkWhatsAppAvailability = async () => {
        setCheckingAvailability(true);
        try {
            const response = await fetch('/api/whatsapp/config');
            const data = await response.json();
            setWhatsappAvailable(response.ok && data.isActive);
        } catch (error) {
            console.error('Error checking WhatsApp availability:', error);
            setWhatsappAvailable(false);
        } finally {
            setCheckingAvailability(false);
        }
    };

    const onSubmit = async (data: WhatsAppFormData) => {
        setIsSubmitting(true);
        try {
            // Send WhatsApp message
            const response = await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: data.phoneNumber,
                    content: data.message,
                    messageType: 'TEXT',
                    customerId,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao enviar mensagem');
            }

            // Create activity record for the WhatsApp message
            await fetch('/api/activities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId,
                    type: 'whatsapp',
                    title: `WhatsApp para ${customerName}`,
                    description: `Mensagem enviada: "${data.message}"`,
                    date: new Date().toISOString(),
                }),
            });

            form.reset({
                phoneNumber: customerPhone || '',
                message: `Olá ${customerName}, como posso ajudá-lo hoje?`,
            });
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            // You could add toast notification here
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatPhoneNumber = (phone: string) => {
        // Remove all non-digits
        const cleaned = phone.replace(/\D/g, '');

        // Format Brazilian phone number
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }

        return phone;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Enviar WhatsApp</DialogTitle>
                    <DialogDescription>
                        Envie uma mensagem via WhatsApp para {customerName}.
                    </DialogDescription>
                </DialogHeader>

                {checkingAvailability && (
                    <Alert>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <AlertDescription>
                            Verificando disponibilidade do WhatsApp...
                        </AlertDescription>
                    </Alert>
                )}

                {whatsappAvailable === false && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            WhatsApp não está configurado ou não está disponível no momento.
                            Entre em contato com o administrador do sistema.
                        </AlertDescription>
                    </Alert>
                )}

                {whatsappAvailable === true && (
                    <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                            WhatsApp está configurado e pronto para uso.
                        </AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número de Telefone</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="(11) 99999-9999"
                                            {...field}
                                            onChange={(e) => {
                                                const formatted = formatPhoneNumber(e.target.value);
                                                field.onChange(formatted);
                                            }}
                                            disabled={!whatsappAvailable}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mensagem</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Digite sua mensagem..."
                                            className="resize-none"
                                            rows={4}
                                            {...field}
                                            disabled={!whatsappAvailable}
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
                            <Button
                                type="submit"
                                disabled={isSubmitting || !whatsappAvailable}
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enviar Mensagem
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}