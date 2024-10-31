import {Observable} from "rxjs";
import {HomeyDevice} from "./device";

export class SocketDevice extends HomeyDevice {
    constructor(
        device: any,
        firmware_version: string,
    ) {
        super(device, firmware_version);
        this.listen('onoff')
    }

    get onoff(): Observable<boolean> | undefined {
        return this.capabilities.get('onoff')?.observable as Observable<boolean>
    }

    set onoff(value: boolean) {
        this.set('onoff', value)
    }
}