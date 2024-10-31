import {Observable, of} from "rxjs";
import {Capability} from "../capability";
import {Device} from "../device";
import {Power} from "../power";

export abstract class HomeyDevice implements Device {
    protected readonly capabilities: Map<string, Capability>
    protected readonly device: any
    protected readonly firmware_version: any

    public readonly model: string
    public readonly serial_number: string

    protected constructor(
        device: any,
        firmware_version: string,
    ) {
        this.capabilities = new Map<string, Capability>()
        this.device = device
        this.firmware_version = firmware_version

        let modelParts = this.device.driverId.split(":")
        this.model = modelParts[modelParts.length - 1]

        this.serial_number = this.device.settings.zb_ieee_address
        if (this.serial_number == null) {
            this.serial_number = this.device.data.uuid
        }
        if (this.serial_number == null) {
            this.serial_number = this.device.id
        }

        this.listen('measure_battery')
    }

    protected listen(capability_id: string) {
        const subject = new Capability(this.device, capability_id);
        this.capabilities.set(capability_id, subject);
    }

    protected async set(capability_id: string, value: string | number | boolean) {
        await this.capabilities.get(capability_id)?.next(value);
    }

    get id(): string {
        return this.device.id;
    }

    get manufacturer(): string {
        return this.device.ownerId;
    }

    get name(): string {
        return this.device.name;
    }

    get powerSource(): Observable<Power.Source> {
        return of({});
    }

    public async destructor() {
        for (const capability of this.capabilities.values()) {
            await capability.destructor()
        }
        await this.device.disconnect()
    }
}