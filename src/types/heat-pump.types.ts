export interface HeatPumpCost {
    label: string;
    cost: number;
}

export interface HeatPump {
    label: string;
    outputCapacity: number;
    costs: HeatPumpCost[];
}

export type HeatPumps = HeatPump[];
