'use client';

import { Bell, User, Search, Menu, ChevronDown, Settings, HelpCircle, LogOut, PanelLeft } from 'lucide-react';
import { Button } from './ui/button';
// import { useSession, signOut } from 'next-auth/react';
import { ThemeSelector } from '@/components/theme-selector';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { MainNav } from './main-nav';
import { UserNav } from './user-nav';

export function Header({ }) {
  // const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  // Prevenir problemas de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  // Manipulador de logout
  // const handleLogout = async () => {
  //   try {
  //     await signOut({ callbackUrl: '/login' });
  //   } catch (error) {
  //     console.error('Logout failed:', error);
  //     toast({
  //       title: 'Erro ao sair',
  //       description: 'Não foi possível fazer logout. Tente novamente.',
  //       variant: 'destructive',
  //     });
  //   }
  // };

  return (
    <header className="sticky h-[56px] bg-card border-b border-border shadow-xs top-0 left-0 right-0 z-30 dark:border-border">
      <div className="h-full flex items-center gap-4 px-4">
        <div className="flex-1 max-w-3xl mx-auto">
          <div className="relative">
            <input
              type="search"
              placeholder="Pesquisar..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background dark:text-foreground"
              spellCheck={false}
              data-ms-editor="true"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Seletor de Tema Melhorado */}
          {mounted && <ThemeSelector />}

          {/* Notificações */}
          <button className="relative">
            <Bell className="h-6 w-6 text-foreground" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full text-destructive-foreground text-xs flex items-center justify-center">
              1
            </span>
          </button>

          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <MainNav />
            </SheetContent>
          </Sheet>
          <div className="relative ml-auto flex-1 md:grow-0">
            {/* Search can be added here */}
          </div>
          <UserNav />

          {/* Menu do Usuário */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-flex dark:text-foreground">{session?.user?.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-card dark:border-border">
              <DropdownMenuLabel className="dark:text-foreground">Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator className="dark:bg-border" />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="dark:text-foreground dark:hover:text-foreground">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="dark:text-foreground dark:hover:text-foreground">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help" className="dark:text-foreground dark:hover:text-foreground">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Ajuda</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="dark:bg-border" />
              <DropdownMenuItem onClick={handleLogout} className="dark:text-foreground dark:hover:text-foreground">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
      </div>
    </header>
  );
}