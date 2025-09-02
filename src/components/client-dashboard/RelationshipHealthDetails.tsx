'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Heart } from "lucide-react";
import {
    EngagementMetrics,
    getHealthLevelColor,
    getHealthLevelLabel
} from "@/lib/engagement-metrics";

interface RelationshipHealthDetailsProps {
    relationshipHealth: EngagementMetrics['relationshipHealth'];
}

export function RelationshipHealthDetails({ relationshipHealth }: RelationshipHealthDetailsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5" />
                    <span>Saúde do Relacionamento</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Score e Nível */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="text-3xl font-bold">{relationshipHealth.score}</div>
                        <div>
                            <Badge
                                variant="secondary"
                                className={`${getHealthLevelColor(relationshipHealth.level)} font-medium`}
                            >
                                {getHealthLevelLabel(relationshipHealth.level)}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">de 100 pontos</p>
                        </div>
                    </div>
                </div>

                {/* Barra de Progresso */}
                <Progress
                    value={relationshipHealth.score}
                    className="h-3"
                />

                {/* Fatores que Contribuem */}
                <div>
                    <h4 className="text-sm font-medium mb-3">Fatores que contribuem para o score:</h4>
                    <div className="space-y-2">
                        {relationshipHealth.factors.length > 0 ? (
                            relationshipHealth.factors.map((factor, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm">{factor}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                Nenhuma atividade registrada ainda
                            </div>
                        )}
                    </div>
                </div>

                {/* Interpretação do Score */}
                <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Interpretação:</h4>
                    <p className="text-sm text-muted-foreground">
                        {relationshipHealth.level === 'excellent' &&
                            'Cliente altamente engajado com relacionamento sólido e múltiplas interações.'}
                        {relationshipHealth.level === 'good' &&
                            'Cliente bem engajado com bom histórico de interações e negócios.'}
                        {relationshipHealth.level === 'fair' &&
                            'Cliente moderadamente engajado. Considere aumentar a frequência de contato.'}
                        {relationshipHealth.level === 'poor' &&
                            'Cliente com baixo engajamento. Recomenda-se ações proativas de relacionamento.'}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}