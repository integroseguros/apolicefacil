// src/utils/formatters.ts

/**
 * Formata um número de telefone para o padrão brasileiro.
 * Aceita strings que podem ser nulas ou indefinidas.
 * @param phone - O número de telefone (10 ou 11 dígitos) como string.
 * @returns O telefone formatado como string, ou null se a entrada for inválida.
 */
export const formatPhone = (phone: string | null | undefined): string | null => {
    // Retorna nulo se a entrada for nula, indefinida ou uma string vazia
    if (!phone) {
        return null;
    }

    // Remove tudo que não for dígito
    const cleaned = phone.replace(/\D/g, '');

    // (99) 99999-9999 para celulares
    if (cleaned.length === 11) {
        return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    }

    // (99) 9999-9999 para telefones fixos
    if (cleaned.length === 10) {
        return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    }

    // Se não se encaixar nas regras, retorna nulo para evitar exibir dados mal formatados.
    // Ou você pode optar por retornar 'cleaned' ou 'phone' se preferir.
    return null;
};

export function formatCurrency(value: number | null | undefined): string {
    if (value == null || isNaN(value)) {
        return 'R$ 0,00';
    }

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

// Função auxiliar para formatar a data
export const formatarData = (input: string | Date | null | undefined): string => {
    if (!input) {
        return ''; // Retorna vazio se a data for nula ou indefinida
    }

    let data: Date;

    // Se já é um objeto Date
    if (input instanceof Date) {
        data = input;
    }
    // Se é uma string
    else if (typeof input === 'string') {
        // Se já está no formato DD/MM/AAAA, retorna como está
        if (input.includes('/') && input.length === 10) {
            return input;
        }

        // Se contém " a " (formato de vigência), pega apenas a primeira parte
        if (input.includes(' a ')) {
            const primeiraParte = input.split(' a ')[0].trim();
            return formatarData(primeiraParte);
        }

        // Tenta criar Date a partir da string
        data = new Date(input);

        // Se a string está no formato AAAA-MM-DD
        if (input.includes('-') && input.length >= 10) {
            const [ano, mes, dia] = input.split('-').map(Number);
            if (!isNaN(ano) && !isNaN(mes) && !isNaN(dia)) {
                data = new Date(ano, mes - 1, dia);
            }
        }
    }
    else {
        return ''; // Tipo não suportado
    }

    // Verifica se a data é válida
    if (isNaN(data.getTime())) {
        return ''; // Data inválida
    }

    // Garante que o dia e o mês tenham sempre 2 dígitos
    const diaFormatado = String(data.getDate()).padStart(2, '0');
    const mesFormatado = String(data.getMonth() + 1).padStart(2, '0'); // +1 porque o mês é baseado em 0
    const anoFormatado = data.getFullYear();

    return `${diaFormatado}/${mesFormatado}/${anoFormatado}`;
};

// Re-export document validation and formatting utilities for convenience
export {
    validateCPF,
    validateCNPJ,
    formatCPF,
    formatCNPJ,
    formatDocument,
    validateDocument,
    cleanDocument,
    getDocumentType,
} from './document-validators';