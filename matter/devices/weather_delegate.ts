import {BridgedNodeEndpoint} from "@matter/main/endpoints";
import {Endpoint} from "@matter/main";
import {HumiditySensorDevice} from "@matter/main/devices/humidity-sensor";
import {MatterDevice} from "./device";
import {PressureSensorDevice} from "@matter/main/devices/pressure-sensor";
import {TemperatureSensorDevice} from "@matter/main/devices/temperature-sensor";
import {firstValueFrom, map, OperatorFunction} from "rxjs";
import {Capability} from "../capability";

export class WeatherMatterDevice extends MatterDevice {
    private mHumidity: Capability | null;
    private mPressure: Capability | null;
    private mTemperature: Capability | null;

    constructor(
        bridge: Endpoint,
        device: any,
        firmware_version: string,
    ) {
        super(bridge, device, firmware_version);
        this.mHumidity = null
        this.mPressure = null
        this.mTemperature = null
    }

    protected async initialize(): Promise<void> {
        this.mHumidity = new Capability(this.device, "measure_humidity")
        this.mPressure = new Capability(this.device, "measure_pressure")
        this.mTemperature = new Capability(this.device, "measure_temperature")

        const humidity = this.mHumidity
            ?.observable
            ?.pipe(
                map(value => Number(value)),
                map(value => value * 100),
                this.mHumidityMeasurement(),
            )
        const pressure = this.mPressure
            ?.observable
            ?.pipe(
                map(value => Number(value)),
                this.mPressureMeasurement(),
            )
        const temperature = this.mTemperature
            ?.observable
            ?.pipe(
                map(value => Number(value)),
                map(value => value * 100),
                this.mTemperatureMeasurement(),
            )

        const composed = BridgedNodeEndpoint
            // .with(PowerSourceServer.with(PowerSource.Feature.Battery, PowerSource.Feature.Replaceable))
        const node = new Endpoint(composed, {
            id: this.device.id,
            bridgedDeviceBasicInformation: await this.basicInformation(),
            // powerSource: await this.batteryReplaceablePowerSource(),
        });
        await this.bridge.add(node)

        if (humidity != null) {
            const sensor = HumiditySensorDevice
            const first = await firstValueFrom(humidity)
            const endpoint = new Endpoint(sensor, {
                id: `${this.device.id}-humidity`,
                relativeHumidityMeasurement: first,
            })
            await node.add(endpoint)

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
            await node.add(endpoint)

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
            await node.add(endpoint)

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