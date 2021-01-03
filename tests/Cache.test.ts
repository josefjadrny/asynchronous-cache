import { Cache } from '../src/Cache'
let cache = new Cache()

const resultOfAsyncMock = 'ok'
const key = 'someKey'
const asyncMock = jest.fn(() => {
    return new Promise(resolve => setTimeout(() => resolve(resultOfAsyncMock), 50))
})

beforeEach(() => {
    cache = new Cache()
    asyncMock.mockClear()
})

test('returns passed function if not cached', async () => {
    expect(await cache.executeWithCache(key, asyncMock)).toEqual(resultOfAsyncMock)
})

test('returns cached function if is cached', async () => {
    await cache.executeWithCache(key, asyncMock)
    expect(await cache.executeWithCache(key, asyncMock)).toEqual(resultOfAsyncMock)
    expect(asyncMock.mock.calls.length).toBe(1)
})

test('should properly save results to cache', async () => {
    const functionToCache = async () => { return 'test' }
    await cache.executeWithCache(key, functionToCache)
    await cache.executeWithCache(key, asyncMock)
    await cache.executeWithCache('another key', asyncMock)
    expect(cache.cache).toEqual(new Map([[key, 'test'], ['another key', 'ok']]))
})

test('async function should be executed only once in async calls', async () => {
    const promiseAll = Promise.all([
        cache.executeWithCache(key, asyncMock),
        cache.executeWithCache(key, asyncMock),
        cache.executeWithCache(key, asyncMock),
    ])
    const result = await promiseAll
    expect(asyncMock.mock.calls.length).toBe(1)
    expect(result).toEqual([resultOfAsyncMock, resultOfAsyncMock, resultOfAsyncMock])
})

test('should throw an error when key is not a string', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await expect(cache.executeWithCache({}, asyncMock)).rejects.toThrow('Key should be a string, got object')
})

test('should return false for delete non-exist key', async () => {
    expect(cache.delete(key)).toBe(false)
})

test('should delete record from cache and return true', async () => {
    await cache.executeWithCache(key, asyncMock)
    expect(cache.delete(key)).toBe(true)
    expect(cache.cache).toEqual(new Map())
    expect(cache.tempCache).toEqual(new Map())
})

test('should delete executing record from cache and return true', async () => {
    // Do not wait for async function (function is in temp cache)
    cache.executeWithCache(key, asyncMock)
    expect(cache.delete(key)).toBe(true)
    expect(cache.cache).toEqual(new Map())
    expect(cache.tempCache).toEqual(new Map())
})

test('should clear cache', async () => {
    await cache.executeWithCache(key, asyncMock)
    await cache.executeWithCache('anotherKey', asyncMock)
    cache.clear()
    expect(cache.cache).toEqual(new Map())
    expect(cache.tempCache).toEqual(new Map())
})

test('should delete record with TTL', async () => {
    // This function will be resolved after 50ms
    await cache.executeWithCache(key, asyncMock, { TTL: 60 })
    expect(cache.cache).toEqual(new Map([[key, resultOfAsyncMock]]))
    // 50 + 20 = 70ms, TTL was set to 60ms
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(cache.cache).toEqual(new Map())
})
