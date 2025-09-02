

export interface Customer {
    id: string;
    name: string;
    status: string;
    socialName: string;
    birthDate: string;
    gender: string;
    personType: string;
    cnpjCpf: string;
    email: string;
    phone: string;
    website: string;
    clientSince: string;
    revenue: string;
    business: string;
    avatarUrl: string;
    telefone: Telefone[];
    policies: Policy[];
    opportunities: Opportunity[];
}

export interface Telefone {
    id: string;
    clienteId: string;
    tipo: string;
    numero: string;
    ramal?: string | null;
    contato?: string | null;
}

export interface Policy {
    id: string;
    document: string;
    startDate: string | null;
    endDate: string | null;
    proposalNumber: string;
    proposalDate?: string | null; // Adicionado para compatibilidade
    policyNumber: string | null;
    issueDate: string | null;
    situationDocument: string;
    renewal: string;
    tipoRenewal?: string;
    previousPolicy?: string;
    previousInsuranceCompany?: string; // Adicionado
    bonus?: string;
    identificationCode?: string;
    nrVidas?: string;
    source?: string;
    liquidPrize?: number | null;
    totalPrize?: number | null;
    iof?: number | null;
    commissionValue?: number | null;
    formaPagamento?: string;
    paymentMethod?: string; // Adicionado para compatibilidade
    banco?: string;
    agencia?: string;
    contaCorrente?: string;
    numeroParcelas?: number;
    valorParcela?: number;
    percentualComissao?: number;
    apoliceColetiva?: boolean;
    product?: string | {
        id: string;
        name: string;
        code: string;
    };
    branch?: {
        id: string;
        name: string;
        code: string;
    };
    insuranceCompany?: {
        id: string;
        name: string;
        susep?: string;
        phone?: string;
        urlLogo?: string;
    };
    customer?: {
        id: string;
        name: string;
        email?: string;
        avatarUrl?: string;
    };
    user?: {
        id: string;
        name: string;
        email?: string;
    };
    producer?: {
        id: string;
        name: string;
        email?: string;
    };
    premium?: number;
    status?: string;
    type?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type OpportunityStage = 'Nova' | 'Contactada' | 'Proposta Enviada' | 'Ganha' | 'Perdida';

export interface Product {
    id: string;
    showBudget: boolean;
    additionalCommission: boolean;
    iof?: number;
    subscriptionInsurance?: boolean;
    code?: string;
    name?: string;
    status: string;
    branchId: string;
    insuranceCompanyId: string;
    branch?: {
        id: string;
        name: string;
        code: string;
    };
    insuranceCompany?: {
        id: string;
        name: string;
        urlLogo?: string;
    };
}

export interface ItemAutomovel {
    id: string;
    itemCia: string;
    owner?: string;
    itemStatus?: string;
    manufacturer: string;
    model: string;
    fipe?: string;
    zeroKm?: string;
    manufacturerYear?: number;
    manufacturerYearModel?: number;
    plate?: string;
    chassi?: string;
    fuel?: string;
    coverage?: string;
    observation?: string;
    condutores?: Condutor[];
}

export interface Condutor {
    id: string;
    nome: string;
    cpf: string;
    dataNascimento?: string;
    parentesco?: string;
    genero?: string;
    estadoCivil?: string;
    profissao?: string;
    itemAutomovelId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PaginatedResponse<T> {
    products?: T[];
    data?: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface InsuranceCompany {
    id: string;
    name: string;
    status: string;
    susep?: string;
    phone?: string;
    urlLogo?: string;
    obsersvations?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Branch {
    id: string;
    code: string;
    name: string;
    status: string;
}

export interface Opportunity {
    id: string;
    title: string;
    stage: OpportunityStage;
    value: number;
    customer: {
        id: string;
        name: string;
        avatarUrl: string;
    };
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Gerente' | 'Atendente' | 'Produtor';
    avatarUrl: string;
}

export interface Role {
    id: string;
    name: string;
    users: User[];
}

export type DocumentCategory =
    | 'IDENTIFICATION'    // RG, CPF, CNH, etc.
    | 'CONTRACT'         // Contratos
    | 'POLICY'           // Apólices
    | 'PROPOSAL'         // Propostas
    | 'PHOTO'            // Fotos
    | 'FINANCIAL'        // Documentos financeiros
    | 'LEGAL'            // Documentos legais
    | 'OTHER';           // Outros

export interface Document {
    id: string;
    customerId: string;
    name: string;
    originalName: string;
    category: DocumentCategory;
    mimeType: string;
    size: number;
    filePath: string;
    description?: string;
    version: number;
    parentId?: string;
    uploadedBy?: string;
    user?: User;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    versions?: Document[];
}

export interface DocumentUploadResponse {
    success: boolean;
    document?: Document;
    error?: string;
}

export type ClaimStatus =
    | 'REPORTED'     // Reportado
    | 'UNDER_REVIEW' // Em Análise
    | 'INVESTIGATING' // Investigando
    | 'APPROVED'     // Aprovado
    | 'REJECTED'     // Rejeitado
    | 'SETTLED'      // Liquidado
    | 'CLOSED';      // Fechado

export type ClaimPriority =
    | 'LOW'    // Baixa
    | 'MEDIUM' // Média
    | 'HIGH'   // Alta
    | 'URGENT'; // Urgente

export type ClaimCommunicationType =
    | 'EMAIL'
    | 'PHONE'
    | 'SMS'
    | 'WHATSAPP'
    | 'INTERNAL_NOTE';

export type CommunicationDirection =
    | 'INBOUND'
    | 'OUTBOUND';

export interface Claim {
    id: string;
    claimNumber: string;
    customerId: string;
    policyId?: string;
    title: string;
    description: string;
    incidentDate: string;
    reportedDate: string;
    status: ClaimStatus;
    priority: ClaimPriority;
    claimType: string;
    estimatedValue?: number;
    approvedValue?: number;
    deductible?: number;
    location?: string;
    witnesses?: string;
    policeReport?: string;
    assignedTo?: string;
    createdBy?: string;
    closedAt?: string;
    closedReason?: string;
    createdAt: string;
    updatedAt: string;
    customer?: Customer;
    policy?: Policy;
    assignedUser?: User;
    createdUser?: User;
    documents?: ClaimDocument[];
    timeline?: ClaimTimeline[];
    communications?: ClaimCommunication[];
}

export interface ClaimDocument {
    id: string;
    claimId: string;
    name: string;
    originalName: string;
    mimeType: string;
    size: number;
    filePath: string;
    description?: string;
    uploadedBy?: string;
    user?: User;
    createdAt: string;
}

export interface ClaimTimeline {
    id: string;
    claimId: string;
    action: string;
    description: string;
    userId?: string;
    user?: User;
    timestamp: string;
}

export interface ClaimCommunication {
    id: string;
    claimId: string;
    type: ClaimCommunicationType;
    direction: CommunicationDirection;
    subject?: string;
    content: string;
    fromEmail?: string;
    toEmail?: string;
    fromPhone?: string;
    toPhone?: string;
    userId?: string;
    user?: User;
    timestamp: string;
}

export interface ClienteImportacao {
    nome: string;
    nomeSocial?: string;
    tipoPessoa: string;
    cnpjCpf?: string;
    email?: string;
    telefone?: string;
    cep?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    status: string;
    isValid: boolean;
    errors: string[];
}

export interface ClienteExcel {
    nome: string;
    tipoPessoa: string;
    cnpjCpf?: string;
    email?: string;
    telefoneResidencial?: string;
    telefoneComercial?: string;
    telefoneCelular?: string;
    cep?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
}

export interface ClienteProcessado extends ClienteExcel {
    status: string;
    isValid: boolean;
    errors: string[];
}

export interface ClienteImportacaoRequest {
    nome: string;
    tipoPessoa: string;
    cnpjCpf?: string;
    email?: string;
    telefoneResidencial?: string;
    telefoneComercial?: string;
    telefoneCelular?: string;
    cep?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
}

// Export wizard types
export * from './wizard';
export * from './validation';
export * from './utils';