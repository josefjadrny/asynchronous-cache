# Asynchronous in-memory cache

This library helps you with executing asynchronous functions only once.
When you are calling asynchronous function repeatedly, result from first call is returned.

## Install

**Install with npm**

```npm i asynchronous-cache --save```

**or install with yarn**

```yarn add asynchronous-cache```

## Import

This library is compiled as UMD (Universal Module Definition) and could be used as module or as a global.

With require (nodeJs)

```js
const Cache = require('asynchronous-cache')
const cache = new Cache()
```

With import (ES6, React,...)

```js
import { Cache } from 'asynchronous-cache'
const cache = new Cache()
```

## API

`cache.executeWithCache(key, functionToExecute)` - Returns a result for passed key from in-memory cache. If there is no record for this key, then function is executed and result is stored for next calls.

**Params**
- `key` string - Key is used as an identifier for same functions. Caching is based on this key, so same function should have same key.
- `functionToExecute` asynchronous function reference - Any asynchronous function reference (without the parentheses). This function will be executed and result will be cached for another calls.

## Full Example

```js
const Cache = require('asynchronous-cache')
const cache = new Cache()

const functionToExecute = async () => { return 'done' }
await cache.executeWithCache('someKey', functionToExecute)
```

## How it works

There is an example from [test](./tests/Cache.test.ts)
```js
const Cache = require('asynchronous-cache')
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
    // result from first call is cached and returned for next calls
    expect(result).toEqual([resultOfAsyncMock, resultOfAsyncMock, resultOfAsyncMock])
})
```
