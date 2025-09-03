'use client'

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, LucideUserRoundPlus, UserPlus } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { user } from "../../../../prisma/generated/prisma";
import { toast } from "sonner"
import Link from "next/link";
import { PerfisTab } from "@/components/usuarios/PerfisTab";

const usuarios: user[] = [
    {
        id: "",
        name: "",
        email: "",
        phone: "",
        role: "",
        roleId: "",
        status: "1",
        password: "",
        avatarUrl: "https://placehold.co/100x100.png",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];
function UserManagementTab() {
    const [usuarios, setUsuarios] = useState<user[]>([]);

    // Função para buscar usuários (refresh)
    const fetchUsuarios = useCallback(async () => {
        try {
            const response = await fetch('/api/usuarios');
            if (!response.ok) {
                throw new Error('Falha ao buscar usuários');
            }
            const data = await response.json();
            setUsuarios(data.usuarios || []);
            toast.success("Sucesso!", {
                description: "Usuários atualizados.",
                action: {
                    label: "Ok",
                    onClick: () => console.log("Ok"),
                },
            });
        } catch (err) {
            console.error('Erro ao buscar usuários:', err);
            toast.error("Erro!", {
                description: "Falha ao carregar usuários.",
                action: {
                    label: "Ok",
                    onClick: () => console.log("Ok"),
                },
            });
        }
    }, [toast]);

    useEffect(() => {
        fetchUsuarios();
    }, [fetchUsuarios]);


    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Usuários</CardTitle>
                        <CardDescription>
                            Gerencie os usuários do seu aplicativo e seus perfis.
                        </CardDescription>
                    </div>
                    <Button size="sm" className="gap-1" asChild>
                        <Link href="/config/usuarios/novo">
                            <UserPlus className="h-4 w-4" />
                            Adicionar Usuário
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="hidden w-[100px] sm:table-cell">Avatar</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>E-mail</TableHead>
                            <TableHead>Perfil</TableHead>
                            <TableHead>Ações</TableHead>
                            <TableHead>
                                <span className="sr-only">Ações</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {usuarios.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="hidden sm:table-cell">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name ?? undefined} data-ai-hint="person" />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === "Admin" ? "default" : "secondary"}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                            <DropdownMenuItem>Editar</DropdownMenuItem>
                                            <DropdownMenuItem>Deletar</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function RoleManagementTab() {
    return (
        <PerfisTab />
    );
}


export default function SettingsPage() {
    return (
        <>
            <div className="flex items-start">
                <div className="mr-4 pt-1">
                    <LucideUserRoundPlus className="h-6 w-6" />
                </div>
                <PageHeader title="Usuários e Perfis" />
            </div>
            <Tabs defaultValue="users">
                <TabsList>
                    <TabsTrigger value="users">Usuários</TabsTrigger>
                    <TabsTrigger value="roles">Perfis</TabsTrigger>
                </TabsList>
                <TabsContent value="users">
                    <UserManagementTab />
                </TabsContent>
                <TabsContent value="roles">
                    <RoleManagementTab />
                </TabsContent>
            </Tabs>
        </>
    );
}
