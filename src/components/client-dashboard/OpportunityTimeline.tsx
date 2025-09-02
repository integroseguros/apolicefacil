'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Clock,
    User,
    Calendar,
    Target,
    CheckCircle,
    XCircle,
    AlertCircle,
    Phone,
    Mail,
    MessageSquare
} from 'lucide-react';

interface OpportunityActivity {
    id: string;
    type: string;
    title: string;
    description?: string;
    date: string;
    user?: {
        id: string;
        name: string;
    };
}

interface OpportunityTimelineProps {
    opportunityId: string;
    opportunityName: string;
    currentStage: string;
    value: number;
    createdAt: string;
    updatedAt: string;
}

const stageIcons = {
    'Nova': AlertCircle,
    'Contactada': Phone,
    'Proposta Enviada': Mail,
    'Ganha': CheckCircle,
    'Perdida': XCircle,
};

const stageColors = {
    'Nova': 'text-blue-600',
    'Contactada': 'text-yellow-600',
    'Proposta Enviada': 'text-purple-600',
    'Ganha': 'text-green-600',
    'Perdida': 'text-red-600',
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Data inválida';
    }
}

function getStageProgress(stage: string): number {
    const progressMap: Record<string, number> = {
        'Nova': 20,
        'Contactada': 40,
        'Proposta Enviada': 60,
        'Ganha': 100,
        'Perdida': 0,
    };
    return progressMap[stage] || 0;
}

export function OpportunityTimeline({
    opportunityId,
    opportunityName,
    currentStage,
    value,
    createdAt,
    updatedAt
}: OpportunityTimelineProps) {
    const [activities, setActivities] = useState<OpportunityActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivities() {
            try {
                // Por enquanto, vamos simular algumas atividades baseadas nas datas
                // Em uma implementação real, você buscaria as atividades relacionadas à oportunidade
                const mockActivities: OpportunityActivity[] = [
                    {
                        id: '1',
                        type: 'created',
                        title: 'Oportunidade criada',
                        description: `Oportunidade "${opportunityName}" foi criada com valor de ${formatCurrency(value)}`,
                        date: createdAt,
                        user: {
                            id: 'system',
                            name: 'Sistema'
                        }
                    }
                ];

                // Se foi atualizada recentemente, adicionar atividade de atualização
                if (new Date(updatedAt) > new Date(createdAt)) {
                    mockActivities.push({
                        id: '2',
                        type: 'updated',
                        title: 'Oportunidade atualizada',
                        description: `Estágio atual: ${currentStage}`,
                        date: updatedAt,
                        user: {
                            id: 'system',
                            name: 'Sistema'
                        }
                    });
                }

                setActivities(mockActivities.sort((a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                ));
            } catch (error) {
                console.error('Error fetching activities:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchActivities();
    }, [opportunityId, opportunityName, currentStage, value, createdAt, updatedAt]);

    const StageIcon = stageIcons[currentStage as keyof typeof stageIcons] || Target;
    const stageColor = stageColors[currentStage as keyof typeof stageColors] || 'text-gray-600';
    const progress = getStageProgress(currentStage);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Timeline da Oportunidade
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Status Atual */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <StageIcon className={`h-5 w-5 ${stageColor}`} />
                            <Badge variant="outline" className={stageColor}>
                                {currentStage}
                            </Badge>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Valor</p>
                            <p className="font-semibold">{formatCurrency(value)}</p>
                        </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-300 ${currentStage === 'Ganha'
                                    ? 'bg-green-600'
                                    : currentStage === 'Perdida'
                                        ? 'bg-red-600'
                                        : 'bg-blue-600'
                                    }`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Estágios do Pipeline */}
                <div className="space-y-3">
                    <h4 className="font-medium">Pipeline de Vendas</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {Object.entries(stageIcons).map(([stage, Icon]) => {
                            const isActive = stage === currentStage;
                            const isPassed = getStageProgress(stage) < getStageProgress(currentStage);
                            const color = stageColors[stage as keyof typeof stageColors];

                            return (
                                <div
                                    key={stage}
                                    className={`flex flex-col items-center p-2 rounded-lg border ${isActive
                                        ? 'border-primary bg-primary/5'
                                        : isPassed
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-gray-200'
                                        }`}
                                >
                                    <Icon className={`h-4 w-4 mb-1 ${isActive
                                        ? color
                                        : isPassed
                                            ? 'text-green-600'
                                            : 'text-gray-400'
                                        }`} />
                                    <span className={`text-xs text-center ${isActive
                                        ? 'font-medium'
                                        : isPassed
                                            ? 'text-green-600'
                                            : 'text-gray-500'
                                        }`}>
                                        {stage}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <Separator />

                {/* Histórico de Atividades */}
                <div className="space-y-3">
                    <h4 className="font-medium">Histórico de Atividades</h4>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-3 animate-pulse">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activities.length > 0 ? (
                        <div className="space-y-4">
                            {activities.map((activity, index) => (
                                <div key={activity.id} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                            <Clock className="h-4 w-4 text-primary" />
                                        </div>
                                        {index < activities.length - 1 && (
                                            <div className="w-px h-8 bg-gray-200 mt-2" />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h5 className="font-medium text-sm">
                                                    {activity.title}
                                                </h5>
                                                {activity.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {activity.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(activity.date)}
                                            </div>
                                            {activity.user && (
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {activity.user.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Nenhuma atividade registrada ainda.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}