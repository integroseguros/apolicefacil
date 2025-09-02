import { cn } from "@/lib/utils"; // Certifique-se que o cn está importado
import React from "react";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    children,
    className,
    ...props
}) => {
    return (
        // AQUI ESTÁ A MUDANÇA PRINCIPAL: flex justify-between items-center
        <div
            className={cn("flex items-center justify-between w-full", className)}
            {...props}
        >
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <div>{children}</div> {/* Onde o botão "Novo Registro" será renderizado */}
        </div>
    );
};

export default PageHeader;