type FunctionToExecute = (...args: any[]) => any
interface ExecuteOptions {
    TTL?: number
}

export class Cache {
    cache: Map<string, any>
    tempCache: Map<string, FunctionToExecute>

    constructor () {
        this.cache = new Map()
        this.tempCache = new Map()
    }

    public async executeWithCache (key: string, func: FunctionToExecute, options: ExecuteOptions = {}): Promise<any> {
        if (typeof key !== 'string') throw new Error(`Key should be a string, got ${typeof key}`)

        if (this.cache.has(key)) {
            return this.cache.get(key)
        }

        if (this.tempCache.has(key)) {
            return await this.tempCache.get(key)
        }

        if (options.TTL) {
            this.deleteWithDelay(key, options.TTL)
        }

        this.tempCache.set(key, func())
        const result = await this.tempCache.get(key)
        this.cache.set(key, result)
        this.tempCache.delete(key)

        return result
    }

    public delete (key: string): boolean {
        return this.cache.delete(key) || this.tempCache.delete(key)
    }

    public clear (): void {
        this.tempCache.clear()
        this.cache.clear()
    }

    private deleteWithDelay (key: string, delay: number) {
        setTimeout(() => this.delete(key), delay)
    }
}
