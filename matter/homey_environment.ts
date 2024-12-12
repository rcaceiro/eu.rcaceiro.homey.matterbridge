import {Logger, LogLevel, StorageBackendMemory, StorageService} from "@matter/main";
import {Environment} from "@matter/general";
import {StorageBackendDiskAsync} from "@matter/nodejs";

export class HomeyEnvironment extends Environment {
    constructor(debug: boolean = false, environment: Environment = Environment.default) {
        super("homey_environment", environment);

        let storage = new StorageService(this, () => {
            if (debug) {
                return new StorageBackendMemory({})
            }
            return new StorageBackendDiskAsync("/userdata/eu.rcaceiro.homey.matterbridge/matter")
        });
        this.set(StorageService, storage)

        if (debug) {
            Logger.defaultLogLevel = LogLevel.DEBUG;
        } else {
            Logger.defaultLogLevel = LogLevel.WARN;
        }
    }
}