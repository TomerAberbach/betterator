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

import { expectType } from 'tsd'
import { AsyncBetterator, Betterator } from '../src'

expectType<Betterator<string>>(new Betterator(['a'][Symbol.iterator]()))

const iterator = Betterator.fromIterable([1, 2, 3])
expectType<Betterator<number>>(iterator)
expectType<boolean>(iterator.hasNext())
expectType<number>(iterator.getNext())
expectType<number>(iterator.getNextOr(() => 5))
expectType<number | string>(iterator.getNextOr(() => `Hello World!`))
expectType<number | never>(
  iterator.getNextOr(() => {
    throw new Error(`Oops`)
  }),
)

const asyncIterable = (async function* () {
  yield* [1, 2, 3]
})()
expectType<AsyncBetterator<number>>(new AsyncBetterator(asyncIterable))

const asyncIterator = AsyncBetterator.fromAsyncIterable(asyncIterable)
expectType<AsyncBetterator<number>>(asyncIterator)
expectType<Promise<boolean>>(asyncIterator.hasNext())
expectType<Promise<number>>(asyncIterator.getNext())
expectType<Promise<number>>(asyncIterator.getNextOr(() => 5))
expectType<Promise<number>>(asyncIterator.getNextOr(() => Promise.resolve(5)))
expectType<Promise<number | string>>(
  asyncIterator.getNextOr(() => `Hello World!`),
)
expectType<Promise<number | string>>(
  asyncIterator.getNextOr(() => Promise.resolve(`Hello World!`)),
)
expectType<Promise<number | never>>(
  asyncIterator.getNextOr(() =>
    Promise.resolve().then(() => {
      throw new Error(`Oops`)
    }),
  ),
)
