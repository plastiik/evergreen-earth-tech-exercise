import { API_CONFIG } from '../config/api.config';
import type { WeatherResponse, WeatherErrorResponse, WeatherData } from '../types/weather.types';

namespace WeatherService {
    function transformResponse(response: WeatherResponse): WeatherData {
        return {
            location: response.location,
            degreeDays: Number(response.location.degreeDays),
            groundTemp: Number(response.location.groundTemp)
        };
    }

    export async function getWeatherData(location: string): Promise<WeatherData> {
        try {
            const response = await fetch(`${API_CONFIG.WEATHER_API.BASE_URL}?location=${encodeURIComponent(location)}`, {
                method: 'GET',
                headers: {
                    'x-api-key': API_CONFIG.WEATHER_API.API_KEY,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({} as WeatherErrorResponse));
                throw new Error(
                    errorData.error || `Weather API request failed with status ${response.status}`
                );
            }

            const data: WeatherResponse = await response.json();
            return transformResponse(data);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            throw error;
        }
    }
}

export default { getWeatherData: WeatherService.getWeatherData };
