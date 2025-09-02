/**
 * Document validation and formatting utilities for CPF and CNPJ
 * Brazilian tax document validation with proper digit verification algorithms
 */

/**
 * Validates a CPF (Cadastro de Pessoas Físicas) document
 * @param cpf - The CPF string to validate (can contain formatting)
 * @returns boolean indicating if the CPF is valid
 */
export function validateCPF(cpf: string): boolean {
    if (!cpf) return false;

    // Remove all non-digit characters
    const cleaned = cpf.replace(/\D/g, '');

    // Check if it has exactly 11 digits
    if (cleaned.length !== 11) return false;

    // Check for known invalid CPFs (all same digits)
    if (/^(\d)\1{10}$/.test(cleaned)) return false;

    // Calculate first verification digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    const firstDigit = remainder < 2 ? 0 : 11 - remainder;

    // Check first verification digit
    if (parseInt(cleaned.charAt(9)) !== firstDigit) return false;

    // Calculate second verification digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    const secondDigit = remainder < 2 ? 0 : 11 - remainder;

    // Check second verification digit
    return parseInt(cleaned.charAt(10)) === secondDigit;
}

/**
 * Validates a CNPJ (Cadastro Nacional da Pessoa Jurídica) document
 * @param cnpj - The CNPJ string to validate (can contain formatting)
 * @returns boolean indicating if the CNPJ is valid
 */
export function validateCNPJ(cnpj: string): boolean {
    if (!cnpj) return false;

    // Remove all non-digit characters
    const cleaned = cnpj.replace(/\D/g, '');

    // Check if it has exactly 14 digits
    if (cleaned.length !== 14) return false;

    // Check for known invalid CNPJs (all same digits)
    if (/^(\d)\1{13}$/.test(cleaned)) return false;

    // Calculate first verification digit
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cleaned.charAt(i)) * weights1[i];
    }
    let remainder = sum % 11;
    const firstDigit = remainder < 2 ? 0 : 11 - remainder;

    // Check first verification digit
    if (parseInt(cleaned.charAt(12)) !== firstDigit) return false;

    // Calculate second verification digit
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
        sum += parseInt(cleaned.charAt(i)) * weights2[i];
    }
    remainder = sum % 11;
    const secondDigit = remainder < 2 ? 0 : 11 - remainder;

    // Check second verification digit
    return parseInt(cleaned.charAt(13)) === secondDigit;
}

/**
 * Formats a CPF string with the standard Brazilian pattern (000.000.000-00)
 * @param cpf - The CPF string to format (digits only or with existing formatting)
 * @returns Formatted CPF string or empty string if invalid input
 */
export function formatCPF(cpf: string): string {
    if (!cpf) return '';

    // Remove all non-digit characters
    const cleaned = cpf.replace(/\D/g, '');

    // Return empty string if not enough digits
    if (cleaned.length === 0) return '';

    // Apply formatting based on length
    if (cleaned.length <= 3) {
        return cleaned;
    } else if (cleaned.length <= 6) {
        return cleaned.replace(/(\d{3})(\d+)/, '$1.$2');
    } else if (cleaned.length <= 9) {
        return cleaned.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    } else if (cleaned.length <= 11) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
    } else {
        // Truncate to 11 digits and format
        const truncated = cleaned.substring(0, 11);
        return truncated.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
}

/**
 * Formats a CNPJ string with the standard Brazilian pattern (00.000.000/0000-00)
 * @param cnpj - The CNPJ string to format (digits only or with existing formatting)
 * @returns Formatted CNPJ string or empty string if invalid input
 */
export function formatCNPJ(cnpj: string): string {
    if (!cnpj) return '';

    // Remove all non-digit characters
    const cleaned = cnpj.replace(/\D/g, '');

    // Return empty string if not enough digits
    if (cleaned.length === 0) return '';

    // Apply formatting based on length
    if (cleaned.length <= 2) {
        return cleaned;
    } else if (cleaned.length <= 5) {
        return cleaned.replace(/(\d{2})(\d+)/, '$1.$2');
    } else if (cleaned.length <= 8) {
        return cleaned.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    } else if (cleaned.length <= 12) {
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
    } else if (cleaned.length <= 14) {
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
    } else {
        // Truncate to 14 digits and format
        const truncated = cleaned.substring(0, 14);
        return truncated.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
}

/**
 * Formats a document based on its type (CPF or CNPJ)
 * @param value - The document string to format
 * @param type - The document type ('CPF' or 'CNPJ')
 * @returns Formatted document string
 */
export function formatDocument(value: string, type: 'CPF' | 'CNPJ'): string {
    if (type === 'CPF') {
        return formatCPF(value);
    } else {
        return formatCNPJ(value);
    }
}

/**
 * Validates a document based on its type (CPF or CNPJ)
 * @param value - The document string to validate
 * @param type - The document type ('CPF' or 'CNPJ')
 * @returns boolean indicating if the document is valid
 */
export function validateDocument(value: string, type: 'CPF' | 'CNPJ'): boolean {
    if (type === 'CPF') {
        return validateCPF(value);
    } else {
        return validateCNPJ(value);
    }
}

/**
 * Removes all formatting from a document string, leaving only digits
 * @param document - The document string to clean
 * @returns String with only digits
 */
export function cleanDocument(document: string): string {
    if (!document) return '';
    return document.replace(/\D/g, '');
}

/**
 * Determines the document type based on the cleaned length
 * @param document - The document string to analyze
 * @returns 'CPF' | 'CNPJ' | null
 */
export function getDocumentType(document: string): 'CPF' | 'CNPJ' | null {
    const cleaned = cleanDocument(document);
    if (cleaned.length === 11) return 'CPF';
    if (cleaned.length === 14) return 'CNPJ';
    return null;
}