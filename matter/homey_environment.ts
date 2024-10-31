import Homey from "homey";
import {StorageBackendMemory, StorageService} from "@matter/main";
import {Environment} from "@matter/general";

export class HomeyEnvironment extends Environment {
    private readonly app: Homey.App

    constructor(app: Homey.App, environment: Environment = Environment.default) {
        super("homey_environment", environment);
        this.app = app;

        let storage = new StorageService(this, () => {
            return new StorageBackendMemory()
        });
        this.set(StorageService, storage)
    }
}