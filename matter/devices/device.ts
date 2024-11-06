import {Device} from "../../homey_bridge/device";
import {HomeyDevice} from "../../homey_bridge/devices/device";
import {Observable, Subscription} from "rxjs";
import {Power} from "../../homey_bridge/power";
import {Endpoint} from "@matter/main";
import {PowerSource} from "@matter/main/clusters";
import {BasicInformation} from "@matter/types/clusters";

export abstract class MatterDevice implements Device {
    protected readonly bridge: Endpoint;
    protected readonly device: HomeyDevice
    protected readonly subscriptions: Set<Subscription>

    protected constructor(
        bridge: Endpoint,
        device: HomeyDevice,
    ) {
        this.bridge = bridge
        this.device = device
        this.subscriptions = new Set()
        this.initialize().then()
    }

    get id(): string {
        return this.device.id
    }

    get manufacturer(): string {
        return this.device.manufacturer
    }

    get model(): string {
        return this.device.model
    }

    get name(): string {
        return this.device.name
    }

    get powerSource(): Observable<Power.Source> {
        return this.device.powerSource;
    }

    get serial_number(): string {
        return this.device.serial_number
    }

    public async destructor() {
    }

    protected abstract initialize(): Promise<void>;

    protected async batteryPowerSource(): Promise<Partial<{
        batChargeLevel: number,
        batReplaceability: PowerSource.BatReplaceability,
        batReplacementNeeded: boolean,
        order: number,
        status: PowerSource.PowerSourceStatus,
        activeBatFaults?: PowerSource.BatFault[],
        batPercentRemaining?: number,
        batPresent?: boolean,
        batTimeRemaining?: number,
        batVoltage?: number,
        description?: string,
        endpointList?: number[],
    }>> {
        return {
            activeBatFaults: [],
            batChargeLevel: PowerSource.BatChargeLevel.Ok,
            batPercentRemaining: 100,
            batPresent: true,
            batReplaceability: PowerSource.BatReplaceability.UserReplaceable,
            batReplacementNeeded: false,
            batTimeRemaining: 12,
            batVoltage: 312,
            description: "Primary Battery",
            endpointList: [],
            order: 0,
            status: PowerSource.PowerSourceStatus.Active,
        }
    }

    protected async batteryReplaceablePowerSource(): Promise<Partial<{
        batChargeLevel: number,
        batQuantity: number,
        batReplaceability: PowerSource.BatReplaceability,
        batReplacementDescription: string,
        batReplacementNeeded: boolean,
        order: number,
        status: PowerSource.PowerSourceStatus,
        activeBatFaults?: PowerSource.BatFault[],
        batAnsiDesignation?: string,
        batApprovedChemistry?: PowerSource.BatApprovedChemistry
        batCapacity?: number,
        batCommonDesignation?: PowerSource.BatCommonDesignation,
        batIecDesignation?: string,
        batPercentRemaining?: number,
        batPresent?: boolean,
        batTimeRemaining?: number,
        batVoltage?: number,
        description?: string,
        endpointList?: number[],
    }>> {
        return {
            ...await this.batteryPowerSource(),
            batApprovedChemistry: PowerSource.BatApprovedChemistry.Alkaline,
            batCommonDesignation: PowerSource.BatCommonDesignation.Aa,
            batQuantity: 1,
            batReplacementDescription: "sda",
            batReplacementNeeded: false,
        }
    }

    protected async basicInformation(): Promise<Partial<{
        reachable: boolean,
        hardwareVersion?: number,
        hardwareVersionString?: string,
        manufacturingDate?: string,
        nodeLabel?: string,
        partNumber: string,
        productAppearance?: {
            finish: BasicInformation.ProductFinish,
            primaryColor: BasicInformation.Color | null,
        },
        productLabel?: string,
        productName?: string,
        productUrl: string,
        serialNumber?: string,
        softwareVersion?: number,
        softwareVersionString?: string,
        uniqueId?: string,
        vendorId?: number,
        vendorName?: string,
    }>> {
        return {
            nodeLabel: this.device.name,
            productName: this.device.model,
            productLabel: this.device.model,
            uniqueId: this.device.serial_number,
            reachable: true,
        }
    }
}