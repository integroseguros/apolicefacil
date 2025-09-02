'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  ClientData,
  InsuranceType,
  VehicleData,
  RiskAssessment,
  Coverage,
  SuhaiQuote,
  InsurerQuote,
  DriverData,
  InsurersSelection
} from '@/types/insurance';

// Estado da cotação
interface QuoteState {
  clientData: ClientData | null;
  driverData: DriverData | null;
  insuranceType: InsuranceType | null;
  vehicleData: VehicleData | null;
  riskAssessment: RiskAssessment | null;
  coverage: Coverage | null;
  insurersSelection: InsurersSelection | null;
  suhaiQuote: SuhaiQuote | null;
  quotes: InsurerQuote[];
}

// Tipos de ações
type QuoteAction =
  | { type: 'UPDATE_CLIENT_DATA'; payload: ClientData }
  | { type: 'UPDATE_DRIVER_DATA'; payload: DriverData }
  | { type: 'UPDATE_INSURANCE_TYPE'; payload: InsuranceType }
  | { type: 'UPDATE_VEHICLE_DATA'; payload: VehicleData }
  | { type: 'UPDATE_RISK_ASSESSMENT'; payload: RiskAssessment }
  | { type: 'UPDATE_COVERAGE'; payload: Coverage }
  | { type: 'UPDATE_INSURER_DATA'; payload: InsurersSelection }
  | { type: 'SET_SUHAI_QUOTE'; payload: SuhaiQuote }
  | { type: 'ADD_INSURER_QUOTE'; payload: InsurerQuote }
  | { type: 'CLEAR_QUOTES' }
  | { type: 'RESET_QUOTE' };

// Estado inicial
const initialState: QuoteState = {
  clientData: null,
  driverData: null,
  insuranceType: null,
  vehicleData: null,
  riskAssessment: null,
  coverage: null,
  insurersSelection: null,
  suhaiQuote: null,
  quotes: []
};

// Reducer
function quoteReducer(state: QuoteState, action: QuoteAction): QuoteState {
  switch (action.type) {
    case 'UPDATE_CLIENT_DATA':
      return { ...state, clientData: action.payload };
    case 'UPDATE_INSURANCE_TYPE':
      return { ...state, insuranceType: action.payload };
    case 'UPDATE_VEHICLE_DATA':
      return { ...state, vehicleData: action.payload };
    case 'UPDATE_RISK_ASSESSMENT':
      return { ...state, riskAssessment: action.payload };
    case 'UPDATE_COVERAGE':
      return { ...state, coverage: action.payload };
    case 'SET_SUHAI_QUOTE':
      return { ...state, suhaiQuote: action.payload };
    case 'ADD_INSURER_QUOTE':
      // Verificar se já existe uma cotação desta seguradora
      const existingIndex = state.quotes.findIndex(q => q.insurerId === action.payload.insurerId);

      if (existingIndex >= 0) {
        // Substituir cotação existente
        const updatedQuotes = [...state.quotes];
        updatedQuotes[existingIndex] = action.payload;
        return { ...state, quotes: updatedQuotes };
      } else {
        // Adicionar nova cotação
        return { ...state, quotes: [...state.quotes, action.payload] };
      }
    case 'CLEAR_QUOTES':
      return { ...state, quotes: [] };
    case 'RESET_QUOTE':
      return initialState;
    default:
      return state;
  }
}

// Contexto
interface QuoteContextType {
  state: QuoteState;
  dispatch: React.Dispatch<QuoteAction>;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

// Provider
export function QuoteProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quoteReducer, initialState);

  return (
    <QuoteContext.Provider value={{ state, dispatch }}>
      {children}
    </QuoteContext.Provider>
  );
}

// Hook para usar o contexto
export function useQuote() {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
}