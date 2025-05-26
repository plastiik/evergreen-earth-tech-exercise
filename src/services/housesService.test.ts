import type { House, Houses } from '../types/house.types';
import HousesService from './housesService';

describe('HousesService', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    describe('getAllHouses', () => {
        it('should return all houses', () => {
            const houses = HousesService.getAllHouses();
            expect(houses).toBeDefined();
            expect(Array.isArray(houses)).toBe(true);
            expect(houses.length).toBeGreaterThan(0);

            houses.forEach(house => {
                expect(house).toHaveProperty('submissionId');
                expect(house).toHaveProperty('designRegion');
                expect(house).toHaveProperty('floorArea');
                expect(house).toHaveProperty('age');
                expect(house).toHaveProperty('heatingFactor');
                expect(house).toHaveProperty('insulationFactor');
            });
        });
    });

    describe('calculateHeatLoss', () => {
        it('should calculate heat loss correctly for a single house', () => {
            const testHouse: House = {
                submissionId: 'test-id',
                designRegion: 'Test Region',
                floorArea: 100,
                age: '1967 - 1975',
                heatingFactor: 2,
                insulationFactor: 1.5
            };

            const heatLoss = HousesService.calculateHeatLoss(testHouse);
            expect(heatLoss).toBe(300);
        });

        it('should handle decimal values correctly', () => {
            const testHouse: House = {
                submissionId: 'test-id',
                designRegion: 'Test Region',
                floorArea: 125.5,
                age: '1967 - 1975',
                heatingFactor: 1.75,
                insulationFactor: 1.25
            };

            const heatLoss = HousesService.calculateHeatLoss(testHouse);
            expect(heatLoss).toBe(274.53125);
        });
    });

    describe('testing data integrity', () => {
        it('should have valid numeric values', () => {
            const houses = HousesService.getAllHouses();
            houses.forEach(house => {
                expect(typeof house.floorArea).toBe('number');
                expect(house.floorArea).toBeGreaterThan(0);
                
                expect(typeof house.heatingFactor).toBe('number');
                expect(house.heatingFactor).toBeGreaterThan(0);
                
                expect(typeof house.insulationFactor).toBe('number');
                expect(house.insulationFactor).toBeGreaterThan(0);
            });
        });

        it('should have unique submission IDs', () => {
            const houses = HousesService.getAllHouses();
            const submissionIds = houses.map(house => house.submissionId);
            const uniqueIds = new Set(submissionIds);
            expect(submissionIds.length).toBe(uniqueIds.size);
        });

        it('should have valid age formats', () => {
            const houses = HousesService.getAllHouses();
            const validAgeFormats = [
                /^pre 1900$/,
                /^\d{4} - \d{4}$/
            ];

            houses.forEach(house => {
                expect(
                    validAgeFormats.some(format => format.test(house.age))
                ).toBe(true);
            });
        });
    });
});
