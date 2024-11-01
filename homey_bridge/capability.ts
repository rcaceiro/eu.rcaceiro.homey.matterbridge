import {BehaviorSubject, Observable} from "rxjs";
import {HomeyAPIV3} from "homey-api";
import DeviceCapability = HomeyAPIV3.ManagerDevices.Device.DeviceCapability;
import Device = HomeyAPIV3.ManagerDevices.Device;

export class Capability {
    private readonly mCapability: DeviceCapability
    private readonly mSubject: BehaviorSubject<string | number | boolean | null>

    constructor(device: Device, capability_id: string) {
        this.mSubject = new BehaviorSubject(null as string | number | boolean | null);
        this.mCapability = device.makeCapabilityInstance(capability_id, (value) => {
            this.mSubject.next(value);
        });
        this.mSubject.next(this.mCapability.value);
    }

    public get observable(): Observable<string | number | boolean | null> {
        return this.mSubject.asObservable()
    }

    public get value(): string | number | boolean | null {
        return this.mSubject.value
    }

    public async destructor() {
        this.mCapability.removeAllListeners();
    }

    public async next(value: string | number | boolean) {
        await this.mCapability.setValue(value)
        // device.setCapabilityValue({
        //     capabilityId: capability_id,
        //     value: value,
        // })
    }
}