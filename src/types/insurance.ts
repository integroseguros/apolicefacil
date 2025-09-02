export interface ClientData {
  personType: 'fisica' | 'juridica';
  cpfCnpj: string;
  name: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  cepResidencia: string;
  email: string;
  phone: string;
}

export interface InsuranceType {
  startDate: string;
  endDate: string;
  isRenewal: boolean;
  endPreviousTerm: string;
  previousInsurer: string;
  previousPolicyNumber: string;
  InternalCode: string;
  numberOfClaims: string;
  newBonusClass: string;
}

export interface VehicleData {
  type: 'automovel' | 'moto' | 'caminhao';
  manufacturerCode: string;
  modelCode: string;
  plate?: string;
  chassis?: string;
  manufactureYear: string;
  modelYear: string;
  isZeroKm: boolean;
  fipeCode?: string;
  model: string;
  fipeValue?: number;
  fuelType?: string;
  cepPernoite: string;
  tracker?: string;
  antiTheftDevice?: string;
  isArmored?: boolean;
  kitGas?: boolean;
  kitGasValue?: string;
  isAlienated?: boolean;
}

export interface DriverData {
  mainDriverRelation?: string;
  mainDriverCpf?: string;
  mainDriverName?: string;
  mainDriverBirthDate?: string;
  mainDriverGender?: string;
  mainDriverMaritalStatus?: string;
  mainDriversLicenseTime?: string;
}

export interface RiskAssessment {
  homeGarage?: string;
  workGarage?: string
  schoolGarage?: string;
  vehicleUsageType?: string;
  youngDriver?: boolean;
  ageOfYoungest?: string;
  sexOfYoungest?: string;
  typeOfResidence?: string;
  monthlyKilometers?: string;
  isPcd?: boolean;
  taxExemption?: string;
}

export interface Coverage {
  coverageType: string;
  franchiseType: string;
  percentualFranchise?: string;
  percentualFipe?: string;
  materialDamages?: string;
  bodilyInjury: string;
  moralDamages: string;
  app?: string;
  armorValue?: string;
  assistancePlan: string;
  glassProtection?: string;
  rentalCar?: string;
  rentalCarType?: string;
  zeroKmReplacement?: string;
  extraExpenses?: string;
  bumperRepair?: string;
  wheelsAndTires?: string;
}

export interface InsurersSelection {
  selectedInsurers: string[];
  standardCommission: string;
  replicateTo: string;
  selectAll: boolean;
}

// Resultado de cotação da Suhai
export interface SuhaiQuote {
  protocol: string;
  valorFipe: string;
  fatorFipe: string;
  valorFipexFator: string;
  coverages: SuhaiCoverage[];
  parcelamento: Record<string, string>;
}

export interface SuhaiCoverage {
  id: string;
  nome: string;
  premioLiquido: string;
}

// Interface para configuração de uma seguradora
export interface InsurerConfig {
  id: string;
  name: string;
  logo: string;
  active: boolean;
  credentials: {
    username?: string;
    password?: string;
    token?: string;
    apiKey?: string;
    url?: string;
  };
  products: InsuranceProduct[];
}

// Interface para produto de seguro
export interface InsuranceProduct {
  id: string;
  code: string;
  name: string;
  active: boolean;
}

// Uma cotação de uma determinada seguradora
export interface InsurerQuote {
  insurerId: string;
  insurerName: string;
  logo: string;
  quoteNumber: string;
  premium: {
    net: number;
    iof: number;
    total: number;
  };
  coverages: {
    name: string;
    value: number;
    deductible?: number;
  }[];
  paymentOptions: {
    installments: number;
    value: number;
  }[];
  details?: any; // Campo para armazenar detalhes específicos de cada seguradora
}

// Tipos do fluxo de cotação
export type QuoteStep = 'client-data' | 'insurance-type' | 'vehicle-data' | 'risk-assessment' | 'coverage';

export interface QuoteState {
  clientData: ClientData | null;
  insuranceType: InsuranceType | null;
  vehicleData: VehicleData | null;
  riskAssessment: RiskAssessment | null;
  coverage: Coverage | null;
  currentStep: QuoteStep;
}