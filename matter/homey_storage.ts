import {fromJson, MaybeAsyncStorage, MaybePromise, StorageError, SupportedStorageTypes, toJson} from "@matter/general";
import ManagerSettings from "homey/manager/settings";

export class HomeyStorage extends MaybeAsyncStorage {
    private readonly mSettings: ManagerSettings;

    private mInitialized: boolean;

    constructor(settings: ManagerSettings, clean: boolean = false) {
        super()
        this.mInitialized = false;
        this.mSettings = settings;

        if (clean) {
            this.mSettings.getKeys().forEach(this.mSettings.unset)
        }
    }

    get initialized(): boolean {
        return this.mInitialized;
    }

    clearAll(contexts: string[]): MaybePromise<void> {
        return new Promise<void>(async (resolve, reject) => {
            if (!this.mInitialized) {
                return reject(new StorageError("Storage not initialized, clearAll"))
            }

            const mKey = this.mKey(contexts, null)
            const promises = this.mSettings
                .getKeys()
                .map(async key => {
                    if (!key.startsWith(mKey)) {
                        return
                    }
                    this.mSettings.unset(key)
                })
            await Promise.allSettled(promises);
            resolve()
        })
    }

    close(): MaybePromise<void> {
        return new Promise<void>(resolve => {
            this.mInitialized = false;
            resolve()
        });
    }

    contexts(contexts: string[]): MaybePromise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            if (!this.mInitialized) {
                return reject(new StorageError("Storage not initialized, contexts"))
            }

            let promises = this.mSettings
                .getKeys()
                .map(async (key: string) => {
                    const parts = this.mKeyParts(key)
                    if (parts.contexts.length <= contexts.length || parts.key == null) {
                        return null
                    }

                    for (const index in contexts) {
                        if (contexts[index] == parts.contexts[index]) {
                            continue
                        }
                        return null
                    }

                    return parts.key
                })
            Promise.all(promises).then(results => {
                const keys = results.filter(value => value != null)
                resolve(keys)
            })
        });
    }

    delete(contexts: string[], key: string): MaybePromise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this.mInitialized) {
                return reject(new StorageError("Storage not initialized, delete"))
            }

            const mKey = this.mKey(contexts, key)
            this.mSettings.unset(mKey)
            resolve()
        })
    }

    get<T extends SupportedStorageTypes>(contexts: string[], key: string): MaybePromise<T | undefined> {
        return new Promise<T | undefined>((resolve, reject) => {
            if (!this.mInitialized) {
                return reject(new StorageError("Storage not initialized, get"))
            }

            const mKey = this.mKey(contexts, key)
            const value = this.mSettings.get(mKey)
            if (value == null) {
                resolve(undefined)
            } else {
                resolve(fromJson(value) as T)
            }
        })
    }

    initialize(): MaybePromise<void> {
        return new Promise<void>(resolve => {
            this.mInitialized = true;
            resolve()
        });
    }

    keys(contexts: string[]): MaybePromise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            if (!this.mInitialized) {
                return reject(new StorageError("Storage not initialized, keys"))
            }

            const mKey = this.mKey(contexts, null)
            const promises = this.mSettings
                .getKeys()
                .map(async key => {
                    if (!key.startsWith(mKey)) {
                        return null
                    }

                    const subKey = key.replace(`${mKey}.`, "").split('.')
                    if (subKey.length != 1) {
                        return null
                    }
                    return subKey[0]
                })
            Promise
                .all(promises)
                .then(results => {
                    const keys = results.filter(value => value != null)
                    resolve(keys)
                })
        });
    }

    set(contexts: string[], values: Record<string, SupportedStorageTypes>): MaybePromise<void>;
    set(contexts: string[], key: string, value: SupportedStorageTypes): MaybePromise<void>;
    set(contexts: string[], keyOrValues: Record<string, SupportedStorageTypes> | string, value?: SupportedStorageTypes): MaybePromise<void> {
        return new Promise((resolve, reject) => {
            if (!this.mInitialized) {
                return reject(new StorageError("Storage not initialized, set"))
            }

            if (typeof keyOrValues === "string") {
                const mKey = this.mKey(contexts, keyOrValues)
                if (value == null) {
                    this.mSettings.unset(mKey)
                } else {
                    this.mSettings.set(mKey, toJson(value))
                }
                return resolve()
            }

            for (const [key, value] of Object.entries(keyOrValues)) {
                const mKey = this.mKey(contexts, key)
                if (value == null) {
                    this.mSettings.unset(mKey)
                } else {
                    this.mSettings.set(mKey, toJson(value))
                }
            }
            resolve()
        });
    }

    values(contexts: string[]): MaybePromise<Record<string, SupportedStorageTypes>> {
        return new Promise(async (resolve, reject) => {
            if (!this.mInitialized) {
                return reject(new StorageError("Storage not initialized, values"))
            }

            const values = {} as Record<string, SupportedStorageTypes>;
            const keys = await this.keys(contexts)
            const promises = keys.map(async (key: string) => {
                const mKey = this.mKey(contexts, key)
                const value = this.mSettings.get(mKey)
                if (value == null) {
                    return
                }
                values[mKey] = fromJson(value)
            })
            await Promise.all(promises);
            resolve(values);
        });
    }

    async debug(): Promise<any> {
        const obj: any = {}
        this.mSettings
            .getKeys()
            .forEach((key: string) => {
                obj[key] = this.mSettings.get(key)
            })
        return obj
    }

    private mKey(contexts: string[], key: string | null): string {
        let mKey = contexts.join('.')
        if (key == null) {
            return mKey
        }
        return `${mKey}.${key}`
    }

    private mKeyParts(key: string): { contexts: string[], key: string | null } {
        const parts = key.split('.')
        const mKey: string | null = parts[parts.length - 1]
        parts.pop()

        return {
            contexts: parts,
            key: mKey,
        }
    }
}