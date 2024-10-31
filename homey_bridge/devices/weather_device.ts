import {Observable} from "rxjs";
import {HomeyDevice} from "./device";

export class WeatherDevice extends HomeyDevice {
    constructor(
        device: any,
        firmware_version: string,
    ) {
        super(device, firmware_version);

        this.listen('measure_humidity');
        this.listen('measure_pressure');
        this.listen('measure_temperature');
    }

    get humidity(): Observable<number> | undefined {
        return this.capabilities.get('measure_humidity')?.observable as Observable<number>
    }

    get pressure(): Observable<number> | undefined {
        return this.capabilities.get('measure_pressure')?.observable as Observable<number>
    }

    get temperature(): Observable<number> | undefined {
        return this.capabilities.get('measure_temperature')?.observable as Observable<number>
    }

    set humidity(value: number) {
        this.set('measure_humidity', value)
    }

    set pressure(value: number) {
        this.set('measure_pressure', value)
    }

    set temperature(value: number) {
        this.set('measure_temperature', value)
    }
}