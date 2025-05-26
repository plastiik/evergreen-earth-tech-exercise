import type { House, Houses } from '../types/house.types';
import type { WeatherData } from '../types/weather.types';
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

    describe('calculatePowerHeatLoss', () => {
        const testHouse: House = {
            submissionId: 'test-id',
            designRegion: 'Test Region',
            floorArea: 100,
            age: '1967 - 1975',
            heatingFactor: 2,
            insulationFactor: 1.5
        };

        const testWeatherData: WeatherData = {
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

        it('should calculate power heat loss correctly', () => {
            const powerHeatLoss = HousesService.calculatePowerHeatLoss(testHouse, testWeatherData);
            // Heat loss = 100 * 2 * 1.5 = 300
            // Power heat loss = 300 / 2000 = 0.15
            expect(powerHeatLoss).toBe(0.15);
        });

        it('should handle decimal values correctly', () => {
            const decimalHouse: House = {
                ...testHouse,
                floorArea: 125.5,
                heatingFactor: 1.75,
                insulationFactor: 1.25
            };

            const decimalWeatherData: WeatherData = {
                ...testWeatherData,
                degreeDays: 1852.5
            };

            const powerHeatLoss = HousesService.calculatePowerHeatLoss(decimalHouse, decimalWeatherData);
            // Heat loss = 125.5 * 1.75 * 1.25 = 274.53125
            // Power heat loss = 274.53125 / 1852.5 = 0.14819500674763833
            expect(powerHeatLoss).toBeCloseTo(0.1481, 4);
        });

        it('should throw error when degree days is 0', () => {
            const invalidWeatherData: WeatherData = {
                ...testWeatherData,
                degreeDays: 0
            };

            expect(() => {
                HousesService.calculatePowerHeatLoss(testHouse, invalidWeatherData);
            }).toThrow('Heating degree days must be greater than 0');
        });

        it('should throw error when degree days is negative', () => {
            const invalidWeatherData: WeatherData = {
                ...testWeatherData,
                degreeDays: -100
            };

            expect(() => {
                HousesService.calculatePowerHeatLoss(testHouse, invalidWeatherData);
            }).toThrow('Heating degree days must be greater than 0');
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
