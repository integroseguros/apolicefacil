export interface CepData {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
    erro?: boolean;
}

export async function fetchCepData(cep: string): Promise<CepData | null> {
    try {
        // Remove caracteres não numéricos
        const cleanCep = cep.replace(/\D/g, '');

        // Valida se o CEP tem 8 dígitos
        if (cleanCep.length !== 8) {
            throw new Error('CEP deve ter 8 dígitos');
        }

        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);

        if (!response.ok) {
            throw new Error('Erro ao buscar CEP');
        }

        const data: CepData = await response.json();

        // Verifica se o CEP foi encontrado
        if (data.erro) {
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        return null;
    }
}

export function formatCep(cep: string): string {
    const cleanCep = cep.replace(/\D/g, '');
    return cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2');
}

export function isValidCep(cep: string): boolean {
    const cleanCep = cep.replace(/\D/g, '');
    return cleanCep.length === 8 && /^\d{8}$/.test(cleanCep);
}