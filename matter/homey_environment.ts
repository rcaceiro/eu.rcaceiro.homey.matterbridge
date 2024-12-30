import {Logger, LogLevel, StorageService} from "@matter/main";
import {Environment} from "@matter/general";
import {HomeyStorage} from "./homey_storage";
import Homey from "homey";
import {StorageBackendDiskAsync} from "@matter/nodejs";

export class HomeyEnvironment extends Environment {
    constructor(
        homey: Homey.App,
        debug: boolean = false,
        environment: Environment = Environment.default,
    ) {
        super("homey_environment", environment);

        let storage = new StorageService(this, () => {
            if (debug) {
                return new StorageBackendDiskAsync("/userdata/eu.rcaceiro.homey.matterbridge/matter")
                // return new HomeyStorage(homey.homey.settings);
            }
            return new HomeyStorage(homey.homey.settings)
        });
        this.set(StorageService, storage)

        if (debug) {
            Logger.defaultLogLevel = LogLevel.DEBUG;
        } else {
            Logger.defaultLogLevel = LogLevel.WARN;
        }
    }
}