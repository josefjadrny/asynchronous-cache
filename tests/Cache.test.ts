import { Cache } from '../src/Cache'
let cache = new Cache()

const resultOfAsyncFnc = 'ok'
const asyncFnc = () => {
    return new Promise(resolve => setTimeout(() => resolve(resultOfAsyncFnc), 100))
}

beforeEach(() => {
    cache = new Cache()
})

test('returns passed function if not cached', async () => {
    const key = 'someKey'
    expect(await cache.executeWithCache(key, asyncFnc)).toEqual(resultOfAsyncFnc)
})
