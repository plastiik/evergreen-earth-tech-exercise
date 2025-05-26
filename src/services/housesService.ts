import type { House, Houses } from '../types/house.types';
import type { WeatherData } from '../types/weather.types';
import housesData from '../data/houses.json';

namespace HousesService {
    export function getAllHouses(): Houses {
        return housesData as Houses;
    }

    export function calculateHeatLoss(house: House): number {
        return house.floorArea * house.heatingFactor * house.insulationFactor;
    }

    export function calculatePowerHeatLoss(house: House, weatherData: WeatherData): number {
        if (weatherData.degreeDays <= 0) {
            throw new Error('Heating degree days must be greater than 0');
        }

        const heatLoss = calculateHeatLoss(house);
        
        return heatLoss / weatherData.degreeDays;
    }
}

export default HousesService;
