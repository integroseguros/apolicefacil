"use client";

import { createContext, type ReactNode, useState, useEffect } from "react";
import type { AnyProposta } from "@/types/proposta";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";

interface PropostaContextType {
    propostas: AnyProposta[];
    getProposta: (id: string) => AnyProposta | undefined;
    addProposta: (proposta: AnyProposta) => void;
    updateProposta: (proposta: AnyProposta) => void;
    deleteProposta: (id: string) => void;
    isLoaded: boolean;
}

export const PropostaContext = createContext<PropostaContextType>({
    propostas: [],
    getProposta: () => undefined,
    addProposta: () => { },
    updateProposta: () => { },
    deleteProposta: () => { },
    isLoaded: false,
});

export function PropostaProvider({ children }: { children: ReactNode }) {
    const [propostas, setPropostas] = useLocalStorage<AnyProposta[]>(
        "propostas",
        []
    );
    const [isLoaded, setIsLoaded] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsLoaded(true);
    }, []);


    const getProposta = (id: string) => {
        return propostas.find((p) => p.id === id);
    };

    const addProposta = (proposta: AnyProposta) => {
        setPropostas([...propostas, proposta]);
        toast({
            title: "Sucesso!",
            description: "Proposta criada com sucesso.",
        });
    };

    const updateProposta = (updatedProposta: AnyProposta) => {
        setPropostas(
            propostas.map((p) => (p.id === updatedProposta.id ? updatedProposta : p))
        );
        toast({
            title: "Sucesso!",
            description: "Proposta atualizada com sucesso.",
        });
    };

    const deleteProposta = (id: string) => {
        setPropostas(propostas.filter((p) => p.id !== id));
        toast({
            title: "Sucesso!",
            description: "Proposta excluída com sucesso.",
        });
    };

    return (
        <PropostaContext.Provider
            value={{
                propostas,
                getProposta,
                addProposta,
                updateProposta,
                deleteProposta,
                isLoaded,
            }}
        >
            {children}
        </PropostaContext.Provider>
    );
}
