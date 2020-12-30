type FunctionToCache = (...args: any[]) => any

export class Cache {
    public async executeWithCache (func: FunctionToCache) {
        const result = await func()
        return result
    }
}
