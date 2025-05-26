interface WeatherApiConfig {
    BASE_URL: string;
    API_KEY: string;
}

interface ApiConfig {
    WEATHER_API: WeatherApiConfig;
}

export const API_CONFIG: ApiConfig = {
    WEATHER_API: {
        BASE_URL: 'https://063qqrtqth.execute-api.eu-west-2.amazonaws.com/v1/weather',
        API_KEY: 'f661f74e-20a7-4e9f-acfc-041cfb846505'
    }
} as const;
