'use client';

import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
    RefreshCw,
    FileSpreadsheet,
    Upload,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClienteExcel, ClienteProcessado } from '@/types';
import {
    validarCpfCnpj,
    validarEmail,
    formatarCpfCnpj,
    formatarTelefone
} from '@/utils/validacoes';

export default function ImportacaoClientesForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string>('');
    const [clientes, setClientes] = useState<ClienteProcessado[]>([]);
    const [processando, setProcessando] = useState(false);
    const [arquivoTemporario, setArquivoTemporario] = useState<File | null>(null);

    // Função para validar os dados
    const validarDados = (cliente: ClienteExcel): ClienteProcessado => {
        const errors: string[] = [];

        // Validações básicas
        if (!cliente.nome?.trim()) {
            errors.push('Nome é obrigatório');
        }

        if (!cliente.tipoPessoa?.trim()) {
            errors.push('Tipo de pessoa é obrigatório');
        } else if (!['PF', 'PJ'].includes(cliente.tipoPessoa.toUpperCase())) {
            errors.push('Tipo de pessoa deve ser FISICA ou JURIDICA');
        }

        if (cliente.cnpjCpf) {
            const numerosCpfCnpj = cliente.cnpjCpf.replace(/\D/g, '');
            if (!validarCpfCnpj(numerosCpfCnpj)) {
                errors.push('CPF/CNPJ inválido');
            }
        }

        if (cliente.email && !validarEmail(cliente.email)) {
            errors.push('E-mail inválido');
        }

        return {
            ...cliente,
            cnpjCpf: cliente.cnpjCpf ? formatarCpfCnpj(cliente.cnpjCpf) : undefined,
            telefoneCelular: cliente.telefoneCelular ? formatarTelefone(cliente.telefoneCelular) : undefined,
            status: 'ATIVO',
            isValid: errors.length === 0,
            errors
        };
    };

    // Função para ler o arquivo Excel
    const processarArquivo = async (file: File) => {
        setIsLoading(true);
        setArquivoTemporario(file);

        try {
            const data = await file.arrayBuffer(); // Lê o arquivo como ArrayBuffer

            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(data); // Carrega os dados do Excel

            // Assume que você quer a primeira planilha
            const worksheet = workbook.worksheets[0];

            if (!worksheet) {
                throw new Error('Arquivo Excel não contém planilhas.');
            }

            // Verifica se a planilha tem pelo menos 2 linhas (cabeçalho + 1 de dado)
            if (worksheet.rowCount < 2) {
                throw new Error('Arquivo vazio ou sem dados válidos.');
            }

            // --- Leitura do Cabeçalho ---
            // Acessa a primeira linha (cabeçalho)
            const headerRow = worksheet.getRow(1);
            if (!headerRow) {
                throw new Error('Cabeçalho não encontrado na planilha.');
            }

            // Extrai e normaliza os cabeçalhos
            const headers: string[] = [];
            headerRow.eachCell((cell, colNumber) => {
                const headerText = cell.value ? String(cell.value).toLowerCase().trim().replace(/\s+/g, '') : '';
                headers.push(headerText);
            });

            // Função tipada para encontrar o valor da coluna
            // Acessa o valor da célula diretamente pelo índice da coluna
            const getColumnValue = (row: ExcelJS.Row, columnName: string): string => {
                const index = headers.findIndex(h => h === columnName.toLowerCase());
                if (index === -1) return '';

                // `getCell(colNumber)` recebe o número da coluna baseado em 1 (não 0)
                const cell = row.getCell(index + 1);
                const value = cell.value;

                if (value === null || value === undefined) return '';

                // ExcelJS retorna datas como objetos Date. Se espera string, converta.
                if (value instanceof Date) {
                    // Adapte o formato da data conforme necessário (ex: 'DD/MM/YYYY')
                    return value.toLocaleDateString('pt-BR');
                }

                return String(value).trim();
            };

            // --- Processamento das Linhas de Dados ---
            const clientesProcessados: ClienteProcessado[] = [];

            // Itera sobre as linhas, começando da segunda (índice 2, pois ExcelJS é baseado em 1)
            // worksheet.eachRow percorre todas as linhas
            // Começa da segunda linha para ignorar o cabeçalho
            for (let i = 2; i <= worksheet.rowCount; i++) {
                const row = worksheet.getRow(i);
                // Verifica se a linha não está completamente vazia (pode ser ajustado)
                if (row.actualCellCount === 0) continue;

                const clienteExcel: ClienteExcel = {
                    nome: getColumnValue(row, 'nome'),
                    tipoPessoa: getColumnValue(row, 'tipopessoa'),
                    cnpjCpf: getColumnValue(row, 'cnpjcpf'),
                    email: getColumnValue(row, 'email'),
                    telefoneResidencial: getColumnValue(row, 'telefoneResidencial'),
                    telefoneComercial: getColumnValue(row, 'telefoneComercial'),
                    telefoneCelular: getColumnValue(row, 'telefoneCelular'),
                    cep: getColumnValue(row, 'cep'),
                    endereco: getColumnValue(row, 'endereco'),
                    numero: getColumnValue(row, 'numero'),
                    complemento: getColumnValue(row, 'complemento'),
                    bairro: getColumnValue(row, 'bairro'),
                    cidade: getColumnValue(row, 'cidade'),
                    estado: getColumnValue(row, 'estado')
                };

                clientesProcessados.push(validarDados(clienteExcel));
            }

            setClientes(clientesProcessados);
            setFileName(file.name);

            toast({
                title: "Arquivo processado",
                description: `${clientesProcessados.length} registros encontrados`,
                variant: "success"
            });

        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            toast({
                title: "Erro",
                description: "Erro ao processar o arquivo. Verifique o formato dos dados.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Função para limpar os dados
    const limparDados = () => {
        setClientes([]);
        setFileName('');
        setArquivoTemporario(null);
    };

    // Função para reprocessar o arquivo
    const reprocessarArquivo = async () => {
        if (arquivoTemporario) {
            await processarArquivo(arquivoTemporario);
        }
    };

    // Funções de manipulação de arquivo
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processarArquivo(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processarArquivo(file);
    };

    // Função para importar os dados
    const importarDados = async () => {
        setProcessando(true);
        try {
            const clientesValidos = clientes.filter(c => c.isValid);

            const response = await fetch('/api/importacao/clientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ clientes: clientesValidos }),
            });

            const resultado = await response.json();

            if (resultado.resultados.erros > 0) {
                // Se houver erros, mostramos o toast com opção de reprocessar
                toast({
                    title: "Importação parcial",
                    description: (
                        <div className="flex flex-col gap-2">
                            <span>{resultado.mensagem}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={reprocessarArquivo}
                            >
                                Reprocessar arquivo
                            </Button>
                        </div>
                    ),
                    variant: "destructive"
                });
            } else {
                // Se for sucesso completo, limpamos os dados
                toast({
                    title: "Sucesso",
                    description: resultado.mensagem,
                    variant: "success"
                });
                limparDados();
            }

        } catch (error) {
            console.error('Erro:', error);
            toast({
                title: "Erro",
                description: (
                    <div className="flex flex-col gap-2">
                        <span>Erro ao importar dados</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={reprocessarArquivo}
                        >
                            Tentar novamente
                        </Button>
                    </div>
                ),
                variant: "destructive"
            });
        } finally {
            setProcessando(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Área de Upload */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload de Arquivo</CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">
                            Arraste e solte seu arquivo Excel aqui ou
                        </p>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="fileInput"
                            aria-label="Selecione um arquivo Excel para importar"
                        />
                        <Button
                            variant="outline"
                            onClick={() => document.getElementById('fileInput')?.click()}
                            disabled={isLoading}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Selecionar Arquivo
                        </Button>
                        {fileName && (
                            <p className="mt-2 text-sm text-gray-500">
                                Arquivo selecionado: {fileName}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Preview dos Dados */}
            {clientes.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>
                                Preview dos Dados
                                <span className="text-sm text-gray-500 ml-2">
                                    ({clientes.filter(c => c.isValid).length} válidos de {clientes.length} total)
                                </span>
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={limparDados}
                                    disabled={processando}
                                >
                                    Limpar Dados
                                </Button>
                                <Button
                                    onClick={importarDados}
                                    disabled={processando || clientes.filter(c => c.isValid).length === 0}
                                >
                                    {processando ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Importando...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Importar Dados
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>CPF/CNPJ</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Telefone</TableHead>
                                        <TableHead>Cidade/UF</TableHead>
                                        <TableHead>Erros</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clientes.map((cliente, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {cliente.isValid ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-500" />
                                                )}
                                            </TableCell>
                                            <TableCell>{cliente.nome}</TableCell>
                                            <TableCell>{cliente.tipoPessoa}</TableCell>
                                            <TableCell>{cliente.cnpjCpf}</TableCell>
                                            <TableCell>{cliente.email}</TableCell>
                                            <TableCell>{cliente.telefoneCelular}</TableCell>
                                            <TableCell>
                                                {cliente.cidade}/{cliente.estado}
                                            </TableCell>
                                            <TableCell>
                                                {cliente.errors.length > 0 && (
                                                    <div className="flex items-center text-red-500">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {cliente.errors.join(', ')}
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}