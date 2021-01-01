type FunctionToExecute = (...args: any[]) => any

export default class Cache {
    cache: Map<string, any>
    tempCache: Map<string, FunctionToExecute>

    constructor () {
        this.cache = new Map()
        this.tempCache = new Map()
    }

    public async executeWithCache (key: string, func: FunctionToExecute): Promise<any> {
        if (typeof key !== 'string') throw new Error(`Key should be a string, got ${typeof key}`)

        if (this.cache.has(key)) {
            return this.cache.get(key)
        }

        if (this.tempCache.has(key)) {
            return await this.tempCache.get(key)
        }

        this.tempCache.set(key, func())
        const result = await this.tempCache.get(key)
        this.cache.set(key, result)
        this.tempCache.delete(key)

        return result
    }
}
