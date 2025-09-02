
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/contexts/UserContext";
import { Loader2 } from "lucide-react";

export function UserNav() {
    const { user, loading } = useUser();

    if (loading) {
        return (
            <Button variant="ghost" className="relative h-8 w-8 rounded-full" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
        );
    }

    if (!user) {
        return (
            <Button variant="ghost" className="relative h-8 w-8 rounded-full" disabled>
                <Avatar className="h-8 w-8">
                    <AvatarFallback>?</AvatarFallback>
                </Avatar>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>Perfil</DropdownMenuItem>
                    <DropdownMenuItem>Conta</DropdownMenuItem>
                    <DropdownMenuItem>Configurações</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Sair</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
