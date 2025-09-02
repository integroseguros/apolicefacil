"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Shield, Users, Settings } from "lucide-react"

interface Profile {
    id: string
    name: string
    description: string
    permissions: string[]
    userCount: number
    isActive: boolean
}

const mockProfiles: Profile[] = [
    {
        id: "1",
        name: "Administrador",
        description: "Acesso total ao sistema",
        permissions: ["users.create", "users.edit", "users.delete", "policies.manage", "claims.manage"],
        userCount: 2,
        isActive: true
    },
    {
        id: "2",
        name: "Corretor",
        description: "Acesso para corretores de seguros",
        permissions: ["policies.create", "policies.edit", "customers.manage"],
        userCount: 15,
        isActive: true
    },
    {
        id: "3",
        name: "Atendente",
        description: "Acesso limitado para atendimento",
        permissions: ["customers.view", "policies.view"],
        userCount: 8,
        isActive: true
    }
]

export function PerfisTab() {
    const [profiles] = useState<Profile[]>(mockProfiles)

    const getPermissionIcon = (permission: string) => {
        if (permission.includes('users')) return <Users className="h-3 w-3" />
        if (permission.includes('policies') || permission.includes('claims')) return <Shield className="h-3 w-3" />
        return <Settings className="h-3 w-3" />
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Perfis de Usuário</h2>
                    <p className="text-muted-foreground">
                        Gerencie os perfis e permissões dos usuários
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Perfil
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {profiles.map((profile) => (
                    <Card key={profile.id} className="relative">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{profile.name}</CardTitle>
                                <Badge variant={profile.isActive ? "default" : "secondary"}>
                                    {profile.isActive ? "Ativo" : "Inativo"}
                                </Badge>
                            </div>
                            <CardDescription>{profile.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="h-4 w-4 mr-2" />
                                {profile.userCount} usuário{profile.userCount !== 1 ? 's' : ''}
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-2">Permissões:</h4>
                                <div className="flex flex-wrap gap-1">
                                    {profile.permissions.slice(0, 3).map((permission) => (
                                        <Badge key={permission} variant="outline" className="text-xs">
                                            {getPermissionIcon(permission)}
                                            <span className="ml-1">{permission.split('.')[0]}</span>
                                        </Badge>
                                    ))}
                                    {profile.permissions.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{profile.permissions.length - 3} mais
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Edit className="h-3 w-3 mr-1" />
                                    Editar
                                </Button>
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}