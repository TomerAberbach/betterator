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

export class Betterator {
  constructor(iterator) {
    this.iterator = iterator
    this.result = null
  }

  hasNext() {
    return (this.result || (this.result = this.iterator.next())).done !== true
  }

  getNext() {
    if (!this.hasNext()) {
      throw new Error(`Doesn't have next`)
    }

    const { value } = this.result
    this.result = null
    return value
  }

  static fromIterable(iterable) {
    return new Betterator(iterable[Symbol.iterator]())
  }
}

export class AsyncBetterator {
  constructor(asyncIterator) {
    this.asyncIterator = asyncIterator
    this.resultPromise = null
  }

  async hasNext() {
    return (
      (
        await (this.resultPromise ||
          (this.resultPromise = this.asyncIterator.next()))
      ).done !== true
    )
  }

  async getNext() {
    if (!(await this.hasNext())) {
      throw new Error(`Doesn't have next`)
    }

    const { value } = await this.resultPromise
    this.resultPromise = null
    return value
  }

  static fromAsyncIterable(asyncIterable) {
    return new AsyncBetterator(asyncIterable[Symbol.asyncIterator]())
  }
}
