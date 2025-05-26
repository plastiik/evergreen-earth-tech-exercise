import type { House } from '../types/house.types';
import type { WeatherData } from '../types/weather.types';
import type { HeatPump } from '../types/heat-pump.types';
import QuoteService from './quoteService';
import WeatherDataService from './weatherDataService';
import HousesService from './housesService';
import HeatPumpService from './heatPumpService';

jest.mock('./weatherDataService');
jest.mock('./housesService');
jest.mock('./heatPumpService');

describe('QuoteService', () => {
    const mockHouse: House = {
        submissionId: 'test-id',
        designRegion: 'Test Region',
        floorArea: 100,
        age: '1967 - 1975',
        heatingFactor: 2,
        insulationFactor: 1.5
    };

    const mockWeatherData: WeatherData = {
        location: {
            location: 'Test Region',
            degreeDays: 2000,
            groundTemp: 10,
            postcode: 'TE1 1ST',
            lat: 51.5074,
            lng: -0.1278
        },
        degreeDays: 2000,
        groundTemp: 10
    };

    const mockHeatPump: HeatPump = {
        label: '8kW Package',
        outputCapacity: 8,
        costs: [
            { label: 'Design & Supply', cost: 4216 },
            { label: 'Installation', cost: 2900 },
            { label: 'Smart Thermostat', cost: 150 },
            { label: 'Consumer Unit', cost: 300 },
            { label: 'MCS Commissioning', cost: 1648 }
        ]
    };

    beforeEach(() => {
        jest.resetAllMocks();
        (WeatherDataService.getWeatherData as jest.Mock).mockResolvedValue(mockWeatherData);
        (HeatPumpService.getAllHeatPumps as jest.Mock).mockReturnValue([mockHeatPump]);
        (HousesService.calculateHeatLoss as jest.Mock).mockReturnValue(300);
        (HousesService.calculatePowerHeatLoss as jest.Mock).mockReturnValue(7);
    });

    describe('calculateQuoteForHouse', () => {
        it('should generate a complete quote with correct format', async () => {
            const result = await QuoteService.calculateQuoteForHouse(mockHouse);
            
            expect(result).toBeDefined();
            expect(result).toContain('--------------------------------------');
            expect(result).toContain('test-id');
            expect(result).toContain('Estimated Heat Loss = 300.00 kWh');
            expect(result).toContain('Design Region = Test Region');
            expect(result).toContain('Power Heat Loss = 7.00 kW');
            expect(result).toContain('8kW Package (8kW)');
            expect(result).toContain('Design & Supply, £4216.00');
            expect(result).toContain('Total Cost, including VAT =');
        });

        it('should handle design region not found (404)', async () => {
            const mockHeatLoss = 29710.8;
            (HousesService.calculateHeatLoss as jest.Mock).mockReturnValue(mockHeatLoss);
            (WeatherDataService.getWeatherData as jest.Mock).mockRejectedValue({
                status: 404,
                message: 'Design region not found'
            });

            const result = await QuoteService.calculateQuoteForHouse(mockHouse);

            expect(result).toBe(
                '--------------------------------------\n' +
                'test-id\n' +
                '--------------------------------------\n' +
                '  Heating Loss: 29710.8\n' +
                '  Warning: Could not find design region'
            );
        });

        it('should handle design region not found (500)', async () => {
            const mockHeatLoss = 29710.8;
            (HousesService.calculateHeatLoss as jest.Mock).mockReturnValue(mockHeatLoss);
            (WeatherDataService.getWeatherData as jest.Mock).mockRejectedValue({
                status: 500,
                message: 'Teapod Problem'
            });

            const result = await QuoteService.calculateQuoteForHouse(mockHouse);

            expect(result).toBe(
                '--------------------------------------\n' +
                'test-id\n' +
                '--------------------------------------\n' +
                '  Heating Loss: 29710.8\n' +
                '  Warning: Could not find design region'
            );
        });

        it('should handle design region not found with statusCode', async () => {
            (WeatherDataService.getWeatherData as jest.Mock).mockRejectedValue({
                statusCode: 404,
                message: 'Design region not found'
            });

            const result = await QuoteService.calculateQuoteForHouse(mockHouse);
            expect(result).toContain('Warning: Could not find design region');
        });

        it('should handle design region not found with statusCode of teapod', async () => {
            (WeatherDataService.getWeatherData as jest.Mock).mockRejectedValue({
                statusCode: 500,
                message: 'Design region not found'
            });

            const result = await QuoteService.calculateQuoteForHouse(mockHouse);
            expect(result).toContain('Warning: Could not find design region');
        });

        it('should return null when no suitable heat pump found', async () => {
            (HousesService.calculatePowerHeatLoss as jest.Mock).mockReturnValue(20); // Too high for available pumps
            (HeatPumpService.getAllHeatPumps as jest.Mock).mockReturnValue([
                { ...mockHeatPump, outputCapacity: 15 }
            ]);

            const result = await QuoteService.calculateQuoteForHouse(mockHouse);
            expect(result).toBeNull();
        });

        it('should calculate VAT correctly', async () => {
            const result = await QuoteService.calculateQuoteForHouse(mockHouse);
            const subtotal = mockHeatPump.costs.reduce((sum, cost) => sum + cost.cost, 0);
            const total = subtotal * 1.05;
            
            expect(result).toContain(`Total Cost, including VAT = £${total.toFixed(2)}`);
        });

        it('should format numbers with correct decimal places', async () => {
            (HousesService.calculateHeatLoss as jest.Mock).mockReturnValue(300.5678);
            (HousesService.calculatePowerHeatLoss as jest.Mock).mockReturnValue(7.3456);

            const result = await QuoteService.calculateQuoteForHouse(mockHouse);
            
            expect(result).toContain('Estimated Heat Loss = 300.57 kWh');
            expect(result).toContain('Power Heat Loss = 7.35 kW');
        });
    });
}); 