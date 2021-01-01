import Cache from '../src/Cache'
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
