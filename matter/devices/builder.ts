import {Endpoint} from "@matter/main";
import {HomeyDevice} from "../../homey_bridge/devices/device";
import {MatterDevice} from "./device";
import {WeatherDevice} from "../../homey_bridge/devices/weather_device";
import {WeatherMatterDevice} from "./weather_delegate";
import {ContactDevice} from "../../homey_bridge/devices/contact_device";
import {ContactMatterDevice} from "./contact_delegate";
import {SocketDevice} from "../../homey_bridge/devices/socket_device";
import {SocketMatterDevice} from "./socket_delegate";

export class MatterDeviceBuilder {
    public static async create(bridge: Endpoint, device: HomeyDevice): Promise<MatterDevice | null> {
        if (device instanceof ContactDevice) {
            return new ContactMatterDevice(bridge, device);
        }
        if (device instanceof SocketDevice) {
            return new SocketMatterDevice(bridge, device);
        }
        if (device instanceof WeatherDevice) {
            return new WeatherMatterDevice(bridge, device)
        }
        return null
    }
}