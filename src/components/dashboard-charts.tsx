
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";

const revenueData = [
    { month: "Jan", revenue: 4000 },
    { month: "Fev", revenue: 3000 },
    { month: "Mar", revenue: 5000 },
    { month: "Abr", revenue: 4500 },
    { month: "Mai", revenue: 6000 },
    { month: "Jun", revenue: 7000 },
];

const policyData = [
    { name: 'Auto', value: 400 },
    { name: 'Residência', value: 300 },
    { name: 'Vida', value: 200 },
    { name: 'Saúde', value: 278 },
    { name: 'Negócios', value: 189 },
]

const chartConfig = {
    revenue: {
        label: "Receita",
    },
    value: {
        label: "Valor",
    }
} satisfies ChartConfig;


export function DashboardCharts() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
                <CardHeader>
                    <CardTitle>Visão Geral da Receita</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ChartContainer config={chartConfig} className="h-[350px] w-full">
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Apólices por Produto</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[350px] w-full">
                        <RechartsBarChart data={policyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
