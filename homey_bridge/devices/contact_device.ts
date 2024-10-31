import {Observable} from "rxjs";
import {HomeyDevice} from "./device";

export class ContactDevice extends HomeyDevice {
    constructor(
        device: any,
        firmware_version: string,
    ) {
        super(device, firmware_version);
        this.listen('alarm_contact')
    }

    get contact(): Observable<boolean> | undefined {
        return this.capabilities.get('alarm_contact')?.observable as Observable<boolean>
    }

    set contact(value: boolean) {
        this.set('alarm_contact', value)
    }
}