'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Mail, Phone, Send } from 'lucide-react';
import { ClaimCommunication, ClaimCommunicationType, CommunicationDirection } from '@/types';

interface ClaimCommunicationFormProps {
    claimId: string;
    onSuccess: (communication: ClaimCommunication) => void;
}

export default function ClaimCommunicationForm({ claimId, onSuccess }: ClaimCommunicationFormProps) {
    const [type, setType] = useState<ClaimCommunicationType>('INTERNAL_NOTE');
    const [direction, setDirection] = useState<CommunicationDirection>('OUTBOUND');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [fromEmail, setFromEmail] = useState('');
    const [toEmail, setToEmail] = useState('');
    const [fromPhone, setFromPhone] = useState('');
    const [toPhone, setToPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content) {
            toast({
                title: 'Erro',
                description: 'O conteúdo da comunicação é obrigatório',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsSubmitting(true);

            const payload = {
                type,
                direction,
                subject,
                content,
                fromEmail: type === 'EMAIL' ? fromEmail : undefined,
                toEmail: type === 'EMAIL' ? toEmail : undefined,
                fromPhone: ['PHONE', 'SMS', 'WHATSAPP'].includes(type) ? fromPhone : undefined,
                toPhone: ['PHONE', 'SMS', 'WHATSAPP'].includes(type) ? toPhone : undefined,
            };

            const response = await fetch(`/api/claims/${claimId}/communications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao registrar comunicação');
            }

            const communication = await response.json();

            toast({
                title: 'Sucesso',
                description: 'Comunicação registrada com sucesso',
            });

            // Limpar formulário
            setContent('');
            setSubject('');

            // Notificar componente pai
            onSuccess(communication);
        } catch (error) {
            console.error('Erro ao registrar comunicação:', error);
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao registrar comunicação',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeIcon = () => {
        switch (type) {
            case 'EMAIL':
                return <Mail className="h-4 w-4" />;
            case 'PHONE':
                return <Phone className="h-4 w-4" />;
            case 'SMS':
            case 'WHATSAPP':
                return <MessageSquare className="h-4 w-4" />;
            case 'INTERNAL_NOTE':
            default:
                return <MessageSquare className="h-4 w-4" />;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Comunicação</Label>
                    <Select
                        value={type}
                        onValueChange={(value) => setType(value as ClaimCommunicationType)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger id="type">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="EMAIL">E-mail</SelectItem>
                            <SelectItem value="PHONE">Ligação Telefônica</SelectItem>
                            <SelectItem value="SMS">SMS</SelectItem>
                            <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                            <SelectItem value="INTERNAL_NOTE">Nota Interna</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {type !== 'INTERNAL_NOTE' && (
                    <div className="space-y-2">
                        <Label htmlFor="direction">Direção</Label>
                        <Select
                            value={direction}
                            onValueChange={(value) => setDirection(value as CommunicationDirection)}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger id="direction">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INBOUND">Recebida</SelectItem>
                                <SelectItem value="OUTBOUND">Enviada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {type === 'EMAIL' && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="subject">Assunto</Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Assunto do e-mail"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fromEmail">De</Label>
                            <Input
                                id="fromEmail"
                                type="email"
                                value={fromEmail}
                                onChange={(e) => setFromEmail(e.target.value)}
                                placeholder="email@exemplo.com"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="toEmail">Para</Label>
                            <Input
                                id="toEmail"
                                type="email"
                                value={toEmail}
                                onChange={(e) => setToEmail(e.target.value)}
                                placeholder="email@exemplo.com"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                </>
            )}

            {['PHONE', 'SMS', 'WHATSAPP'].includes(type) && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="fromPhone">De</Label>
                        <Input
                            id="fromPhone"
                            value={fromPhone}
                            onChange={(e) => setFromPhone(e.target.value)}
                            placeholder="(00) 00000-0000"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="toPhone">Para</Label>
                        <Input
                            id="toPhone"
                            value={toPhone}
                            onChange={(e) => setToPhone(e.target.value)}
                            placeholder="(00) 00000-0000"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="content">
                    {type === 'INTERNAL_NOTE' ? 'Nota' : type === 'EMAIL' ? 'Conteúdo do E-mail' : 'Conteúdo'}
                </Label>
                <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={type === 'INTERNAL_NOTE' ? 'Escreva sua nota interna...' : 'Conteúdo da comunicação...'}
                    disabled={isSubmitting}
                    rows={5}
                    required
                />
            </div>

            <Button type="submit" disabled={isSubmitting || !content} className="w-full">
                {isSubmitting ? (
                    <>
                        <span className="animate-spin mr-2">◌</span>
                        Salvando...
                    </>
                ) : (
                    <>
                        {getTypeIcon()}
                        <span className="ml-2">
                            {type === 'INTERNAL_NOTE' ? 'Salvar Nota' : 'Registrar Comunicação'}
                        </span>
                    </>
                )}
            </Button>
        </form>
    );
}