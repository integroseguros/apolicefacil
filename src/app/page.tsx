
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldCheck, RefreshCw, Gift, Calendar } from "lucide-react";
import PageHeader from "@/components/page-header";
import { DashboardCharts } from "@/components/dashboard-charts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const kpiData = [
  {
    title: "Receita Total",
    value: "R$ 45.231,89",
    change: "+20.1% que no mês passado",
    icon: <Gift className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: "Apólices Ativas",
    value: "+2,350",
    change: "+180.1% que no mês passado",
    icon: <ShieldCheck className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: "Novos Clientes",
    value: "+12,234",
    change: "+19% que no mês passado",
    icon: <Users className="h-4 w-4 text-muted-foreground" />,
  },
];

export default function DashboardPage() {
  return (
    <>
      <div className="p-6 space-y-6">
        <PageHeader title="Dashboard" />
        <div className="flex justify-end items-center">
          <div className="flex gap-4">
            <Select defaultValue="hoje">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">Esta Semana</SelectItem>
                <SelectItem value="mes">Este Mês</SelectItem>
                <SelectItem value="ano">Este Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">
                Aniversariantes
              </CardTitle>
              <Gift className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                    Hoje (2)
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                    Semana (1)
                  </span>
                </div>
                <div className="text-sm text-gray-500 py-8">
                  <p className="text-xs text-muted-foreground">09/07 - Alice Johnson</p>
                  <p className="text-xs text-muted-foreground">09/07 - Charlie Brown</p>
                  <p className="text-xs text-muted-foreground">11/07 - Bob Smith</p>
                </div>
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver todos aniversariantes
                </Button>
              </div>
            </CardContent>
          </Card>
          {kpiData.map((kpi, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                {kpi.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">{kpi.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <DashboardCharts />
      </div>
    </>
  );
}
