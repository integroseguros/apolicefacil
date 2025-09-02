'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { Claim, ClaimStatus } from '@/types';

interface ClaimStatusUpdateProps {
    claim: Claim;
    onSuccess: (updatedClaim: Claim) => void;
}

export default function ClaimStatusUpdate({ claim, onSuccess }: ClaimStatusUpdateProps) {
    const [status, setStatus] = useState<ClaimStatus>(claim.status);
    const [reason, setReason] = useState('');
    const [approvedValue, setApprovedValue] = useState(claim.approvedValue?.toString() || '');
    const [deductible, setDeductible] = useState(claim.deductible?.toString() || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (status === 'CLOSED' && !reason) {
            toast({
                title: 'Erro',
                description: 'Informe o motivo do fechamento do sinistro',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsSubmitting(true);

            const payload: any = {
                status,
                reason,
            };

            // Adicionar valores aprovados se o status for APPROVED
            if (status === 'APPROVED') {
                if (approvedValue) {
                    payload.approvedValue = parseFloat(approvedValue);
                }

                if (deductible) {
                    payload.deductible = parseFloat(deductible);
                }
            }

            const response = await fetch(`/api/claims/${claim.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao atualizar status do sinistro');
            }

            const updatedClaim = await response.json();

            toast({
                title: 'Sucesso',
                description: 'Status do sinistro atualizado com sucesso',
            });

            // Limpar formulário
            setReason('');

            // Notificar componente pai
            onSuccess(updatedClaim);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao atualizar status do sinistro',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusIcon = (statusValue: ClaimStatus) => {
        switch (statusValue) {
            case 'REPORTED':
                return <AlertTriangle className="h-4 w-4" />;
            case 'UNDER_REVIEW':
            case 'INVESTIGATING':
                return <Clock className="h-4 w-4" />;
            case 'APPROVED':
            case 'SETTLED':
            case 'CLOSED':
                return <CheckCircle className="h-4 w-4" />;
            case 'REJECTED':
                return <XCircle className="h-4 w-4" />;
            default:
                return null;
        }
    };

    const getStatusLabel = (statusValue: ClaimStatus) => {
        const labels: Record<ClaimStatus, string> = {
            REPORTED: 'Reportado',
            UNDER_REVIEW: 'Em Análise',
            INVESTIGATING: 'Investigando',
            APPROVED: 'Aprovado',
            REJECTED: 'Rejeitado',
            SETTLED: 'Liquidado',
            CLOSED: 'Fechado',
        };

        return labels[statusValue] || statusValue;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="status">Status do Sinistro</Label>
                <Select
                    value={status}
                    onValueChange={(value) => setStatus(value as ClaimStatus)}
                    disabled={isSubmitting}
                >
                    <SelectTrigger id="status">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="REPORTED">
                            <div className="flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Reportado
                            </div>
                        </SelectItem>
                        <SelectItem value="UNDER_REVIEW">
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                Em Análise
                            </div>
                        </SelectItem>
                        <SelectItem value="INVESTIGATING">
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                Investigando
                            </div>
                        </SelectItem>
                        <SelectItem value="APPROVED">
                            <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Aprovado
                            </div>
                        </SelectItem>
                        <SelectItem value="REJECTED">
                            <div className="flex items-center">
                                <XCircle className="h-4 w-4 mr-2" />
                                Rejeitado
                            </div>
                        </SelectItem>
                        <SelectItem value="SETTLED">
                            <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Liquidado
                            </div>
                        </SelectItem>
                        <SelectItem value="CLOSED">
                            <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Fechado
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {status === 'APPROVED' && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="approvedValue">Valor Aprovado (R$)</Label>
                        <Input
                            id="approvedValue"
                            type="number"
                            step="0.01"
                            value={approvedValue}
                            onChange={(e) => setApprovedValue(e.target.value)}
                            placeholder="0,00"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="deductible">Franquia (R$)</Label>
                        <Input
                            id="deductible"
                            type="number"
                            step="0.01"
                            value={deductible}
                            onChange={(e) => setDeductible(e.target.value)}
                            placeholder="0,00"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="reason">
                    {status === 'CLOSED' ? 'Motivo do Fechamento *' : 'Observações'}
                </Label>
                <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={status === 'CLOSED' ? 'Informe o motivo do fechamento...' : 'Observações sobre a mudança de status...'}
                    disabled={isSubmitting}
                    rows={3}
                    required={status === 'CLOSED'}
                />
            </div>

            <Button
                type="submit"
                disabled={isSubmitting || (status === claim.status && !reason)}
                className="w-full"
            >
                {isSubmitting ? (
                    <>
                        <span className="animate-spin mr-2">◌</span>
                        Atualizando...
                    </>
                ) : (
                    <>
                        {getStatusIcon(status)}
                        <span className="ml-2">
                            Atualizar para {getStatusLabel(status)}
                        </span>
                    </>
                )}
            </Button>
        </form>
    );
}