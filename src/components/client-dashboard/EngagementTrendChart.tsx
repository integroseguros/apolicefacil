'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { EngagementMetrics } from "@/lib/engagement-metrics";

interface EngagementTrendChartProps {
    engagementTrend: EngagementMetrics['engagementTrend'];
}

export function EngagementTrendChart({ engagementTrend }: EngagementTrendChartProps) {
    const maxActivities = Math.max(...engagementTrend.map(item => item.activities), 1);
    const maxScore = Math.max(...engagementTrend.map(item => item.score), 1);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Tendência de Engajamento</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Gráfico de Barras Simples */}
                    <div className="grid grid-cols-6 gap-2">
                        {engagementTrend.map((item, index) => (
                            <div key={index} className="flex flex-col items-center space-y-2">
                                {/* Barra */}
                                <div className="w-full bg-muted rounded-sm h-20 flex items-end justify-center relative">
                                    <div
                                        className="bg-primary rounded-sm w-full transition-all duration-300"
                                        style={{
                                            height: `${(item.activities / maxActivities) * 100}%`,
                                            minHeight: item.activities > 0 ? '8px' : '0px'
                                        }}
                                    />
                                    {/* Valor */}
                                    <div className="absolute -top-6 text-xs font-medium">
                                        {item.activities}
                                    </div>
                                </div>

                                {/* Período */}
                                <div className="text-xs text-center text-muted-foreground">
                                    {item.period}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Legenda */}
                    <div className="text-sm text-muted-foreground text-center">
                        Número de atividades por mês (últimos 6 meses)
                    </div>

                    {/* Estatísticas Resumidas */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div className="text-center">
                            <div className="text-lg font-semibold">
                                {engagementTrend.reduce((sum, item) => sum + item.activities, 0)}
                            </div>
                            <div className="text-xs text-muted-foreground">Total de atividades</div>
                        </div>

                        <div className="text-center">
                            <div className="text-lg font-semibold">
                                {Math.round(engagementTrend.reduce((sum, item) => sum + item.activities, 0) / 6)}
                            </div>
                            <div className="text-xs text-muted-foreground">Média mensal</div>
                        </div>

                        <div className="text-center">
                            <div className="text-lg font-semibold">
                                {engagementTrend[engagementTrend.length - 1]?.activities || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Mês atual</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}