import {Observable} from "rxjs";
import {Power} from "./power";

export interface Device {

    get id(): string

    get manufacturer(): string

    get model(): string

    get name(): string

    get powerSource(): Observable<Power.Source>

    get serial_number(): string

    destructor(): Promise<void>
}