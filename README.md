# Asynchronous in-memory cache

This library helps you with executing asynchronous functions only once.
When you are calling asynchronous function repeatedly, result from first call is returned.

## Install

**Install with npm**

```npm i asynchronous-cache --save```

**or install with yarn**

```yarn add asynchronous-cache```

## Usage

```js
import Cache from 'asynchronous-cache'
// or CommonJS (nodeJs) -> const Cache = require('asynchronous-cache').default
const cache = new Cache()

let executedCounter = 0
const functionToExecute = async () => { return ++executedCounter }

Promise.all([
    cache.executeWithCache('someKey', functionToExecute),
    cache.executeWithCache('someKey', functionToExecute),
]).then(result => {
    console.log(result) // [ 1, 1 ] -> function is executed only once
})
```

## API

`cache.executeWithCache(key, functionToExecute)` - Returns a result for passed key from in-memory cache. If there is no record for this key, then function is executed and result is stored for next calls.

**Params**
- `key` string - Key is used as an identifier for same functions. Caching is based on this key, so same function should have same key.
- `functionToExecute` asynchronous function reference - Any asynchronous function reference (without the parentheses). This function will be executed and result will be cached for another calls.

## How it works

There is an example from [test](./tests/Cache.test.ts)
```js
import Cache from 'asynchronous-cache'
const cache = new Cache()

const resultOfAsyncMock = 'ok'
// asyncMock is a reference for function returning a promise
const asyncMock = jest.fn(() => {
    return new Promise(resolve => setTimeout(() => resolve(resultOfAsyncMock), 50))
})

test('async function should be executed only once in async calls', async () => {
    const promiseAll = Promise.all([
        cache.executeWithCache(key, asyncMock),
        cache.executeWithCache(key, asyncMock),
        cache.executeWithCache(key, asyncMock),
    ])
    const result = await promiseAll
    // asyncMock is called only once
    expect(asyncMock.mock.calls.length).toBe(1)
    // result from first call is cached and reused for next calls
    expect(result).toEqual([resultOfAsyncMock, resultOfAsyncMock, resultOfAsyncMock])
})
```
