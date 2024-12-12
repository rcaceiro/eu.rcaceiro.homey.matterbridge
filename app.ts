'use strict';

import Homey from 'homey';
import {AggregatorEndpoint} from "@matter/node/endpoints";
import {Endpoint, VendorId} from "@matter/main";
import {HomeyAPI} from "homey-api";
import {HomeyDeviceBuilder} from "./homey_bridge/devices/builder";
import {HomeyEnvironment} from "./matter/homey_environment";
import {MatterDeviceBuilder} from "./matter/devices/builder";
import {MatterDevice} from "./matter/devices/device";
import {ServerNode} from "@matter/node";
import {BasicInformation} from "@matter/types/clusters";

class MatterBridgeApplication extends Homey.App {
    private readonly mDevices: Set<MatterDevice> = new Set();

    private api: any;
    private bridge: Endpoint | null | undefined;
    private server: ServerNode | null | undefined;

    async onInit() {
        this.api = await HomeyAPI.createAppAPI({
            homey: this.homey,
        });

        this.server = await ServerNode.create({
            id: this.api.id,
            basicInformation: {
                nodeLabel: "Homey Pro",
                productId: 0,
                productLabel: "Homey Pro",
                productName: "Homey Pro",
                reachable: true,
                serialNumber: this.api.id,
                uniqueId: this.api.id,
                vendorId: VendorId(0x143C),
                vendorName: "Athom B.V.",
                productUrl: "https://homey.app/",
                productAppearance: {
                    finish: BasicInformation.ProductFinish.Polished,
                    primaryColor: BasicInformation.Color.Black,
                },
            },
            commissioning: {},
            environment: new HomeyEnvironment(),
            productDescription: {
                name: "Homey Pro",
                deviceType: AggregatorEndpoint.deviceType,
            },
        })
        this.bridge = new Endpoint(
            AggregatorEndpoint,
            {
                id: "homey_matter_bridge",
                isEssential: true,
            },
        );

        this.server.lifecycle.online.then(async () => {
            const bridge = this.bridge;
            if (bridge == null) {
                return
            }
            const devices = await this.api.devices.getDevices();
            for (const index in devices) {
                const homeyDevice = devices[index]

                const device = await HomeyDeviceBuilder.create(homeyDevice, this.homey.app.manifest.version)
                if (device == null) {
                    continue
                }

                const matter = await MatterDeviceBuilder.create(bridge, device)
                if (matter == null) {
                    continue;
                }
                this.mDevices.add(matter);
            }
        })

        await this.server.add(this.bridge);
        await this.server.start();
    }

    async onUninit() {
        console.debug("onUninit")
        await super.onUninit();
        await this.server?.prepareRuntimeShutdown()
        await this.server?.close()
    }
}

module.exports = MatterBridgeApplication