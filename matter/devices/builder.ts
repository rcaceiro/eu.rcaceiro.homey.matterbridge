import {Endpoint} from "@matter/main";
import {MatterDevice} from "./device";
import {ContactMatterDevice} from "./contact_delegate";
import {WeatherMatterDevice} from "./weather_delegate";
import {SocketMatterDevice} from "./socket_delegate";

export class MatterDeviceBuilder {
    public static async create(bridge: Endpoint, device: any, firmware_version: string): Promise<MatterDevice | null> {
        if (device.flags.includes('matter')) {
            return null;
        }

        switch (device.class) {
            case 'sensor':
                return await MatterDeviceBuilder.createSensor(bridge, device, firmware_version);
            case 'socket':
                return await MatterDeviceBuilder.createSocket(bridge, device, firmware_version);
            default:
                return null;
        }
    }

    private static async createSensor(bridge: Endpoint, device: any, firmware_version: string): Promise<MatterDevice | null> {
        if (device.capabilities.includes('alarm_contact')) {
            return new ContactMatterDevice(bridge, device, firmware_version)
        }
        if (device.capabilities.includes('measure_humidity') || device.capabilities.includes('measure_pressure') || device.capabilities.includes('measure_temperature')) {
            return new WeatherMatterDevice(bridge, device, firmware_version)
        }
        return null;
    }

    private static async createSocket(bridge: Endpoint, device: any, firmware_version: string): Promise<MatterDevice | null> {
        if (device.capabilities.includes('onoff')) {
            return new SocketMatterDevice(bridge, device, firmware_version)
        }
        return null;
    }
}