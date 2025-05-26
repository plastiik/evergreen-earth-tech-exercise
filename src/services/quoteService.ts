import type { House } from '../types/house.types';
import type { HeatPump, HeatPumpCost } from '../types/heat-pump.types';
import type { WeatherData } from '../types/weather.types';
import type { Quote, FinancialBreakdown } from '../types/financial.types';
import { VAT_RATE } from '../types/financial.types';
import HousesService from './housesService';
import HeatPumpService from './heatPumpService';
import WeatherDataService from './weatherDataService';

namespace QuoteService {
    export async function calculateQuoteForHouse(house: House): Promise<string | null> {
        const heatLoss = HousesService.calculateHeatLoss(house);
        
        try {
            const weatherData = await WeatherDataService.getWeatherData(house.designRegion);
            const powerHeatLoss = HousesService.calculatePowerHeatLoss(house, weatherData);
            const recommendedHeatPump = findSuitableHeatPump(powerHeatLoss);
            
            if (!recommendedHeatPump) {
                console.warn(`No suitable heat pump found for house ${house.submissionId} with power heat loss ${powerHeatLoss}kW`);
                return null;
            }
            
            const subtotal = calculateTotalCost(recommendedHeatPump.costs);
            const { vat, totalCost } = calculateFinancialBreakdown(subtotal);

            const quote: Quote = {
                submissionId: house.submissionId,
                designRegion: house.designRegion,
                heatLoss,
                powerHeatLoss,
                recommendedHeatPump: {
                    label: recommendedHeatPump.label,
                    outputCapacity: recommendedHeatPump.outputCapacity,
                    costs: recommendedHeatPump.costs
                },
                subtotal,
                vat,
                totalCost
            };

            return formatQuote(quote);
        } catch (error: any) {
            return formatDesignRegionNotFound(house.submissionId, heatLoss);
        }
    }

    function calculateFinancialBreakdown(subtotal: number): FinancialBreakdown {
        const vat = subtotal * VAT_RATE;
        return {
            subtotal,
            vat,
            totalCost: subtotal + vat
        };
    }

    function findSuitableHeatPump(powerHeatLoss: number): HeatPump | undefined {
        const heatPumps = HeatPumpService.getAllHeatPumps();
        // Sort heat pumps by output capacity to find the smallest suitable one
        const sortedHeatPumps = [...heatPumps].sort((a, b) => a.outputCapacity - b.outputCapacity);
        // Finds the first heat pump that can handle the power requirement
        // The heat pump should not be undersized, so its capacity must be >= power heat loss
        return sortedHeatPumps.find(pump => pump.outputCapacity >= powerHeatLoss);
    }

    function calculateTotalCost(costs: HeatPumpCost[]): number {
        return costs.reduce((total, item) => total + item.cost, 0);
    }

    function formatQuote(quote: Quote): string {
        const lines: string[] = [
            '--------------------------------------',
            quote.submissionId,
            '--------------------------------------',
            `  Estimated Heat Loss = ${quote.heatLoss.toFixed(2)} kWh`,
            `  Design Region = ${quote.designRegion}`,
            `  Power Heat Loss = ${quote.powerHeatLoss.toFixed(2)} kW`,
            `  Recommended Heat Pump = ${quote.recommendedHeatPump.label} (${quote.recommendedHeatPump.outputCapacity}kW)`,
            '  Cost Breakdown'
        ];

        quote.recommendedHeatPump.costs.forEach(cost => {
            lines.push(`    ${cost.label}, £${cost.cost.toFixed(2)}`);
        });

        lines.push(`  Total Cost, including VAT = £${quote.totalCost.toFixed(2)}`);

        return lines.join('\n');
    }

    function formatDesignRegionNotFound(submissionId: string, heatLoss: number): string {
        return [
            '--------------------------------------',
            submissionId,
            '--------------------------------------',
            `  Heating Loss: ${heatLoss.toFixed(1)}`,
            '  Warning: Could not find design region'
        ].join('\n');
    }
}

export default QuoteService;
