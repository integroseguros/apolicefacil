'use client'

import React from 'react';
import { EngagementMetrics } from "./EngagementMetrics";
import { RelationshipHealthDetails } from "./RelationshipHealthDetails";
import { EngagementTrendChart } from "./EngagementTrendChart";
import {
    calculateEngagementMetrics,
    ActivityWithUser,
    PolicyType,
    OpportunityType
} from "@/lib/engagement-metrics";

interface EngagementDashboardProps {
    policies: PolicyType[];
    opportunities: OpportunityType[];
    activities: ActivityWithUser[];
}

export function EngagementDashboard({
    policies,
    opportunities,
    activities
}: EngagementDashboardProps) {
    const metrics = calculateEngagementMetrics(policies, opportunities, activities);

    return (
        <div className="space-y-6">
            {/* Métricas Principais */}
            <EngagementMetrics metrics={metrics} />

            {/* Detalhes em Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Saúde do Relacionamento */}
                <RelationshipHealthDetails
                    relationshipHealth={metrics.relationshipHealth}
                />

                {/* Tendência de Engajamento */}
                <EngagementTrendChart
                    engagementTrend={metrics.engagementTrend}
                />
            </div>
        </div>
    );
}