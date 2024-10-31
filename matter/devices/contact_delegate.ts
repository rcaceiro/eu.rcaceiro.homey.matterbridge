import {BridgedDeviceBasicInformationServer} from "@matter/node/behaviors";
import {ContactDevice} from "../../homey_bridge/devices/contact_device";
import {ContactSensorDevice} from "@matter/main/devices/contact-sensor";
import {Endpoint} from "@matter/main";
import {MatterDevice} from "./device";
import {firstValueFrom, map, OperatorFunction} from "rxjs";

export class ContactMatterDevice extends MatterDevice {
    protected readonly device: ContactDevice;

    constructor(bridge: Endpoint, device: ContactDevice) {
        super(bridge, device)
        this.device = device
    }

    protected async initialize(): Promise<void> {
        const contact = this.device.contact?.pipe(
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

        const subscription = contact.subscribe(async (value) => {
            await endpoint.set({
                booleanState: value,
            })
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