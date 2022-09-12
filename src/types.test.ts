import { expectType, test } from '../test'
import { IsUnknown, Merge, Range, Tuple } from './types'

test('IsUnknown', () => {
  expectType<IsUnknown<unknown>>(true)
  expectType<IsUnknown<number | bigint>>(false)
})

test('Merge', () => {
  expectType<Merge<{ foo: number }, { bar: string }>>({ foo: 123, bar: 'abc' })
  expectType<Merge<{ foo: number }, { foo: string; bar: string }>>({
    foo: 'xyz',
    bar: 'abc',
  })
})

test('Range', () => {
  expectType<Range<0, 2>>([0, 1, 2])
  expectType<Range<10, 12>>([10, 11, 12])
  expectType<Range<1, 10>>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  expectType<Range<1, 1>>([1])
  expectType<Range<1, 0>>([])
  // @ts-expect-error Only positive ranges work
  expectType<Range<-2, 0>>([-2, -1, 0])
})

test('Tuple', () => {
  expectType<Tuple<string, 2>>(['foo', 'bar'])
  expectType<Tuple<string | number, 2>>(['foo', 1])
})
