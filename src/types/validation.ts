// Validation schemas and functions for the simplified wizard

import { z } from 'zod';
import type {
    BasicPropostaFormData,
    StepValidation,
    ValidationError,
    InsuranceType
} from './wizard';

// Zod schemas for validation

// Step 1: Insurance Type validation
export const step1Schema = z.object({
    type: z.enum(['automovel', 'vida', 'residencial'], {
        message: 'Tipo de seguro deve ser automovel, vida ou residencial'
    })
});

// Step 2: Customer Data validation
export const step2Schema = z.object({
    name: z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres'),
    customerId: z.string()
        .min(1, 'Cliente deve ser selecionado'),
    email: z.string()
        .email('Email deve ter formato válido')
        .optional()
        .or(z.literal(''))
});

// Step 3: Basic Proposal Data validation
export const step3Schema = z.object({
    insuranceCompanyId: z.string()
        .min(1, 'Seguradora deve ser selecionada'),
    startDate: z.string()
        .min(1, 'Data de início é obrigatória')
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
    endDate: z.string()
        .min(1, 'Data de término é obrigatória')
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
    renewal: z.string()
        .min(1, 'Campo renovação é obrigatório'),
    tipoRenewal: z.string()
        .min(1, 'Tipo de renovação é obrigatório')
        .max(2, 'Tipo de renovação deve ter no máximo 2 caracteres'),
    situationDocument: z.string()
        .min(1, 'Situação do documento é obrigatória'),
    proposalNumber: z.string().optional(),
    previousPolicy: z.string().optional(),
    bonus: z.string().optional(),
    identificationCode: z.string().optional()
});

// Complete basic form validation
export const basicPropostaSchema = step1Schema
    .merge(step2Schema)
    .merge(step3Schema)
    .refine((data) => {
        if (data.startDate && data.endDate) {
            return new Date(data.startDate) < new Date(data.endDate);
        }
        return true;
    }, {
        message: 'Data de início deve ser anterior à data de término',
        path: ['endDate']
    });

// Specific details validation schemas
export const automovelDetailsSchema = z.object({
    model: z.string()
        .min(1, 'Modelo é obrigatório')
        .max(100, 'Modelo deve ter no máximo 100 caracteres'),
    manufacturerYear: z.number()
        .int('Ano deve ser um número inteiro')
        .min(1900, 'Ano deve ser maior que 1900')
        .max(new Date().getFullYear() + 1, 'Ano não pode ser futuro'),
    manufacturerYearModel: z.number()
        .int('Ano modelo deve ser um número inteiro')
        .min(1900, 'Ano modelo deve ser maior que 1900')
        .max(new Date().getFullYear() + 1, 'Ano modelo não pode ser futuro'),
    plate: z.string()
        .min(7, 'Placa deve ter pelo menos 7 caracteres')
        .max(10, 'Placa deve ter no máximo 10 caracteres')
        .regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/, 'Formato de placa inválido'),
    chassi: z.string()
        .max(17, 'Chassi deve ter no máximo 17 caracteres')
        .optional(),
    fuel: z.string()
        .max(10, 'Combustível deve ter no máximo 10 caracteres')
        .optional(),
    zeroKm: z.string()
        .max(1, 'Zero KM deve ter no máximo 1 caractere')
        .optional(),
    fipe: z.string()
        .max(10, 'Código FIPE deve ter no máximo 10 caracteres')
        .optional(),
    bonus: z.number()
        .min(0, 'Bônus deve ser positivo')
        .optional(),
    identificationCode: z.string()
        .max(10, 'Código de identificação deve ter no máximo 10 caracteres')
        .optional()
});

export const vidaDetailsSchema = z.object({
    nomeBeneficiario: z.string()
        .min(2, 'Nome do beneficiário deve ter pelo menos 2 caracteres')
        .max(100, 'Nome do beneficiário deve ter no máximo 100 caracteres'),
    valorCobertura: z.number()
        .positive('Valor de cobertura deve ser positivo')
        .max(999999999.99, 'Valor de cobertura muito alto'),
    tipoCobertura: z.string()
        .max(50, 'Tipo de cobertura deve ter no máximo 50 caracteres')
        .optional(),
    beneficiarios: z.array(z.object({
        id: z.string().optional(),
        nome: z.string()
            .min(2, 'Nome deve ter pelo menos 2 caracteres')
            .max(100, 'Nome deve ter no máximo 100 caracteres'),
        cpf: z.string()
            .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, 'CPF deve ter formato válido'),
        parentesco: z.string()
            .min(1, 'Parentesco é obrigatório')
            .max(50, 'Parentesco deve ter no máximo 50 caracteres'),
        percentual: z.number()
            .min(0, 'Percentual deve ser positivo')
            .max(100, 'Percentual não pode ser maior que 100')
    }))
        .optional()
        .refine((beneficiarios) => {
            if (!beneficiarios || beneficiarios.length === 0) return true;
            const totalPercentual = beneficiarios.reduce((sum, b) => sum + b.percentual, 0);
            return totalPercentual <= 100;
        }, {
            message: 'Soma dos percentuais não pode exceder 100%'
        })
});

export const residencialDetailsSchema = z.object({
    endereco: z.string()
        .min(5, 'Endereço deve ter pelo menos 5 caracteres')
        .max(200, 'Endereço deve ter no máximo 200 caracteres'),
    valorImovel: z.number()
        .positive('Valor do imóvel deve ser positivo')
        .max(999999999.99, 'Valor do imóvel muito alto'),
    tipoImovel: z.string()
        .max(50, 'Tipo de imóvel deve ter no máximo 50 caracteres')
        .optional(),
    tipoConstrucao: z.string()
        .max(50, 'Tipo de construção deve ter no máximo 50 caracteres')
        .optional(),
    cep: z.string()
        .regex(/^\d{5}-?\d{3}$/, 'CEP deve ter formato válido')
        .optional(),
    numero: z.string()
        .max(10, 'Número deve ter no máximo 10 caracteres')
        .optional(),
    complemento: z.string()
        .max(50, 'Complemento deve ter no máximo 50 caracteres')
        .optional(),
    bairro: z.string()
        .max(50, 'Bairro deve ter no máximo 50 caracteres')
        .optional(),
    cidade: z.string()
        .max(50, 'Cidade deve ter no máximo 50 caracteres')
        .optional(),
    estado: z.string()
        .max(2, 'Estado deve ter no máximo 2 caracteres')
        .optional(),
    coberturas: z.array(z.string())
        .optional()
});

// Validation functions
export const validateStep = (step: number, data: Partial<BasicPropostaFormData>): StepValidation => {
    const errors: ValidationError[] = [];
    let isValid = true;

    try {
        switch (step) {
            case 1:
                step1Schema.parse(data);
                break;
            case 2:
                step2Schema.parse(data);
                break;
            case 3:
                step3Schema.parse(data);
                break;
            default:
                throw new Error('Invalid step number');
        }
    } catch (error) {
        isValid = false;
        if (error instanceof z.ZodError) {
            errors.push(...error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                severity: 'error' as const
            })));
        }
    }

    return { step, isValid, errors };
};

export const validateBasicProposta = (data: Partial<BasicPropostaFormData>): StepValidation => {
    const errors: ValidationError[] = [];
    let isValid = true;

    try {
        basicPropostaSchema.parse(data);
    } catch (error) {
        isValid = false;
        if (error instanceof z.ZodError) {
            errors.push(...error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                severity: 'error' as const
            })));
        }
    }

    return { step: 0, isValid, errors };
};

export const validateSpecificDetails = (
    type: InsuranceType,
    details: any
): StepValidation => {
    const errors: ValidationError[] = [];
    let isValid = true;

    try {
        switch (type) {
            case 'automovel':
                automovelDetailsSchema.parse(details);
                break;
            case 'vida':
                vidaDetailsSchema.parse(details);
                break;
            case 'residencial':
                residencialDetailsSchema.parse(details);
                break;
            default:
                throw new Error('Invalid insurance type');
        }
    } catch (error) {
        isValid = false;
        if (error instanceof z.ZodError) {
            errors.push(...error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                severity: 'error' as const
            })));
        }
    }

    return { step: 0, isValid, errors };
};

// Helper function to get validation schema by type
export const getValidationSchemaForType = (type: InsuranceType) => {
    switch (type) {
        case 'automovel':
            return automovelDetailsSchema;
        case 'vida':
            return vidaDetailsSchema;
        case 'residencial':
            return residencialDetailsSchema;
        default:
            throw new Error(`Unknown insurance type: ${type}`);
    }
};

// Validation helpers for forms
export const validateField = (
    fieldName: string,
    value: any,
    schema: z.ZodSchema
): ValidationError | null => {
    try {
        schema.parse({ [fieldName]: value });
        return null;
    } catch (error) {
        if (error instanceof z.ZodError) {
            const fieldError = error.issues.find(err => err.path.includes(fieldName));
            if (fieldError) {
                return {
                    field: fieldName,
                    message: fieldError.message,
                    severity: 'error'
                };
            }
        }
        return null;
    }
};

// Real-time validation for forms
export const createFieldValidator = (schema: z.ZodSchema) => {
    return (fieldName: string, value: any): ValidationError | null => {
        return validateField(fieldName, value, schema);
    };
};