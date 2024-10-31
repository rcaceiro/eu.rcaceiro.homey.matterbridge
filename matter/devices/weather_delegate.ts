import {BridgedNodeEndpoint} from "@matter/main/endpoints";
import {Endpoint} from "@matter/main";
import {HumiditySensorDevice} from "@matter/main/devices/humidity-sensor";
import {MatterDevice} from "./device";
import {PressureSensorDevice} from "@matter/main/devices/pressure-sensor";
import {TemperatureSensorDevice} from "@matter/main/devices/temperature-sensor";
import {WeatherDevice} from "../../homey_bridge/devices/weather_device";
import {firstValueFrom, map, OperatorFunction} from "rxjs";

export class WeatherMatterDevice extends MatterDevice {
    protected readonly device: WeatherDevice;

    constructor(bridge: Endpoint, device: WeatherDevice) {
        super(bridge, device)
        this.device = device
    }

    protected async initialize(): Promise<void> {
        const humidity = this.device.humidity?.pipe(
            map(value => value * 100),
            this.mHumidityMeasurement(),
        )
        const pressure = this.device.pressure?.pipe(
            this.mPressureMeasurement(),
        )
        const temperature = this.device.temperature?.pipe(
            map(value => value * 100),
            this.mTemperatureMeasurement(),
        )

        const composed = new Endpoint(BridgedNodeEndpoint, {
            id: this.device.id,
            bridgedDeviceBasicInformation: await this.basicInformation(),
        });
        await this.bridge.add(composed)

        if (humidity != null) {
            const sensor = HumiditySensorDevice
            // .with(PowerSourceServer.with(PowerSource.Feature.Battery, PowerSource.Feature.Replaceable))
            const first = await firstValueFrom(humidity)
            const endpoint = new Endpoint(sensor, {
                id: `${this.device.id}-humidity`,
                relativeHumidityMeasurement: first,
                // powerSource: await this.batteryPowerSource()
            })
            await composed.add(endpoint)

            const subscription = humidity.subscribe(async (value) => {
                await endpoint.set({
                    relativeHumidityMeasurement: value
                })
            })
            this.subscriptions.add(subscription)
        }

        if (pressure != null) {
            const sensor = PressureSensorDevice
            const first = await firstValueFrom(pressure)
            const endpoint = new Endpoint(sensor, {
                id: `${this.device.id}-pressure`,
                pressureMeasurement: first,
            })
            await composed.add(endpoint)

            const subscription = pressure.subscribe(async (value) => {
                await endpoint.set({
                    pressureMeasurement: value
                })
            })
            this.subscriptions.add(subscription)
        }

        if (temperature != null) {
            const sensor = TemperatureSensorDevice
            const first = await firstValueFrom(temperature)
            const endpoint = new Endpoint(sensor, {
                id: `${this.device.id}-temperature`,
                temperatureMeasurement: first,
            })
            await composed.add(endpoint)

            const subscription = temperature.subscribe(async (value) => {
                await endpoint.set({
                    temperatureMeasurement: value
                })
            })
            this.subscriptions.add(subscription)
        }
    }

    private mHumidityMeasurement(): OperatorFunction<number, Partial<{
        measuredValue: number | undefined,
        maxMeasuredValue?: number,
        minMeasuredValue?: number,
        tolerance?: number,
    }>> {
        return map(value => {
            return {
                measuredValue: value,
            }
        })
    }

    private mPressureMeasurement(): OperatorFunction<number, Partial<{
        measuredValue: number,
        maxMeasuredValue?: number,
        maxScaledValue?: number,
        minMeasuredValue?: number,
        minScaledValue?: number,
        scale?: number,
        scaledTolerance?: number,
        scaledValue?: number,
        tolerance?: number,
    }>> {
        return map(value => {
            return {
                measuredValue: value,
            }
        })
    }

    private mTemperatureMeasurement(): OperatorFunction<number, Partial<{
        measuredValue: number | undefined,
        maxMeasuredValue?: number,
        minMeasuredValue?: number,
        tolerance?: number,
    }>> {
        return map(value => {
            return {
                measuredValue: value,
            }
        })
    }
}