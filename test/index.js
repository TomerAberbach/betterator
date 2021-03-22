import { fc, testProp } from 'ava-fast-check'
import test from 'ava'
import betterator from '../src/index.js'

test(`betterator works`, t => {
  t.is(betterator(), `Hello World!`)
})

testProp(
  `betterator really works`,
  [fc.anything()],
  (t, value) => {
    t.is(betterator(value), `Hello World!`)
  }
)
