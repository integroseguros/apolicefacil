// Types based on the existing interfaces in the project

export interface EngagementMetrics {
    policyCount: number;
    opportunityCount: number;
    activityFrequency: {
        total: number;
        thisMonth: number;
        lastMonth: number;
        trend: 'up' | 'down' | 'stable';
    };
    relationshipHealth: {
        score: number;
        level: 'excellent' | 'good' | 'fair' | 'poor';
        factors: string[];
    };
    engagementTrend: {
        period: string;
        activities: number;
        score: number;
    }[];
}

export interface ActivityWithUser {
    id: string;
    type: string;
    title: string;
    description: string | null;
    date: Date;
    user: {
        id: string;
        name: string;
    } | null;
}

export interface PolicyType {
    id: string;
    document: string;
    proposalNumber: string;
    proposalDate: string;
    situationDocument: string;
    policyNumber: string | null;
    issueDate: string | null;
    renewal: string;
    tipoRenewal: string;
    previousPolicy: string | null;
    previousInsuranceCompany: string | null;
    source: string | null;
    paymentMethod: string | null;
    liquidPrize: number | null;
    totalPrize: number | null;
    iof: number | null;
    commissionValue: number | null;
    product: {
        id: string;
        name: string;
        code: string;
    };
    insuranceCompany: {
        id: string;
        name: string;
        susep: string | null;
    };
}

export interface OpportunityType {
    id: string;
    name: string;
    stage: string;
    value: number;
    product: {
        id: string;
        name: string;
        code: string;
    } | null;
    user: {
        id: string;
        name: string;
    } | null;
}

export function calculateEngagementMetrics(
    policies: PolicyType[],
    opportunities: OpportunityType[],
    activities: ActivityWithUser[]
): EngagementMetrics {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Contagem básica
    const policyCount = policies.length;
    const opportunityCount = opportunities.length;

    // Frequência de atividades
    const totalActivities = activities.length;
    const thisMonthActivities = activities.filter(
        activity => new Date(activity.date) >= thisMonth
    ).length;
    const lastMonthActivities = activities.filter(
        activity => new Date(activity.date) >= lastMonth && new Date(activity.date) <= lastMonthEnd
    ).length;

    // Tendência de atividades
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (thisMonthActivities > lastMonthActivities) {
        trend = 'up';
    } else if (thisMonthActivities < lastMonthActivities) {
        trend = 'down';
    }

    // Cálculo do score de saúde do relacionamento
    const relationshipHealth = calculateRelationshipHealth(
        policies,
        opportunities,
        activities,
        now
    );

    // Tendência de engajamento ao longo do tempo (últimos 6 meses)
    const engagementTrend = calculateEngagementTrend(activities, now);

    return {
        policyCount,
        opportunityCount,
        activityFrequency: {
            total: totalActivities,
            thisMonth: thisMonthActivities,
            lastMonth: lastMonthActivities,
            trend,
        },
        relationshipHealth,
        engagementTrend,
    };
}

function calculateRelationshipHealth(
    policies: PolicyType[],
    opportunities: OpportunityType[],
    activities: ActivityWithUser[],
    now: Date
): EngagementMetrics['relationshipHealth'] {
    let score = 0;
    const factors: string[] = [];

    // Fator 1: Número de apólices (0-25 pontos)
    const policyScore = Math.min(policies.length * 5, 25);
    score += policyScore;
    if (policies.length > 0) {
        factors.push(`${policies.length} apólice${policies.length > 1 ? 's' : ''} ativa${policies.length > 1 ? 's' : ''}`);
    }

    // Fator 2: Oportunidades ativas (0-20 pontos)
    const opportunityScore = Math.min(opportunities.length * 4, 20);
    score += opportunityScore;
    if (opportunities.length > 0) {
        factors.push(`${opportunities.length} oportunidade${opportunities.length > 1 ? 's' : ''} em andamento`);
    }

    // Fator 3: Atividade recente (0-30 pontos)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentActivities = activities.filter(
        activity => new Date(activity.date) >= thirtyDaysAgo
    );
    const activityScore = Math.min(recentActivities.length * 3, 30);
    score += activityScore;
    if (recentActivities.length > 0) {
        factors.push(`${recentActivities.length} atividade${recentActivities.length > 1 ? 's' : ''} nos últimos 30 dias`);
    }

    // Fator 4: Diversidade de tipos de atividade (0-15 pontos)
    const activityTypes = new Set(activities.map(activity => activity.type));
    const diversityScore = Math.min(activityTypes.size * 3, 15);
    score += diversityScore;
    if (activityTypes.size > 1) {
        factors.push(`${activityTypes.size} tipos diferentes de interação`);
    }

    // Fator 5: Consistência ao longo do tempo (0-10 pontos)
    const consistencyScore = calculateConsistencyScore(activities, now);
    score += consistencyScore;
    if (consistencyScore > 5) {
        factors.push('Interações consistentes ao longo do tempo');
    }

    // Determinar nível baseado no score
    let level: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 80) {
        level = 'excellent';
    } else if (score >= 60) {
        level = 'good';
    } else if (score >= 40) {
        level = 'fair';
    } else {
        level = 'poor';
    }

    return {
        score: Math.min(score, 100),
        level,
        factors,
    };
}

function calculateConsistencyScore(activities: ActivityWithUser[], now: Date): number {
    if (activities.length < 2) return 0;

    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    const recentActivities = activities.filter(
        activity => new Date(activity.date) >= sixMonthsAgo
    );

    if (recentActivities.length < 2) return 0;

    // Calcular distribuição de atividades por mês
    const monthlyActivities: { [key: string]: number } = {};
    recentActivities.forEach(activity => {
        const monthKey = new Date(activity.date).toISOString().substring(0, 7); // YYYY-MM
        monthlyActivities[monthKey] = (monthlyActivities[monthKey] || 0) + 1;
    });

    const monthsWithActivity = Object.keys(monthlyActivities).length;
    const maxPossibleMonths = 6;

    // Score baseado na consistência (mais meses com atividade = melhor score)
    return Math.round((monthsWithActivity / maxPossibleMonths) * 10);
}

function calculateEngagementTrend(activities: ActivityWithUser[], now: Date): EngagementMetrics['engagementTrend'] {
    const trend: EngagementMetrics['engagementTrend'] = [];

    for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthActivities = activities.filter(
            activity => {
                const activityDate = new Date(activity.date);
                return activityDate >= monthStart && activityDate <= monthEnd;
            }
        );

        const monthName = monthStart.toLocaleDateString('pt-BR', {
            month: 'short',
            year: 'numeric'
        });

        // Score simples baseado no número de atividades (máximo 100)
        const score = Math.min(monthActivities.length * 10, 100);

        trend.push({
            period: monthName,
            activities: monthActivities.length,
            score,
        });
    }

    return trend;
}

export function getHealthLevelColor(level: EngagementMetrics['relationshipHealth']['level']): string {
    switch (level) {
        case 'excellent':
            return 'text-green-600';
        case 'good':
            return 'text-blue-600';
        case 'fair':
            return 'text-yellow-600';
        case 'poor':
            return 'text-red-600';
        default:
            return 'text-gray-600';
    }
}

export function getHealthLevelLabel(level: EngagementMetrics['relationshipHealth']['level']): string {
    switch (level) {
        case 'excellent':
            return 'Excelente';
        case 'good':
            return 'Bom';
        case 'fair':
            return 'Regular';
        case 'poor':
            return 'Ruim';
        default:
            return 'Indefinido';
    }
}

export function getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
        case 'up':
            return '↗️';
        case 'down':
            return '↘️';
        case 'stable':
            return '➡️';
        default:
            return '➡️';
    }
}

export function getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
        case 'up':
            return 'text-green-600';
        case 'down':
            return 'text-red-600';
        case 'stable':
            return 'text-gray-600';
        default:
            return 'text-gray-600';
    }
}