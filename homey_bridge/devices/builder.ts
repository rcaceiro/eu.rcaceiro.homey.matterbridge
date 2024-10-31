import {WeatherDevice} from "./weather_device";
import {HomeyDevice} from "./device";
import {ContactDevice} from "./contact_device";
import {SocketDevice} from "./socket_device";

export class HomeyDeviceBuilder {
    public static async create(device: any, firmware_version: string): Promise<HomeyDevice | null> {
        switch (device.class) {
            case 'sensor':
                return await HomeyDeviceBuilder.createSensor(device, firmware_version);
            case 'socket':
                return await HomeyDeviceBuilder.createSocket(device, firmware_version);
            default:
                return null;
        }
    }

    private static async createSensor(device: any, firmware_version: string): Promise<HomeyDevice | null> {
        if (device.capabilities.includes('alarm_contact')) {
            return new ContactDevice(device, firmware_version)
        }
        if (device.capabilities.includes('measure_humidity') || device.capabilities.includes('measure_pressure') || device.capabilities.includes('measure_temperature')) {
            return new WeatherDevice(device, firmware_version)
        }
        return null;
    }

    private static async createSocket(device: any, firmware_version: string): Promise<HomeyDevice | null> {
        if (device.capabilities.includes('onoff')) {
            return new SocketDevice(device, firmware_version)
        }
        return null;
    }
}