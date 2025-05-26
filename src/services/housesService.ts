import type { House, Houses } from '../types/house.types';
import housesData from '../data/houses.json';

namespace HousesService {
    export function getAllHouses(): Houses {
        return housesData as Houses;
    }

    export function calculateHeatLoss(house: House): number {
        return house.floorArea * house.heatingFactor * house.insulationFactor;
    }
}

export default HousesService;
