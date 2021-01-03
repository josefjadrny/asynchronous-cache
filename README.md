# Asynchronous in-memory cache
![GitHub package.json version](https://img.shields.io/github/package-json/v/josefjadrny/asynchronous-cache)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This library helps you with executing asynchronous functions only once.
When you are calling asynchronous function repeatedly, result from first call is returned.

This library does not have any dependencies.

## Install

**Install with npm**

```npm i asynchronous-cache --save```

**or install with yarn**

```yarn add asynchronous-cache```

## Usage

```js
import { Cache } from 'asynchronous-cache' // or CommonJS (nodeJs) -> const Cache = require('asynchronous-cache').Cache
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

### `cache.executeWithCache(key, functionToExecute, options = {})`
Returns a result for passed `key` from in-memory cache. If there is no record for this key, then `functionToExecute` is executed and result is returned and stored for next calls.

**Params**
- `key` string - Key is used as an identifier for same functions. Caching is based on this key, so same function should have same key.
- `functionToExecute` asynchronous function reference - Any asynchronous function reference (without the parentheses). This function will be executed and result will be cached for another calls.
- `options` (_optional_) object - Default is an empty object.
Possible options:
  - `TTL` - Record will be removed from cache after TTL milliseconds.

### `cache.delete(key)`
Delete key from the cache. Returns true if key was found and removed, otherwise false is returned.

**Params**
- `key` string - Key you want to remove from cache

### `cache.clear()`
Clears whole cache. All keys and records are deleted from memory.

## How it works

There is an example from [test](./tests/Cache.test.ts)
```js
import { Cache } from 'asynchronous-cache'
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
