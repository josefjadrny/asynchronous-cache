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
