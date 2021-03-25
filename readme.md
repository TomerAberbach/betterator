<h1 align="center">
  betterator
</h1>

<div align="center">
  <a href="https://npmjs.org/package/betterator">
    <img src="https://badgen.now.sh/npm/v/betterator" alt="version" />
  </a>
  <a href="https://github.com/TomerAberbach/betterator/actions">
    <img src="https://github.com/TomerAberbach/betterator/workflows/CI/badge.svg" alt="CI" />
  </a>
  <a href="https://bundlephobia.com/result?p=betterator">
    <img src="https://badgen.net/bundlephobia/minzip/betterator" alt="minzip size" />
  </a>
</div>

<div align="center">
  A better sync and async iterator API.
</div>

## Features

- **Intuitive:** easy to use `hasNext` and `getNext` methods
- **Familiar:** lots of other programming language use the same API
- **Tiny:** less than 350 bytes minzipped
- **Awesome Name:** you have to admit it's pretty rad :sunglasses:

## Install

```sh
$ npm i betterator
```

## Usage

```js
import { Betterator, AsyncBetterator } from 'betterator'

const slothActivities = [`sleeping`, `eating`, `climbing`]

// Or `new Betterator(slothActivities[Symbol.iterator]())`
const iterator = Betterator.fromIterable(slothActivities)

while (iterator.hasNext()) {
  console.log(iterator.getNext())
}
//=> sleeping
//=> eating
//=> climbing

try {
  iterator.getNext()
} catch (e) {
  console.log(e.message)
}
//=> Doesn't have next

console.log(iterator.getNextOr(() => `being lazy`))
//=> being lazy

const asyncSlothActivities = (async function* () {
  yield* slothActivities
})()

// Or `new AsyncBetterator(slothActivities[Symbol.asyncIterator]())`
const asyncIterator = AsyncBetterator.fromAsyncIterable(asyncSlothActivities)

while (await asyncIterator.hasNext()) {
  console.log(await asyncIterator.getNext())
}
//=> sleeping
//=> eating
//=> climbing

try {
  await asyncIterator.getNext()
} catch (e) {
  console.log(e.message)
}
//=> Doesn't have next

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout))
console.log(
  await asyncIterator.getNextOr(() => delay(10).then(() => `being lazy`))
)
//=> being lazy
```

See the
[type definitions](https://github.com/TomerAberbach/betterator/blob/main/src/index.d.ts)
for more documentation.

## Contributing

Stars are always welcome!

For bugs and feature requests,
[please create an issue](https://github.com/TomerAberbach/betterator/issues/new).

For pull requests, please read the
[contributing guidelines](https://github.com/TomerAberbach/betterator/blob/master/contributing.md).

## License

[Apache 2.0](https://github.com/TomerAberbach/betterator/blob/master/license)

This is not an official Google product.
