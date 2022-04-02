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

import { expectTypeOf, fc, jest, testProp } from 'tomer'
import { AsyncBetterator, Betterator } from '../src/index.js'

jest.useFakeTimers()

const iterableArb = fc.oneof(
  fc.array(fc.anything()),
  fc.tuple(fc.array(fc.anything()), fc.object()).map(([array, object]) => ({
    ...object,
    [Symbol.iterator]: (): Iterator<unknown> => array[Symbol.iterator](),
  })),
)

const asyncIterableArb = iterableArb.map(asAsync)

testProp(
  `Betterator iterates like a native iterator`,
  [iterableArb],
  iterable => {
    const iterator = Betterator.fromIterable(iterable)
    const nativeIterator = iterable[Symbol.iterator]()

    while (iterator.hasNext()) {
      const value = iterator.getNext()
      const result = nativeIterator.next()

      expect(result.done).toBeFalse()
      expect(value).toBe(result.value)
    }

    expect(iterator.hasNext()).toBeFalse()
    expect(nativeIterator.next().done).toBeTrue()
  },
)

testProp(
  `Betterator.getNext throws an error when the iterator has been exhausted`,
  [iterableArb],
  iterable => {
    const iterator = Betterator.fromIterable(iterable)

    while (iterator.hasNext()) {
      iterator.getNext()
    }

    expect(() => iterator.getNext()).toThrowWithMessage(
      Error,
      `Doesn't have next`,
    )
  },
)

testProp(
  `Betterator.getNextOr calls the given function for an exhausted iterator`,
  [iterableArb, fc.func(fc.anything())],
  (iterable, fn) => {
    const iterator = Betterator.fromIterable(iterable)
    while (iterator.hasNext()) {
      iterator.getNext()
    }

    for (let i = 0; i < 10; i++) {
      expect(iterator.getNextOr(() => fn())).toBe(fn())
    }
  },
)

testProp(
  `Betterator.getNextOr does not call the given function for a non-exhausted iterator`,
  [iterableArb],
  iterable => {
    const iterator = Betterator.fromIterable(iterable)

    while (iterator.hasNext()) {
      iterator.getNextOr(
        () => expect.fail(`Expected or function to not be called`) as unknown,
      )
    }
  },
)

test(`Betterator concrete example`, () => {
  const values = [1, 2, 3, 4]

  const iterator = Betterator.fromIterable(values)

  expectTypeOf(iterator).toEqualTypeOf<Betterator<number>>()
  expectTypeOf(iterator.hasNext()).toEqualTypeOf<boolean>()

  expect(iterator.hasNext()).toBeTrue()
  const value = iterator.getNext()
  expectTypeOf(value).toEqualTypeOf<number>()
  expect(value).toBe(1)

  expect(iterator.hasNext()).toBeTrue()
  expect(iterator.getNext()).toBe(2)

  expect(iterator.hasNext()).toBeTrue()
  expect(iterator.getNext()).toBe(3)

  expect(iterator.hasNext()).toBeTrue()
  expect(iterator.getNext()).toBe(4)

  expect(() => iterator.getNext()).toThrowWithMessage(
    Error,
    `Doesn't have next`,
  )
  expect(iterator.getNextOr(() => 42)).toBe(42)
})

testProp(
  `AsyncBetterator iterates like a native async iterator`,
  [asyncIterableArb],
  withAutoAdvancingTimers(async asyncIterable => {
    const asyncIterator = AsyncBetterator.fromAsyncIterable(asyncIterable)
    const nativeAsyncIterator = asyncIterable[Symbol.asyncIterator]()

    while (await asyncIterator.hasNext()) {
      const value = await asyncIterator.getNext()
      const result = await nativeAsyncIterator.next()

      expect(result.done).toBeFalse()
      expect(value).toBe(result.value)
    }

    expect(await asyncIterator.hasNext()).toBeFalse()
    expect((await nativeAsyncIterator.next()).done).toBeTrue()
  }),
)

testProp(
  `AsyncBetterator.getNext throws an error when the async iterator has been exhausted`,
  [asyncIterableArb],
  withAutoAdvancingTimers(async asyncIterable => {
    const asyncIterator = AsyncBetterator.fromAsyncIterable(asyncIterable)

    while (await asyncIterator.hasNext()) {
      await asyncIterator.getNext()
    }

    await expect(() => asyncIterator.getNext()).rejects.toThrowWithMessage(
      Error,
      `Doesn't have next`,
    )
  }),
)

testProp(
  `AsyncBetterator.getNextOr calls the given function for an exhausted async iterator`,
  [
    asyncIterableArb,
    fc
      .tuple(fc.func(fc.anything()), fc.boolean())
      .map(([fn, promise]): (() => unknown) =>
        promise ? (): Promise<unknown> => delay(1).then(() => fn()) : fn,
      ),
  ],
  withAutoAdvancingTimers(async (asyncIterable, fn) => {
    const asyncIterator = AsyncBetterator.fromAsyncIterable(asyncIterable)
    while (await asyncIterator.hasNext()) {
      await asyncIterator.getNext()
    }

    for (let i = 0; i < 10; i++) {
      expect(await asyncIterator.getNextOr(fn)).toBe(await fn())
    }
  }),
)

testProp(
  `AsyncBetterator.getNextOr does not call the given function for a non-exhausted async iterator`,
  [asyncIterableArb],
  withAutoAdvancingTimers(async asyncIterable => {
    const asyncIterator = AsyncBetterator.fromAsyncIterable(asyncIterable)

    while (await asyncIterator.hasNext()) {
      await asyncIterator.getNextOr(
        () => expect.fail(`Expected or function to not be called`) as unknown,
      )
    }
  }),
)

test(
  `AsyncBetterator concrete example`,
  withAutoAdvancingTimers(async () => {
    const values = [1, 2, 3, 4]

    const asyncIterator = AsyncBetterator.fromAsyncIterable(asAsync(values))

    expectTypeOf(asyncIterator).toEqualTypeOf<AsyncBetterator<number>>()
    expectTypeOf(asyncIterator.hasNext()).toEqualTypeOf<Promise<boolean>>()

    expect(await asyncIterator.hasNext()).toBeTrue()
    const value = await asyncIterator.getNext()
    expectTypeOf(value).toEqualTypeOf<number>()
    expect(value).toBe(1)

    expect(await asyncIterator.hasNext()).toBeTrue()
    expect(await asyncIterator.getNext()).toBe(2)

    expect(await asyncIterator.hasNext()).toBeTrue()
    expect(await asyncIterator.getNext()).toBe(3)

    expect(await asyncIterator.hasNext()).toBeTrue()
    expect(await asyncIterator.getNext()).toBe(4)

    await expect(() => asyncIterator.getNext()).rejects.toThrowWithMessage(
      Error,
      `Doesn't have next`,
    )
    expect(await asyncIterator.getNextOr(() => delay(1).then(() => 42))).toBe(
      42,
    )
  }),
)

function withAutoAdvancingTimers<Args extends unknown[]>(
  fn: (...args: Args) => Promise<void>,
): (...args: Args) => Promise<void> {
  return async (...args) => {
    let done = false
    const promise = fn(...args)
    promise.then(
      () => (done = true),
      () => (done = true),
    )

    // eslint-disable-next-line no-unmodified-loop-condition, @typescript-eslint/no-unnecessary-condition
    while (!done) {
      jest.runAllTimers()
      await Promise.resolve()
    }

    return promise
  }
}

function delay(timeout: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

function asAsync<Value>(iterable: Iterable<Value>): AsyncIterable<Value> {
  return {
    // eslint-disable-next-line  @typescript-eslint/require-await
    async *[Symbol.asyncIterator](): AsyncIterator<Value> {
      yield* iterable
    },
  }
}
