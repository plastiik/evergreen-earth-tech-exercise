/// <reference types="jest" />

import weatherService from './weatherDataService';
import { API_CONFIG } from '../config/api.config';
import type { WeatherResponse, WeatherErrorResponse, WeatherData } from '../types/weather.types';

const { getWeatherData } = weatherService;
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('WeatherDataService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should fetch and transform weather data successfully', async () => {
        const mockApiResponse: WeatherResponse = {
            location: {
                location: 'Borders (Boulmer)',
                degreeDays: 2483,
                groundTemp: 9,
                postcode: 'NE66',
                lat: 55.424,
                lng: -1.583
            }
        };

        const expectedTransformedData: WeatherData = {
            location: mockApiResponse.location,
            degreeDays: 2483,
            groundTemp: 9
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiResponse
        } as Response);

        const result = await getWeatherData('Borders (Boulmer)');

        expect(mockFetch).toHaveBeenCalledWith(
            `${API_CONFIG.WEATHER_API.BASE_URL}?location=Borders%20(Boulmer)`,
            {
                method: 'GET',
                headers: {
                    'x-api-key': API_CONFIG.WEATHER_API.API_KEY
                }
            }
        );

        expect(result).toEqual(expectedTransformedData);
    });

    it('should handle API error responses', async () => {
        const errorResponse: WeatherErrorResponse = {
            error: 'Not Found'
        };

        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => errorResponse
        } as Response);

        await expect(getWeatherData('Invalid Location')).rejects.toThrow(
            'Not Found'
        );
    });

    it('should handle network errors', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        await expect(getWeatherData('Borders (Boulmer)')).rejects.toThrow('Network error');
    });

    it('should properly encode location parameters', async () => {
        const mockApiResponse: WeatherResponse = {
            location: {
                location: 'Test Location',
                degreeDays: 1000,
                groundTemp: 10,
                postcode: 'TEST',
                lat: 0,
                lng: 0
            }
        };

        const expectedTransformedData: WeatherData = {
            location: mockApiResponse.location,
            degreeDays: 1000,
            groundTemp: 10
        };
        
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiResponse
        } as Response);

        const result = await getWeatherData('Location with spaces & special chars');

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('location=Location%20with%20spaces%20%26%20special%20chars'),
            expect.any(Object)
        );

        expect(result).toEqual(expectedTransformedData);
    });

    it('should handle API error message response', async () => {
        const errorResponse: WeatherErrorResponse = {
            error: 'Something went wrong, please try again'
        };
        
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => errorResponse
        } as Response);

        await expect(getWeatherData('Some Location')).rejects.toThrow(
            'Something went wrong, please try again'
        );
    });

    it('should handle teapot error response', async () => {
        const errorResponse: WeatherErrorResponse = {
            error: 'Critical teapot error, please try again'
        };
        
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 418,
            json: async () => errorResponse
        } as Response);

        await expect(getWeatherData('Teapot Location')).rejects.toThrow(
            'Critical teapot error, please try again'
        );
    });
});
