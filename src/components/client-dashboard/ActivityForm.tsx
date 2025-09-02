'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'sonner';
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
import { AlertTriangle } from 'lucide-react';
import { useCreateActivity } from '@/hooks/useActivities';
import { Alert, AlertDescription } from '@/components/ui/alert';

const activityFormSchema = z.object({
    type: z.enum(['call', 'meeting', 'email', 'note', 'whatsapp'], {
        message: 'Selecione o tipo de atividade',
    }),
    title: z.string().min(1, 'Título é obrigatório').max(200, 'Título deve ter no máximo 200 caracteres'),
    description: z.string().optional(),
    date: z.string().min(1, 'Data é obrigatória'),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
});

type ActivityFormData = z.infer<typeof activityFormSchema>;

interface ActivityFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customerId: string;
    customerName: string;
    userId?: string;
}

const activityTypes = [
    { value: 'call', label: 'Ligação', description: 'Registro de chamada telefônica' },
    { value: 'meeting', label: 'Reunião', description: 'Reunião presencial ou virtual' },
    { value: 'email', label: 'E-mail', description: 'Comunicação por e-mail' },
    { value: 'whatsapp', label: 'WhatsApp', description: 'Mensagem via WhatsApp' },
    { value: 'note', label: 'Nota', description: 'Anotação ou observação' },
];

export function ActivityForm({
    open,
    onOpenChange,
    customerId,
    customerName,
    userId,
}: ActivityFormProps) {
    const createActivity = useCreateActivity();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<Error | null>(null);

    const form = useForm<ActivityFormData>({
        resolver: zodResolver(activityFormSchema),
        defaultValues: {
            type: undefined,
            title: '',
            description: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            time: format(new Date(), 'HH:mm'),
        },
    });

    const selectedType = form.watch('type');

    const onSubmit = form.handleSubmit(async (data: ActivityFormData) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Combine date and time
            const [hours, minutes] = data.time.split(':').map(Number);
            const combinedDate = new Date(data.date);
            combinedDate.setHours(hours, minutes, 0, 0);

            const activityData = {
                customerId,
                type: data.type,
                title: data.title,
                description: data.description || undefined,
                date: combinedDate,
            };

            await createActivity.mutateAsync(activityData);

            toast.success('Atividade criada com sucesso!');
            form.reset();
            onOpenChange(false);
        } catch (error) {
            const submitError = error as Error;
            setSubmitError(submitError);
            toast.error('Erro ao criar atividade', {
                description: submitError.message,
            });
        } finally {
            setIsSubmitting(false);
        }
    });

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            form.reset();
            setSubmitError(null);
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nova Atividade</DialogTitle>
                    <DialogDescription>
                        Registre uma nova atividade para {customerName}.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Activity Type */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Atividade</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o tipo de atividade" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {activityTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{type.label}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {type.description}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={
                                                selectedType === 'call' ? 'Ex: Ligação para esclarecimento de dúvidas' :
                                                    selectedType === 'meeting' ? 'Ex: Reunião para apresentação de proposta' :
                                                        selectedType === 'email' ? 'Ex: Envio de documentação solicitada' :
                                                            selectedType === 'whatsapp' ? 'Ex: Confirmação de agendamento' :
                                                                selectedType === 'note' ? 'Ex: Cliente interessado em seguro auto' :
                                                                    'Descreva brevemente a atividade'
                                            }
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Adicione detalhes sobre a atividade..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Date and Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data</FormLabel>
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
                                name="time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hora</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Error Display */}
                        {submitError && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    {submitError.message}
                                </AlertDescription>
                            </Alert>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Criando...' : 'Criar Atividade'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}