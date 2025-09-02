
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, Users, Kanban, Settings, ClipboardList, MessageCircle, DollarSign, Gauge, CalendarRange, Calendar, UserRound, BadgeDollarSign, Wallet, Shield, Crosshair, Volume2, Upload, FolderClosed, ChartArea } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/financeiro", label: "Gestão Financeira", icon: DollarSign },
    { href: "/atendimento", label: "Atendimentos", icon: MessageCircle },
    { href: "/dashboard", label: "Dashboard", icon: Gauge },
    { href: "/hoje", label: "Meu Dia", icon: CalendarRange },
    { href: "/agenda", label: "Agenda", icon: Calendar },
    { href: "/clientes", label: "Clientes", icon: UserRound },
    { href: "/leads", label: "Leads", icon: Users },
    { href: "/oportunidades", label: "Oportunidades", icon: Kanban },
    { href: "/apolices", label: "Propostas & Apolices", icon: ClipboardList },
    { href: "/multi-calculo", label: "Multi Cálculo", icon: BadgeDollarSign },
    { href: "/financas", label: "Financeiro", icon: Wallet },
    { href: "/sinistros", label: "Sinistros", icon: Shield },
    { href: "/cross-selling", label: "Cross Selling", icon: Crosshair },
    { href: "/campanhas", label: "Campanhas", icon: Volume2 },
    { href: "/importador", label: "Importador", icon: Upload },
    { href: "/arquivos", label: "Arquivos", icon: FolderClosed },
    { href: "/relatorios", label: "Relatórios", icon: ChartArea },
    { href: "/config", label: "Configurações", icon: Settings },
];

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname();

    return (
        <nav className={cn("flex flex-col h-full", className)} {...props}>
            <div className="flex h-16 items-center border-b px-4 lg:h-14 lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Building2 className="h-6 w-6 text-primary" />
                    <span className="">ApóliceFácil</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <div className="flex flex-col items-start pb-10 gap-2 px-4 text-sm font-medium">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary w-full",
                                    isActive && "bg-accent text-primary"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
