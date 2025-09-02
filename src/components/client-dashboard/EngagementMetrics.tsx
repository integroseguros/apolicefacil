'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Activity,
    TrendingUp,
    TrendingDown,
    Minus,
    FileText,
    Target,
    Calendar,
    Heart
} from "lucide-react";
import {
    EngagementMetrics as EngagementMetricsType,
    getHealthLevelColor,
    getHealthLevelLabel,
    getTrendColor
} from "@/lib/engagement-metrics";

interface EngagementMetricsProps {
    metrics: EngagementMetricsType;
}

export function EngagementMetrics({ metrics }: EngagementMetricsProps) {
    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4" />;
            case 'down':
                return <TrendingDown className="h-4 w-4" />;
            case 'stable':
                return <Minus className="h-4 w-4" />;
            default:
                return <Minus className="h-4 w-4" />;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Contadores de Apólices e Oportunidades */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Apólices</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.policyCount}</div>
                    <p className="text-xs text-muted-foreground">
                        {metrics.policyCount === 1 ? 'apólice ativa' : 'apólices ativas'}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Oportunidades</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.opportunityCount}</div>
                    <p className="text-xs text-muted-foreground">
                        {metrics.opportunityCount === 1 ? 'oportunidade em andamento' : 'oportunidades em andamento'}
                    </p>
                </CardContent>
            </Card>

            {/* Frequência de Atividades */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Atividades</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.activityFrequency.thisMonth}</div>
                    <div className={`flex items-center text-xs ${getTrendColor(metrics.activityFrequency.trend)}`}>
                        {getTrendIcon(metrics.activityFrequency.trend)}
                        <span className="ml-1">
                            {metrics.activityFrequency.trend === 'up' && 'Aumentou'}
                            {metrics.activityFrequency.trend === 'down' && 'Diminuiu'}
                            {metrics.activityFrequency.trend === 'stable' && 'Estável'}
                        </span>
                        <span className="ml-1 text-muted-foreground">
                            vs mês anterior ({metrics.activityFrequency.lastMonth})
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Saúde do Relacionamento */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saúde do Relacionamento</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <div className="text-2xl font-bold">{metrics.relationshipHealth.score}</div>
                        <Badge
                            variant="secondary"
                            className={getHealthLevelColor(metrics.relationshipHealth.level)}
                        >
                            {getHealthLevelLabel(metrics.relationshipHealth.level)}
                        </Badge>
                    </div>
                    <Progress
                        value={metrics.relationshipHealth.score}
                        className="mt-2"
                    />
                </CardContent>
            </Card>
        </div>
    );
}