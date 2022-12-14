import { assertType, test } from 'vitest'

import type { IsUnknown, Merge, Range, Tuple } from './types'

test('IsUnknown', () => {
  assertType<IsUnknown<unknown>>(true)
  assertType<IsUnknown<number | bigint>>(false)
})

test('Merge', () => {
  assertType<Merge<{ foo: number }, { bar: string }>>({ foo: 123, bar: 'abc' })
  assertType<Merge<{ foo: number }, { foo: string; bar: string }>>({
    foo: 'xyz',
    bar: 'abc',
  })
})

test('Range', () => {
  assertType<Range<0, 2>>([0, 1, 2])
  assertType<Range<10, 12>>([10, 11, 12])
  assertType<Range<1, 10>>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  assertType<Range<1, 1>>([1])
  assertType<Range<1, 0>>([])
  // @ts-expect-error Only positive ranges work
  assertType<Range<-2, 0>>([-2, -1, 0])
})

test('Tuple', () => {
  assertType<Tuple<string, 2>>(['foo', 'bar'])
  assertType<Tuple<string | number, 2>>(['foo', 1])
})
