import type { HeatPump, HeatPumps } from '../types/heat-pump.types';
import HeatPumpService from './heatPumpService';

describe('HeatPumpService', () => {
    const mockHeatPumps: HeatPumps = [
        {
            label: '8kW Package',
            outputCapacity: 8,
            costs: [
                { label: 'Design & Supply', cost: 4216 },
                { label: 'Installation', cost: 2900 },
                { label: 'Smart Thermostat', cost: 150 },
                { label: 'Consumer Unit', cost: 300 },
                { label: 'MCS Commissioning', cost: 1648 }
            ]
        },
        {
            label: '5kW Package',
            outputCapacity: 5,
            costs: [
                { label: 'Design & Supply', cost: 3947 },
                { label: 'Installation', cost: 2900 },
                { label: 'Smart Thermostat', cost: 150 },
                { label: 'Consumer Unit', cost: 300 },
                { label: 'MCS Commissioning', cost: 1648 }
            ]
        }
    ];

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    describe('getAllHeatPumps', () => {
        it('should return all heat pumps', () => {
            const heatPumps = HeatPumpService.getAllHeatPumps();
            expect(heatPumps).toBeDefined();
            expect(Array.isArray(heatPumps)).toBe(true);
            expect(heatPumps.length).toBeGreaterThan(0);

            heatPumps.forEach(pump => {
                expect(pump).toHaveProperty('label');
                expect(pump).toHaveProperty('outputCapacity');
                expect(pump).toHaveProperty('costs');
                expect(Array.isArray(pump.costs)).toBe(true);
                
                pump.costs.forEach(cost => {
                    expect(cost).toHaveProperty('label');
                    expect(cost).toHaveProperty('cost');
                    expect(typeof cost.cost).toBe('number');
                });
            });
        });
    });

    describe('testing data integrity', () => {
        it('should have unique output capacities', () => {
            const heatPumps = HeatPumpService.getAllHeatPumps();
            const capacities = heatPumps.map(pump => pump.outputCapacity);
            const uniqueCapacities = new Set(capacities);
            expect(capacities.length).toBe(uniqueCapacities.size);
        });

        it('should have consistent cost structure across all packages', () => {
            const heatPumps = HeatPumpService.getAllHeatPumps();
            const firstPumpCostCount = heatPumps[0].costs.length;
            const expectedCostTypes = [
                'Design & Supply of your Air Source Heat Pump System Components',
                'Installation of your Air Source Heat Pump and Hot Water Cylinder',
                'Supply & Installation of your Homely Smart Thermostat',
                'Supply & Installation of a new Consumer Unit',
                'MCS System Commissioning & HIES Insurance-backed Warranty'
            ];

            heatPumps.forEach(pump => {
                expect(pump.costs.length).toBe(firstPumpCostCount);
                
                pump.costs.forEach((cost, index) => {
                    expect(cost.label.startsWith(expectedCostTypes[index])).toBe(true);
                });

                const designSupplyCost = pump.costs[0];
                expect(designSupplyCost.label).toContain(`(${pump.outputCapacity}kW)`);
            });
        });

        it('should have valid numeric values', () => {
            const heatPumps = HeatPumpService.getAllHeatPumps();
            heatPumps.forEach(pump => {
                expect(typeof pump.outputCapacity).toBe('number');
                expect(pump.outputCapacity).toBeGreaterThan(0);

                pump.costs.forEach(cost => {
                    expect(typeof cost.cost).toBe('number');
                    expect(cost.cost).toBeGreaterThan(0);
                });
            });
        });

        it('should have properly formatted labels', () => {
            const heatPumps = HeatPumpService.getAllHeatPumps();
            heatPumps.forEach(pump => {
                expect(pump.label).toMatch(/^\d+kW Package$/);
                expect(parseInt(pump.label)).toBe(pump.outputCapacity);
            });
        });
    });
});
