import {BridgedDeviceBasicInformationServer} from "@matter/node/behaviors";
import {Endpoint} from "@matter/main";
import {MatterDevice} from "./device";
import {OnOffPlugInUnitDevice} from "@matter/main/devices/on-off-plug-in-unit";
import {SocketDevice} from "../../homey_bridge/devices/socket_device";
import {firstValueFrom, map, OperatorFunction} from "rxjs";

export class SocketMatterDevice extends MatterDevice {
    protected readonly device: SocketDevice;

    constructor(bridge: Endpoint, device: SocketDevice) {
        super(bridge, device)
        this.device = device
    }

    protected async initialize(): Promise<void> {
        const onoff = this.device.onoff?.pipe(
            this.mOnOff(),
        )
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

        endpoint.events.onOff.onOff$Changed.on((value) => {
            this.device.onoff = value
        })
        const subscription = onoff.subscribe(async (value) => {
            await endpoint.set({
                onOff: value,
            })
        })
        this.subscriptions.add(subscription)
    }

    private mOnOff(): OperatorFunction<boolean, Partial<{
        globalSceneControl: boolean,
        offWaitTime: number,
        onTime: number,
        onOff: boolean,
        startUpOnOffTime: number | null,
    }>> {
        return map(value => {
            return {
                onOff: value,
            }
        })
    }
}