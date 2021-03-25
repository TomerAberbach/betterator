/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { testProp, test, fc } from 'ava-fast-check'
import { AsyncBetterator, Betterator } from '../src/index.js'

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout))

const asAsync = iterable => ({
  async *[Symbol.asyncIterator]() {
    yield* iterable
  }
})

const iterableArb = fc.oneof(
  fc.array(fc.anything()),
  fc.tuple(fc.array(fc.anything()), fc.object()).map(([array, object]) => ({
    ...object,
    [Symbol.iterator]: () => array[Symbol.iterator]()
  }))
)

const asyncIterableArb = iterableArb.map(asAsync)

testProp(
  `Betterator iterates like a native iterator`,
  [iterableArb],
  (t, iterable) => {
    const iterator = Betterator.fromIterable(iterable)
    const nativeIterator = iterable[Symbol.iterator]()

    while (iterator.hasNext()) {
      const value = iterator.getNext()
      const result = nativeIterator.next()

      t.false(result.done)
      t.is(value, result.value)
    }

    t.false(iterator.hasNext())
    t.true(nativeIterator.next().done)
  }
)

testProp(
  `Betterator.getNext throws an error when the iterator has been exhausted`,
  [iterableArb],
  (t, iterable) => {
    const iterator = Betterator.fromIterable(iterable)

    while (iterator.hasNext()) {
      iterator.getNext()
    }

    t.throws(() => iterator.getNext(), {
      instanceOf: Error,
      message: `Doesn't have next`
    })
  }
)

testProp(
  `Betterator.getNextOr calls the given function for an exhausted iterator`,
  [iterableArb, fc.func(fc.anything())],
  (t, iterable, fn) => {
    const iterator = Betterator.fromIterable(iterable)
    while (iterator.hasNext()) {
      iterator.getNext()
    }

    for (let i = 0; i < 10; i++) {
      t.is(
        iterator.getNextOr(() => fn()),
        fn()
      )
    }
  }
)

testProp(
  `Betterator.getNextOr does not call the given function for a non-exhausted iterator`,
  [iterableArb],
  (t, iterable) => {
    const iterator = Betterator.fromIterable(iterable)

    while (iterator.hasNext()) {
      iterator.getNextOr(() => t.fail())
    }

    t.pass()
  }
)

test(`Betterator concrete example`, t => {
  const values = [1, 2, 3, 4]

  const iterator = Betterator.fromIterable(values)

  t.true(iterator.hasNext())
  t.is(iterator.getNext(), 1)

  t.true(iterator.hasNext())
  t.is(iterator.getNext(), 2)

  t.true(iterator.hasNext())
  t.is(iterator.getNext(), 3)

  t.true(iterator.hasNext())
  t.is(iterator.getNext(), 4)

  t.throws(() => iterator.getNext(), {
    instanceOf: Error,
    message: `Doesn't have next`
  })

  t.is(
    iterator.getNextOr(() => 42),
    42
  )
})

testProp(
  `AsyncBetterator iterates like a native async iterator`,
  [asyncIterableArb],
  async (t, iterable) => {
    const asyncIterator = AsyncBetterator.fromAsyncIterable(iterable)
    const nativeAsyncIterator = iterable[Symbol.asyncIterator]()

    while (await asyncIterator.hasNext()) {
      const value = await asyncIterator.getNext()
      const result = await nativeAsyncIterator.next()

      t.false(result.done)
      t.is(value, result.value)
    }

    t.false(await asyncIterator.hasNext())
    t.true((await nativeAsyncIterator.next()).done)
  }
)

testProp(
  `AsyncBetterator.getNext throws an error when the async iterator has been exhausted`,
  [asyncIterableArb],
  async (t, iterable) => {
    const asyncIterator = AsyncBetterator.fromAsyncIterable(iterable)

    while (await asyncIterator.hasNext()) {
      await asyncIterator.getNext()
    }

    await t.throwsAsync(() => asyncIterator.getNext(), {
      instanceOf: Error,
      message: `Doesn't have next`
    })
  }
)

testProp(
  `AsyncBetterator.getNextOr calls the given function for an exhausted async iterator`,
  [
    asyncIterableArb,
    fc
      .tuple(fc.func(fc.anything()), fc.boolean())
      .map(([fn, promise]) => (promise ? () => delay(1).then(() => fn()) : fn))
  ],
  async (t, asyncIterable, fn) => {
    const asyncIterator = AsyncBetterator.fromAsyncIterable(asyncIterable)
    while (await asyncIterator.hasNext()) {
      await asyncIterator.getNext()
    }

    for (let i = 0; i < 10; i++) {
      t.is(await asyncIterator.getNextOr(() => fn()), await fn())
    }
  }
)

testProp(
  `AsyncBetterator.getNextOr does not call the given function for a non-exhausted async iterator`,
  [asyncIterableArb],
  async (t, asyncIterable) => {
    const asyncIterator = AsyncBetterator.fromAsyncIterable(asyncIterable)

    while (await asyncIterator.hasNext()) {
      await asyncIterator.getNextOr(() => t.fail())
    }

    t.pass()
  }
)

test(`AsyncBetterator concrete example`, async t => {
  const values = [1, 2, 3, 4]

  const asyncIterator = AsyncBetterator.fromAsyncIterable(asAsync(values))

  t.true(await asyncIterator.hasNext())
  t.is(await asyncIterator.getNext(), 1)

  t.true(await asyncIterator.hasNext())
  t.is(await asyncIterator.getNext(), 2)

  t.true(await asyncIterator.hasNext())
  t.is(await asyncIterator.getNext(), 3)

  t.true(await asyncIterator.hasNext())
  t.is(await asyncIterator.getNext(), 4)

  await t.throwsAsync(() => asyncIterator.getNext(), {
    instanceOf: Error,
    message: `Doesn't have next`
  })

  t.is(await asyncIterator.getNextOr(() => delay(1).then(() => 42)), 42)
})
