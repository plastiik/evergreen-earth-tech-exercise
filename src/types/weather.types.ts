export interface WeatherLocation {
    location: string;
    degreeDays: number;
    groundTemp: number;
    postcode: string;
    lat: number;
    lng: number;
}

export interface WeatherResponse {
    location: WeatherLocation;
}

export interface WeatherErrorResponse {
    error: string;
}

export interface WeatherData {
    location: WeatherLocation;
    degreeDays: number;
    groundTemp: number;
}
