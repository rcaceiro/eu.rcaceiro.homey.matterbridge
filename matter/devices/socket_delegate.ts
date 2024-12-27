import {BridgedDeviceBasicInformationServer} from "@matter/node/behaviors";
import {Endpoint} from "@matter/main";
import {MatterDevice} from "./device";
import {OnOffPlugInUnitDevice} from "@matter/main/devices/on-off-plug-in-unit";
import {firstValueFrom, map, OperatorFunction} from "rxjs";
import {Capability} from "../capability";

export class SocketMatterDevice extends MatterDevice {
    private mOnoff: Capability | null

    constructor(
        bridge: Endpoint,
        device: any,
        firmware_version: string,
    ) {
        super(bridge, device, firmware_version);
        this.mOnoff = null
    }

    protected async initialize(): Promise<void> {
        this.mOnoff = new Capability(this.device, "onoff")
        const onoff = this.mOnoff?.observable?.pipe(this.mOnOff())
        if (onoff == null) {
            return
        }

        const sensor = OnOffPlugInUnitDevice
            .with(BridgedDeviceBasicInformationServer)
        const first = await firstValueFrom(onoff)
        const endpoint = new Endpoint(sensor, {
            id: `${this.device.id}`,
            onOff: first,
            bridgedDeviceBasicInformation: await this.basicInformation(),
        })
        await this.bridge.add(endpoint)

        endpoint.events
            .onOff
            .onOff$Changed
            .on(async (value) => await this.mOnoff?.next(value))

        const subscription = onoff
            .pipe(
                map(onoff => {
                    return {
                        onOff: onoff,
                    }
                }),
            )
            .subscribe(async (value) => {
                await endpoint.set(value)
            })
        this.subscriptions.add(subscription)
    }

    private mOnOff(): OperatorFunction<string | number | boolean | null, Partial<{
        globalSceneControl: boolean,
        offWaitTime: number,
        onTime: number,
        onOff: boolean,
        startUpOnOffTime: number | null,
    }>> {
        return map(value => {
            return {
                onOff: Boolean(value),
            }
        })
    }
}