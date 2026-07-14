export interface Bike {
    id: string;
    name: string;
    type: string;
    battery: {
        percentage: number;
        isCritical: boolean;
    };
    chainSensor: {
        requiresMaintenance: boolean;
    };
    hasAlert: boolean;
}