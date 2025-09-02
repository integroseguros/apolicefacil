// Re-export types from wizard.ts for backward compatibility
export type { InsuranceType, PropostaStatus } from './wizard';
export { getStatusDisplayName } from './wizard';

export interface InsuranceProduct {
    id: string;        // O CUID do banco de dados
    name: string;      // Nome do produto (ex: "Automóvel")
    type: InsuranceType; // Tipo do produto (ex: "automovel")
    description?: string; // Descrição opcional
}

// Mapeamento de tipos para facilitar a busca
export const INSURANCE_TYPES: Record<InsuranceType, string> = {
    automovel: "automovel",
    vida: "vida",
    residencial: "residencial"
};

// Helper para obter o nome amigável do tipo
export const getInsuranceTypeName = (type: InsuranceType): string => {
    const names: Record<InsuranceType, string> = {
        automovel: "Automóvel",
        vida: "Vida",
        residencial: "Residencial"
    };
    return names[type] || type;
};

// Import InsuranceType for use in this file
import type { InsuranceType, PropostaStatus } from './wizard';

interface BaseProposta {
    id: string;
    type: InsuranceType;
    name: string;
    customerId: string;
    email: string;
    status: PropostaStatus;
}

export interface PropostaAutomovel extends BaseProposta {
    type: "automovel";
    model: string;
    manufacturerYear: number;
    manufacturerYearModel: number;
    plate: string;
}

export interface PropostaVida extends BaseProposta {
    type: "vida";
    nomeBeneficiario: string;
    valorCobertura: number;
}

export interface PropostaResidencial extends BaseProposta {
    type: "residencial";
    endereco: string;
    valorImovel: number;
}

export type AnyProposta =
    | PropostaAutomovel
    | PropostaVida
    | PropostaResidencial;

type PropostaFormBase = {
    name: string;
    startDate: string; // Data de início do seguro
    endDate: string;   // Data de término do seguro
    proposalNumber?: string; // Número da proposta
    previousPolicy?: string; // Apólice anterior, se aplicável
    customerId: string;
    email: string;
    insuranceCompanyId?: string; // ID da seguradora
    insuranceCompanyName?: string; // Nome da seguradora
    productId?: string;      // ID do tipo de seguro (1, 2, 3, etc.)
    productName?: string;    // Nome do tipo de seguro (Automóvel, Vida, etc.)
    branchId?: string;       // ID do ramo (1, 2, 3, etc.)
    branchName?: string;     // Nome do ramo (Automóvel, Vida, etc.)
    // Campos opcionais para todas as propostas
    policyNumber?: string;
    issueDate?: string;
    bonus: string;
    identificationCode?: string;
    renewal: string;
    tipoRenewal: string;
    situationDocument: string;
};

// Tipo base para o formulário de revisão
export type ReviewFormData = {
    policyNumber?: string;
    issueDate?: string;
    document?: string;
};

export type PropostaFormData = PropostaFormBase & (
    | {
        type: 'automovel';
        model: string;
        manufacturerYear: number;
        manufacturerYearModel: number;
        plate: string;
        // Campos específicos opcionais para o StepReview
        nomeBeneficiario?: never;
        valorCobertura?: never;
        endereco?: never;
        valorImovel?: never;
    }
    | {
        type: 'vida';
        nomeBeneficiario: string;
        valorCobertura: number;
        // Campos específicos opcionais para o StepReview
        model?: never;
        manufacturerYear?: never;
        manufacturerYearModel?: never;
        plate?: never;
        endereco?: never;
        valorImovel?: never;
    }
    | {
        type: 'residencial';
        endereco: string;
        valorImovel: number;
        // Campos específicos opcionais para o StepReview
        model?: never;
        manufacturerYear?: never;
        manufacturerYearModel?: never;
        plate?: never;
        nomeBeneficiario?: never;
        valorCobertura?: never;
    }
);

// Tipo para o formulário de revisão que inclui todos os campos possíveis
export type FullPropostaFormData = PropostaFormData & ReviewFormData;

// Re-export new simplified types for backward compatibility
export type {
    BasicPropostaFormData,
    AutomovelDetails,
    VidaDetails,
    ResidencialDetails,
    PropostaDetails,
    StepValidation,
    ValidationError,
    WizardFormState,
    DetailsFormState
} from './wizard';