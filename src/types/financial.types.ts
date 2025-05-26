import type { HeatPumpCost } from './heat-pump.types';

export const VAT_RATE = 0.05; // 5% VAT

export interface Quote {
    submissionId: string;
    designRegion: string;
    heatLoss: number;
    powerHeatLoss: number;
    recommendedHeatPump: {
        label: string;
        outputCapacity: number;
        costs: HeatPumpCost[];
    };
    subtotal: number;
    vat: number;
    totalCost: number;
}

// Type for VAT calculations
export type VATRate = typeof VAT_RATE;

// Helper type for financial calculations
export interface FinancialBreakdown {
    subtotal: number;
    vat: number;
    totalCost: number;
} 