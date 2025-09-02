// src\app\config\corretora\importar-clientes\page.tsx

import { FolderSync } from "lucide-react";

import ImportacaoClientesForm from '@/components/Clientes/ImportadorForm';

export default function ImportadorPage() {

    return (
        <div className="container mx-auto py-6">
            {/* Cabeçalho */}
            <div className="flex justify-start items-center ml-6">
                <FolderSync className="h-8 w-8 text-blue-500 mr-3" />
                <h1 className="text-2xl font-bold">Importação de Clientes</h1>
            </div>
            <ImportacaoClientesForm />
        </div>
    );
}