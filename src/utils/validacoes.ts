import { z } from 'zod';

interface ErrosValidacao {
  [key: string]: string;
}

export const validarFormularioOportunidade = (dados: any): ErrosValidacao => {
  const erros: ErrosValidacao = {};

  if (!dados.titulo?.trim()) {
    erros.titulo = 'O título é obrigatório';
  }

  if (!dados.clienteId) {
    erros.clienteId = 'Selecione um cliente';
  }

  if (!dados.produtoId) {
    erros.produtoId = 'Selecione um produto';
  }

  if (dados.valor === undefined || dados.valor === null) {
    erros.valor = 'Informe um valor válido';
  } else {
    // Converter para número se for string
    const valorNumerico = typeof dados.valor === 'string'
      ? parseFloat(dados.valor)
      : dados.valor;

    if (isNaN(valorNumerico) || valorNumerico < 0) {
      erros.valor = 'Informe um valor válido maior ou igual a zero';
    }
  }

  if (!dados.responsavelId) {
    erros.responsavelId = 'Selecione um responsável';
  }

  if (!dados.dataPrevisaoFechamento) {
    erros.dataPrevisaoFechamento = 'Selecione uma data de previsão';
  }

  if (!dados.prioridade) {
    erros.prioridade = 'Selecione a prioridade';
  }

  if (!dados.origemId) {
    erros.origemId = 'Selecione a origem';
  }

  return erros;
};

export const oportunidadeSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório").max(100),
  clienteId: z.number().positive("Cliente é obrigatório"),
  valor: z.number().min(0, "Valor não pode ser negativo"),
  funilId: z.number().positive("Funil é obrigatório"),
  etapaId: z.number().positive("Etapa é obrigatória"),
  responsavelId: z.number().nullable(),
  origemId: z.number().nullable(),
  produtoId: z.number().nullable(),
  proximoContato: z.date().nullable().optional(),
  dataPrevisaoFechamento: z.date().nullable().optional(),
  prioridade: z.enum(["alta", "media", "baixa"]),
  descricao: z.string().nullable().optional(),
});

export const validarCpfCnpj = (valor: string): boolean => {
  // Remove caracteres não numéricos
  const numeros = valor.replace(/\D/g, '');

  // Validação de CPF
  if (numeros.length === 11) {
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numeros)) return false;

    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(numeros.charAt(i)) * (10 - i);
    }
    let digito1 = 11 - (soma % 11);
    if (digito1 > 9) digito1 = 0;
    if (digito1 !== parseInt(numeros.charAt(9))) return false;

    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(numeros.charAt(i)) * (11 - i);
    }
    let digito2 = 11 - (soma % 11);
    if (digito2 > 9) digito2 = 0;
    if (digito2 !== parseInt(numeros.charAt(10))) return false;

    return true;
  }

  // Validação de CNPJ
  if (numeros.length === 14) {
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(numeros)) return false;

    // Validação do primeiro dígito verificador
    let soma = 0;
    let multiplicador = 5;
    for (let i = 0; i < 12; i++) {
      soma += parseInt(numeros.charAt(i)) * multiplicador;
      multiplicador = multiplicador === 2 ? 9 : multiplicador - 1;
    }
    let digito1 = soma % 11;
    digito1 = digito1 < 2 ? 0 : 11 - digito1;
    if (digito1 !== parseInt(numeros.charAt(12))) return false;

    // Validação do segundo dígito verificador
    soma = 0;
    multiplicador = 6;
    for (let i = 0; i < 13; i++) {
      soma += parseInt(numeros.charAt(i)) * multiplicador;
      multiplicador = multiplicador === 2 ? 9 : multiplicador - 1;
    }
    let digito2 = soma % 11;
    digito2 = digito2 < 2 ? 0 : 11 - digito2;
    if (digito2 !== parseInt(numeros.charAt(13))) return false;

    return true;
  }

  return false;
};

export const validarEmail = (email: string): boolean => {
  // Expressão regular para validação de email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Função para formatar CPF/CNPJ
export const formatarCpfCnpj = (valor: string): string => {
  const numeros = valor.replace(/\D/g, '');

  if (numeros.length === 11) {
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  if (numeros.length === 14) {
    return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  return valor;
};

// Função para formatar telefone
export const formatarTelefone = (telefone: string): string => {
  const numeros = telefone.replace(/\D/g, '');

  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  if (numeros.length === 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return telefone;
};