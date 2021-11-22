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

/**
 * A wrapper around the native iterator that provides a better API.
 *
 * @example
 * ```js
 * const slothActivities = [`sleeping`, `eating`, `climbing`]
 *
 * const iterator = Betterator.fromIterable(slothActivities)
 * while (iterator.hasNext()) {
 *   console.log(iterator.getNext())
 * }
 * //=> sleeping
 * //=> eating
 * //=> climbing
 * ```
 */
export class Betterator<Value> {
  /** Constructs an {@link Betterator} from `iterator`. */
  constructor(iterator: Iterator<Value>)

  /**
   * Returns `true` if the underlying native iterator of this {@link Betterator}
   * has been exhausted. Otherwise, returns `false`.
   *
   * This method may call the underlying native iterator's `next` method.
   */
  hasNext(): boolean

  /**
   * Returns the next element of the underlying native iterator.
   *
   * @throws if the underlying native iterator does not have a next element.
   */
  getNext(): Value

  /**
   * Returns the next element of the underlying native iterator if it has a next
   * element. Otherwise, it returns the result of calling `or`.
   *
   * @example
   * ```js
   * const slothActivities = [`sleeping`, `eating`, `climbing`]
   *
   * const iterator = Betterator.fromIterable(slothActivities)
   * for (let i = 0; i < 5; i++) {
   *   console.log(iterator.getNextOr(() => `No ${i + 1}th element!`))
   * }
   * //=> sleeping
   * //=> eating
   * //=> climbing
   * //=> No 4th element!
   * //=> No 5th element!
   * ```
   */
  getNextOr<Default>(or: () => Default): Value | Default

  /**
   * Returns an {@link Betterator} constructed from the iterator returned by
   * `iterable`'s `Symbol.iterator` method.
   */
  static fromIterable<Value>(iterable: Iterable<Value>): Betterator<Value>
}

/**
 * A wrapper around the native async iterator that provides a more ergonomic
 * API.
 *
 * @example
 * ```js
 * const slothActivities = (async function*() {
 *   yield* [`sleeping`, `eating`, `climbing`]
 * })()
 *
 * const asyncIterator = AsyncBetterator.fromAsyncIterable(slothActivities)
 * while (await asyncIterator.hasNext()) {
 *   console.log(await asyncIterator.getNext())
 * }
 * //=> sleeping
 * //=> eating
 * //=> climbing
 * ```
 */
export class AsyncBetterator<Value> {
  /** Constructs an {@link AsyncBetterator} from `asyncIterator`. */
  constructor(asyncIterator: AsyncIterator<Value>)

  /**
   * Returns a promise that resolves to `true` if the underlying native async
   * iterator of this {@link AsyncBetterator} has been exhausted. Otherwise,
   * returns a promise that resolves to `false`.
   *
   * This method may call the underlying native async iterator's `next` method.
   */
  hasNext(): Promise<boolean>

  /**
   * Returns a promise that resolves to the next element of the underlying
   * native async iterator.
   *
   * @throws if the underlying native async iterator does not have a next
   *   element.
   */
  getNext(): Promise<Value>

  /**
   * Returns a promise that resolves to the next element of the underlying
   * native async iterator if it has a next element. Otherwise, it returns the
   * result of calling `or` as a promise.
   *
   * @example
   * ```js
   * const slothActivities = (async function*() {
   *   yield* [`sleeping`, `eating`, `climbing`]
   * })()
   *
   * const asyncIterator = AsyncBetterator.fromAsyncIterable(slothActivities)
   * for (let i = 0; i < 5; i++) {
   *   console.log(
   *     await asyncIterator.getNextOr(() => `No ${i + 1}th element!`)
   *   )
   * }
   * //=> sleeping
   * //=> eating
   * //=> climbing
   * //=> No 4th element!
   * //=> No 5th element!
   * ```
   */
  getNextOr<Default>(
    or: () => Default | PromiseLike<Default>,
  ): Promise<Value | Default>

  /**
   * Returns an {@link AsyncBetterator} constructed from the async
   * iterator returned by `asyncIterable`'s `Symbol.asyncIterator` method.
   */
  static fromAsyncIterable<Value>(
    asyncIterable: AsyncIterable<Value>,
  ): AsyncBetterator<Value>
}
