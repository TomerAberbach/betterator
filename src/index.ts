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

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

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
  /** @internal */
  private readonly _iterator: Iterator<Value>

  /** @internal */
  private _result: IteratorResult<Value, Value> | undefined

  /** Constructs an {@link Betterator} from `iterator`. */
  public constructor(iterator: Iterator<Value>) {
    this._iterator = iterator
  }

  /**
   * Returns `true` if the underlying native iterator of this {@link Betterator}
   * has been exhausted. Otherwise, returns `false`.
   *
   * This method may call the underlying native iterator's `next` method.
   */
  public hasNext(): boolean {
    return (
      (this._result || (this._result = this._iterator.next())).done !== true
    )
  }

  /**
   * Returns the next element of the underlying native iterator.
   *
   * @throws if the underlying native iterator does not have a next element.
   */
  public getNext(): Value {
    return this.getNextOr(throwNoNext)
  }

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
  public getNextOr<Default>(or: () => Default): Value | Default {
    if (!this.hasNext()) {
      return or()
    }

    const { value } = this._result!
    this._result = undefined
    return value
  }

  /**
   * Returns an {@link Betterator} constructed from the iterator returned by
   * `iterable`'s `Symbol.iterator` method.
   */
  public static fromIterable<Value>(
    iterable: Iterable<Value>,
  ): Betterator<Value> {
    return new Betterator(iterable[Symbol.iterator]())
  }
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
  /** @internal */
  private readonly _asyncIterator: AsyncIterator<Value>

  /** @internal */
  private _resultPromise: Promise<IteratorResult<Value, Value>> | undefined

  /** Constructs an {@link AsyncBetterator} from `asyncIterator`. */
  public constructor(asyncIterator: AsyncIterator<Value>) {
    this._asyncIterator = asyncIterator
  }

  /**
   * Returns a promise that resolves to `true` if the underlying native async
   * iterator of this {@link AsyncBetterator} has been exhausted. Otherwise,
   * returns a promise that resolves to `false`.
   *
   * This method may call the underlying native async iterator's `next` method.
   */
  public async hasNext(): Promise<boolean> {
    return (
      (
        await (this._resultPromise ||
          (this._resultPromise = this._asyncIterator.next()))
      ).done !== true
    )
  }

  /**
   * Returns a promise that resolves to the next element of the underlying
   * native async iterator.
   *
   * @throws if the underlying native async iterator does not have a next
   *   element.
   */
  public getNext(): Promise<Value> {
    return this.getNextOr(throwNoNext)
  }

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
  public async getNextOr<Default>(
    or: () => Default | PromiseLike<Default>,
  ): Promise<Value | Default> {
    if (!(await this.hasNext())) {
      return or()
    }

    const { value } = (await this._resultPromise)!
    this._resultPromise = undefined
    return value
  }

  /**
   * Returns an {@link AsyncBetterator} constructed from the async
   * iterator returned by `asyncIterable`'s `Symbol.asyncIterator` method.
   */
  public static fromAsyncIterable<Value>(
    asyncIterable: AsyncIterable<Value>,
  ): AsyncBetterator<Value> {
    return new AsyncBetterator(asyncIterable[Symbol.asyncIterator]())
  }
}

function throwNoNext(): never {
  throw new Error(`Doesn't have next`)
}
