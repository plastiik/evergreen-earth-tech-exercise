import type { HeatPump, HeatPumps } from '../types/heat-pump.types';
import heatPumpsData from '../data/heat-pumps.json';

namespace HeatPumpService {
    export function getAllHeatPumps(): HeatPumps {
        return heatPumpsData as HeatPumps;
    }
}

export default HeatPumpService;
