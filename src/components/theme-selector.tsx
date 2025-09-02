'use client';

import { useTheme } from "next-themes"
import { Button } from "./ui/button";
import { Sun, Moon, Laptop } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export function ThemeSelector() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Prevenir problemas de hidratação
    useEffect(() => {
        setMounted(true);
    }, []);

    // Fechar o dropdown quando clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="outline"
                className="w-[100px] h-9 flex items-center justify-center gap-2 text-foreground"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                {theme === "light" ? (
                    <Sun className="h-4 w-4" />
                ) : theme === "dark" ? (
                    <Moon className="h-4 w-4" />
                ) : (
                    <Laptop className="h-4 w-4" />
                )}
                <span className="dark:text-foreground">Tema</span>
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-md border border-border bg-background shadow-lg z-50">
                    <div className="py-1 flex flex-col">
                        <Button
                            className={`w-full text-left px-4 py-2 text-sm flex items-center hover:bg-accent hover:text-accent-foreground ${theme === "light" ? "bg-accent text-accent-foreground" : "text-foreground"
                                }`}
                            onClick={() => { setTheme("light"); setIsOpen(false); }}
                        >
                            <Sun className="h-4 w-4 mr-2" />
                            <span>Claro</span>
                        </Button>
                        <Button
                            className={`w-full text-left px-4 py-2 text-sm flex items-center hover:bg-accent hover:text-accent-foreground ${theme === "dark" ? "bg-accent text-accent-foreground" : "text-foreground"
                                }`}
                            onClick={() => { setTheme("dark"); setIsOpen(false); }}
                        >
                            <Moon className="h-4 w-4 mr-2" />
                            <span>Escuro</span>
                        </Button>
                        <Button
                            className={`w-full text-left px-4 py-2 text-sm flex items-center hover:bg-accent hover:text-accent-foreground ${theme === "system" ? "bg-accent text-accent-foreground" : "text-foreground"
                                }`}
                            onClick={() => { setTheme("system"); setIsOpen(false); }}
                        >
                            <Laptop className="h-4 w-4 mr-2" />
                            <span>Sistema</span>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}