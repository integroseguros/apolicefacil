// Simplified TypeScript types for the proposal wizard

export type InsuranceType = "automovel" | "vida" | "residencial";

// Enum for proposal status in the simplified flow
export enum PropostaStatus {
    DRAFT = "draft",                    // Created by wizard, basic data only
    PENDING_DETAILS = "pending_details", // Awaiting specific details
    DETAILS_COMPLETE = "details_complete", // Specific details filled
    PENDING_VALUES = "pending_values",   // Awaiting proposal values
    COMPLETE = "complete",              // All data filled
    SUBMITTED = "submitted",            // Sent for analysis
    APPROVED = "approved",              // Approved
    REJECTED = "rejected"               // Rejected
}

// Basic form data for the simplified wizard (only essential fields)
export interface BasicPropostaFormData {
    // Essential data
    type: InsuranceType;
    name: string;
    customerId: string;
    email: string;

    // Proposal data
    insuranceCompanyId: string;
    startDate: string;
    endDate: string;
    proposalNumber?: string;
    renewal: string;
    tipoRenewal: string;
    situationDocument: string;

    // Optional fields
    previousPolicy?: string;
    bonus?: string;
    identificationCode?: string;
}

// Specific details interfaces for each insurance type
export interface AutomovelDetails {
    manufacturer?: string;
    model: string;
    manufacturerYear: number;
    manufacturerYearModel: number;
    plate: string;
    chassi?: string;
    fuel?: string;
    zeroKm?: string;
    fipe?: string;
    bonus?: number;
    identificationCode?: string;
}

export interface VidaDetails {
    nomeBeneficiario: string;
    valorCobertura: number;
    tipoCobertura?: string;
    beneficiarios?: Beneficiario[];
    premioCalculado?: number;
}

export interface Beneficiario {
    id?: string;
    nome: string;
    cpf: string;
    parentesco: string;
    percentual: number;
}

export interface ResidencialDetails {
    endereco: string;
    valorImovel: number;
    tipoImovel?: string;
    tipoConstrucao?: string;
    cep?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    coberturas?: string[];
}

// Nova interface para valores da proposta
export interface PropostaValores {
    premioLiquido: number;
    iof: number;
    premioTotal: number; // premioLiquido + iof
    percentualComissao: number;
    valorComissao: number;
    formaPagamento: 'vista' | 'parcelado';
    numeroParcelas?: number;
    valorParcela?: number;
    observacoes?: string;
}

// Interface para dados de emissão da apólice
export interface EmissaoApolice {
    dataEmissao: string;
    numeroApolice: string;
    observacoes?: string;
}

// Proposal values interface
export interface PropostaValues {
    premioLiquido: number;
    iof: number;
    premioTotal: number;
    percentualComissao: number;
    valorComissao: number;
    formaPagamento: string;
    numeroParcelas: number;
    valorParcela?: number;
    dataVencimento?: string;
    observacoes?: string;
}

// Policy issuance data
export interface PolicyIssuanceData {
    policyNumber: string;
    issueDate: string;
    issuedBy?: string;
    notes?: string;
}

// Combined proposal details type
export interface PropostaDetails {
    id: string;
    basicData: BasicPropostaFormData;
    specificData?: AutomovelDetails | VidaDetails | ResidencialDetails;
    valoresData?: PropostaValores;
    emissaoData?: EmissaoApolice;
    status: PropostaStatus;
    detailsStatus?: "pending" | "complete";
    valoresStatus?: "pending" | "complete";
    createdAt?: string;
    updatedAt?: string;
}

// Types for step-by-step validation
export interface StepValidation {
    step: number;
    isValid: boolean;
    errors: ValidationError[];
}

export interface ValidationError {
    field: string;
    message: string;
    severity: "error" | "warning";
}

// Validation schemas for each step
export interface StepValidationSchema {
    step1: (data: Partial<BasicPropostaFormData>) => StepValidation; // Insurance type
    step2: (data: Partial<BasicPropostaFormData>) => StepValidation; // Customer data
    step3: (data: Partial<BasicPropostaFormData>) => StepValidation; // Basic proposal data
}

// Types for the details page sections
export interface DetailsSectionProps<T = any> {
    proposta: PropostaDetails;
    onSave: (details: T) => Promise<void>;
    isLoading?: boolean;
    errors?: ValidationError[];
}

// Auto-save configuration
export interface AutoSaveConfig {
    enabled: boolean;
    debounceMs: number;
    retryAttempts: number;
    retryDelayMs: number;
}

// Progress tracking
export interface ProgressInfo {
    totalSections: number;
    completedSectionsCount: number;
    pendingSections: string[];
    completedSections: string[];
    overallProgress: number; // 0-100
}

// API response types
export interface CreatePropostaResponse {
    success: boolean;
    proposta?: PropostaDetails;
    error?: string;
}

export interface UpdateDetailsResponse {
    success: boolean;
    proposta?: PropostaDetails;
    error?: string;
}

// Form state management
export interface WizardFormState {
    currentStep: number;
    formData: Partial<BasicPropostaFormData>;
    isValid: boolean;
    errors: ValidationError[];
    isSubmitting: boolean;
}

export interface DetailsFormState {
    sectionData: Partial<AutomovelDetails | VidaDetails | ResidencialDetails>;
    isValid: boolean;
    errors: ValidationError[];
    isSaving: boolean;
    lastSaved?: Date;
}

// Helper types for type guards
export type SpecificDetailsType<T extends InsuranceType> =
    T extends "automovel" ? AutomovelDetails :
    T extends "vida" ? VidaDetails :
    T extends "residencial" ? ResidencialDetails :
    never;

// Type guards
export const isAutomovelDetails = (details: any): details is AutomovelDetails => {
    return details && typeof details.model === 'string';
};

export const isVidaDetails = (details: any): details is VidaDetails => {
    return details && typeof details.nomeBeneficiario === 'string';
};

export const isResidencialDetails = (details: any): details is ResidencialDetails => {
    return details && typeof details.endereco === 'string';
};

// Utility functions
export const getDetailsTypeForInsurance = (type: InsuranceType): string => {
    const typeMap = {
        automovel: "AutomovelDetails",
        vida: "VidaDetails",
        residencial: "ResidencialDetails"
    };
    return typeMap[type];
};

export const getRequiredFieldsForType = (type: InsuranceType): string[] => {
    const requiredFields = {
        automovel: ["manufacturer", "model", "manufacturerYear", "manufacturerYearModel", "plate"],
        vida: ["nomeBeneficiario", "valorCobertura"],
        residencial: ["endereco", "valorImovel"]
    };
    return requiredFields[type];
};

// Status transition helpers
export const canTransitionTo = (currentStatus: PropostaStatus, newStatus: PropostaStatus): boolean => {
    const validTransitions: Record<PropostaStatus, PropostaStatus[]> = {
        [PropostaStatus.DRAFT]: [PropostaStatus.PENDING_DETAILS],
        [PropostaStatus.PENDING_DETAILS]: [PropostaStatus.DETAILS_COMPLETE, PropostaStatus.DRAFT],
        [PropostaStatus.DETAILS_COMPLETE]: [PropostaStatus.PENDING_VALUES, PropostaStatus.PENDING_DETAILS],
        [PropostaStatus.PENDING_VALUES]: [PropostaStatus.COMPLETE, PropostaStatus.DETAILS_COMPLETE],
        [PropostaStatus.COMPLETE]: [PropostaStatus.SUBMITTED, PropostaStatus.PENDING_VALUES],
        [PropostaStatus.SUBMITTED]: [PropostaStatus.APPROVED, PropostaStatus.REJECTED],
        [PropostaStatus.APPROVED]: [],
        [PropostaStatus.REJECTED]: [PropostaStatus.DRAFT]
    };

    return validTransitions[currentStatus].includes(newStatus);
};

export const getStatusDisplayName = (status: PropostaStatus): string => {
    const displayNames = {
        [PropostaStatus.DRAFT]: "Rascunho",
        [PropostaStatus.PENDING_DETAILS]: "Pendente Detalhes",
        [PropostaStatus.DETAILS_COMPLETE]: "Detalhes Completos",
        [PropostaStatus.PENDING_VALUES]: "Pendente Valores",
        [PropostaStatus.COMPLETE]: "Completa",
        [PropostaStatus.SUBMITTED]: "Enviada",
        [PropostaStatus.APPROVED]: "Aprovada",
        [PropostaStatus.REJECTED]: "Rejeitada"
    };
    return displayNames[status];
};