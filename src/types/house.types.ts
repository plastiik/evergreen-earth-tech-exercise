export interface House {
    submissionId: string;
    designRegion: string;
    floorArea: number;
    age: string;
    heatingFactor: number;
    insulationFactor: number;
}

export type Houses = House[];
