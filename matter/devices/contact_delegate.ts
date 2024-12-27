import {BridgedDeviceBasicInformationServer} from "@matter/node/behaviors";
import {ContactSensorDevice} from "@matter/main/devices/contact-sensor";
import {Endpoint} from "@matter/main";
import {MatterDevice} from "./device";
import {Capability} from "../capability";
import {firstValueFrom, map, OperatorFunction} from "rxjs";

export class ContactMatterDevice extends MatterDevice {
    private contact: Capability | null;

    public constructor(
        bridge: Endpoint,
        device: any,
        firmware_version: string,
    ) {
        super(bridge, device, firmware_version);
        this.contact = null;
    }

    protected async initialize(): Promise<void> {
        const contact = this.contact
            ?.observable
            ?.pipe(
                map(value => !value),
                this.mContactState(),
            )

        if (contact == null) {
            return
        }

        const sensor = ContactSensorDevice
            .with(BridgedDeviceBasicInformationServer)
        const first = await firstValueFrom(contact)
        const endpoint = new Endpoint(sensor, {
            id: `${this.device.id}`,
            booleanState: first,
            bridgedDeviceBasicInformation: await this.basicInformation(),
        })
        await this.bridge.add(endpoint)

        const subscription = contact
            .pipe(map(value => {
                return {
                    booleanState: value,
                }
            }))
            .subscribe(async (value) => {
                await endpoint.set(value)
            })
        this.subscriptions.add(subscription)
    }

    private mContactState(): OperatorFunction<boolean, Partial<{
        stateValue: boolean,
    }>> {
        return map(value => {
            return {
                stateValue: value,
            }
        })
    }
}