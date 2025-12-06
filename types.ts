export enum LoanType {
  MORTGAGE = 'MORTGAGE',
  PERSONAL = 'PERSONAL',
  BUSINESS = 'BUSINESS',
  AUTO = 'AUTO'
}

export interface LoanProduct {
  id: string;
  name: string;
  type: LoanType;
  baseRate: number; // Percentage
  minTerm: number; // Years
  maxTerm: number; // Years
  maxAmount: number; // Yuan
  description: string;
  features: string[];
}

export interface CalculationResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: AmortizationMonth[];
}

export interface AmortizationMonth {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface CustomerProfile {
  age: number;
  occupation: string;
  annualIncome: number;
  loanAmount: number;
  loanPurpose: string;
  housingStatus: string;
  overdueHistory: string; // Manual note about known history
}

export type ViewState = 'dashboard' | 'calculator' | 'compare' | 'ai-assistant' | 'qualification';