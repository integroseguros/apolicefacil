// Utility functions for working with proposal types

import type {
    BasicPropostaFormData,
    PropostaDetails,
    AutomovelDetails,
    VidaDetails,
    ResidencialDetails,
    InsuranceType
} from './wizard';
import { PropostaStatus } from './wizard';
import type { PropostaFormData, FullPropostaFormData } from './proposta';

// Convert legacy PropostaFormData to new BasicPropostaFormData
export const convertToBasicFormData = (
    legacyData: Partial<PropostaFormData>
): Partial<BasicPropostaFormData> => {
    return {
        type: legacyData.type,
        name: legacyData.name || '',
        customerId: legacyData.customerId || '',
        email: legacyData.email || '',
        insuranceCompanyId: legacyData.insuranceCompanyId || '',
        startDate: legacyData.startDate || '',
        endDate: legacyData.endDate || '',
        proposalNumber: legacyData.proposalNumber,
        renewal: legacyData.renewal || '',
        tipoRenewal: legacyData.tipoRenewal || '',
        situationDocument: legacyData.situationDocument || '0', // Default to draft
        previousPolicy: legacyData.previousPolicy,
        bonus: legacyData.bonus,
        identificationCode: legacyData.identificationCode
    };
};

// Convert BasicPropostaFormData to legacy PropostaFormData format
export const convertToLegacyFormData = (
    basicData: BasicPropostaFormData,
    specificDetails?: AutomovelDetails | VidaDetails | ResidencialDetails
): Partial<PropostaFormData> => {
    const baseData: any = {
        type: basicData.type,
        name: basicData.name,
        customerId: basicData.customerId,
        email: basicData.email,
        insuranceCompanyId: basicData.insuranceCompanyId,
        startDate: basicData.startDate,
        endDate: basicData.endDate,
        proposalNumber: basicData.proposalNumber,
        renewal: basicData.renewal,
        tipoRenewal: basicData.tipoRenewal,
        situationDocument: basicData.situationDocument,
        previousPolicy: basicData.previousPolicy,
        bonus: basicData.bonus,
        identificationCode: basicData.identificationCode
    };

    // Add specific details based on type
    if (specificDetails) {
        switch (basicData.type) {
            case 'automovel':
                const autoDetails = specificDetails as AutomovelDetails;
                return {
                    ...baseData,
                    model: autoDetails.model,
                    manufacturerYear: autoDetails.manufacturerYear,
                    manufacturerYearModel: autoDetails.manufacturerYearModel,
                    plate: autoDetails.plate
                } as Partial<PropostaFormData>;
            case 'vida':
                const vidaDetails = specificDetails as VidaDetails;
                return {
                    ...baseData,
                    nomeBeneficiario: vidaDetails.nomeBeneficiario,
                    valorCobertura: vidaDetails.valorCobertura
                } as Partial<PropostaFormData>;
            case 'residencial':
                const residencialDetails = specificDetails as ResidencialDetails;
                return {
                    ...baseData,
                    endereco: residencialDetails.endereco,
                    valorImovel: residencialDetails.valorImovel
                } as Partial<PropostaFormData>;
        }
    }

    return baseData as Partial<PropostaFormData>;
};

// Extract specific details from legacy form data
export const extractSpecificDetails = (
    type: InsuranceType,
    legacyData: Partial<PropostaFormData>
): AutomovelDetails | VidaDetails | ResidencialDetails | undefined => {
    switch (type) {
        case 'automovel':
            if (legacyData.model && legacyData.manufacturerYear &&
                legacyData.manufacturerYearModel && legacyData.plate) {
                return {
                    model: legacyData.model,
                    manufacturerYear: legacyData.manufacturerYear,
                    manufacturerYearModel: legacyData.manufacturerYearModel,
                    plate: legacyData.plate
                } as AutomovelDetails;
            }
            break;
        case 'vida':
            if (legacyData.nomeBeneficiario && legacyData.valorCobertura) {
                return {
                    nomeBeneficiario: legacyData.nomeBeneficiario,
                    valorCobertura: legacyData.valorCobertura
                } as VidaDetails;
            }
            break;
        case 'residencial':
            if (legacyData.endereco && legacyData.valorImovel) {
                return {
                    endereco: legacyData.endereco,
                    valorImovel: legacyData.valorImovel
                } as ResidencialDetails;
            }
            break;
    }
    return undefined;
};

// Create a PropostaDetails object from basic and specific data
export const createPropostaDetails = (
    id: string,
    basicData: BasicPropostaFormData,
    specificData?: AutomovelDetails | VidaDetails | ResidencialDetails,
    status: PropostaStatus = PropostaStatus.DRAFT
): PropostaDetails => {
    return {
        id,
        basicData,
        specificData,
        status,
        detailsStatus: specificData ? 'complete' : 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

// Check if proposal has all required details for its type
export const hasCompleteDetails = (proposta: PropostaDetails): boolean => {
    if (!proposta.specificData) return false;

    switch (proposta.basicData.type) {
        case 'automovel':
            const autoDetails = proposta.specificData as AutomovelDetails;
            return !!(autoDetails.model && autoDetails.manufacturerYear &&
                autoDetails.manufacturerYearModel && autoDetails.plate);
        case 'vida':
            const vidaDetails = proposta.specificData as VidaDetails;
            return !!(vidaDetails.nomeBeneficiario && vidaDetails.valorCobertura);
        case 'residencial':
            const residencialDetails = proposta.specificData as ResidencialDetails;
            return !!(residencialDetails.endereco && residencialDetails.valorImovel);
        default:
            return false;
    }
};

// Get missing required fields for a proposal
export const getMissingRequiredFields = (proposta: PropostaDetails): string[] => {
    const missing: string[] = [];

    if (!proposta.specificData) {
        switch (proposta.basicData.type) {
            case 'automovel':
                return ['model', 'manufacturerYear', 'manufacturerYearModel', 'plate'];
            case 'vida':
                return ['nomeBeneficiario', 'valorCobertura'];
            case 'residencial':
                return ['endereco', 'valorImovel'];
        }
    }

    switch (proposta.basicData.type) {
        case 'automovel':
            const autoDetails = proposta.specificData as AutomovelDetails;
            if (!autoDetails.model) missing.push('model');
            if (!autoDetails.manufacturerYear) missing.push('manufacturerYear');
            if (!autoDetails.manufacturerYearModel) missing.push('manufacturerYearModel');
            if (!autoDetails.plate) missing.push('plate');
            break;
        case 'vida':
            const vidaDetails = proposta.specificData as VidaDetails;
            if (!vidaDetails.nomeBeneficiario) missing.push('nomeBeneficiario');
            if (!vidaDetails.valorCobertura) missing.push('valorCobertura');
            break;
        case 'residencial':
            const residencialDetails = proposta.specificData as ResidencialDetails;
            if (!residencialDetails.endereco) missing.push('endereco');
            if (!residencialDetails.valorImovel) missing.push('valorImovel');
            break;
    }

    return missing;
};

// Calculate completion percentage for a proposal
export const calculateCompletionPercentage = (proposta: PropostaDetails): number => {
    const basicDataFields = [
        'type', 'name', 'customerId', 'email', 'insuranceCompanyId',
        'startDate', 'endDate', 'renewal', 'tipoRenewal', 'situationDocument'
    ];

    let completedBasicFields = 0;
    basicDataFields.forEach(field => {
        if (proposta.basicData[field as keyof BasicPropostaFormData]) {
            completedBasicFields++;
        }
    });

    const basicPercentage = (completedBasicFields / basicDataFields.length) * 60; // 60% for basic data

    if (!proposta.specificData) {
        return basicPercentage;
    }

    const hasComplete = hasCompleteDetails(proposta);
    const specificPercentage = hasComplete ? 40 : 0; // 40% for specific details

    return Math.round(basicPercentage + specificPercentage);
};

// Generate default end date (1 year from start date)
export const generateEndDate = (startDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setFullYear(start.getFullYear() + 1);
    return end.toISOString().split('T')[0];
};

// Validate date range
export const isValidDateRange = (startDate: string, endDate: string): boolean => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start < end;
};

// Format proposal number with prefix
export const formatProposalNumber = (number: string, type: InsuranceType): string => {
    const prefixes = {
        automovel: 'AUTO',
        vida: 'VIDA',
        residencial: 'RES'
    };

    return `${prefixes[type]}-${number}`;
};

// Parse proposal number to extract type and number
export const parseProposalNumber = (proposalNumber: string): { type: InsuranceType | null, number: string } => {
    const match = proposalNumber.match(/^(AUTO|VIDA|RES)-(.+)$/);
    if (!match) return { type: null, number: proposalNumber };

    const typeMap = {
        'AUTO': 'automovel' as const,
        'VIDA': 'vida' as const,
        'RES': 'residencial' as const
    };

    return {
        type: typeMap[match[1] as keyof typeof typeMap] || null,
        number: match[2]
    };
};