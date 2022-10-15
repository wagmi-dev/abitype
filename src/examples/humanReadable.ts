import { expectType } from '../../test'
import { AbiStateMutability } from '../abi'
import { AbiParametersToPrimitiveTypes } from '../utils'

// Exploring adding support for human-readable ABIs
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const abi = [
  // https://docs.ethers.io/v5/api/utils/abi/formats/#abi-formats--object
  'constructor(string symbol, string name)',
  'function transferFrom(address from, address to, uint value)',
  'function balanceOf(address owner) view returns (uint balance)',
  'event Transfer(address indexed from, address indexed to, address value)',
  'event ApprovalForAll(address indexed owner, address indexed operator, boolean approved)',
  'error InsufficientBalance(account owner, uint balance)',

  // https://github.com/gakonst/ethers-rs/blob/master/ethers-core/src/abi/human_readable/mod.rs#L700-L720
  'function foo(uint256[] memory x) external view returns (address)',
  'function bar(uint256[] memory x) returns(address)',
  'function bar(uint256[] memory x, uint32 y) returns (address, uint256)',
  'function foo(address[] memory, bytes memory) returns (bytes memory)',
  'function bar(uint256[] memory x)',
  'function bar()',
  'bar(uint256[] memory x)(address)',
  'bar(uint256[] memory x, uint32 y)(address, uint256)',
  'foo(address[] memory, bytes memory)(bytes memory)',
  'bar(uint256[] memory x)()',
  'bar()()',
  'bar(uint256)',
  'bar()',
] as const

type Args = AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<typeof abi, 'transferFrom'>['inputs']
>
expectType<Args>(['0x123', '0x456', 100])

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

type TrimLeft<T, Chars extends string = ' '> = T extends `${Chars}${infer R}`
  ? TrimLeft<R>
  : T
type TrimRight<T, Chars extends string = ' '> = T extends `${infer R}${Chars}`
  ? TrimRight<R>
  : T
export type Trim<T, Chars extends string = ' '> = TrimLeft<
  TrimRight<T, Chars>,
  Chars
>
expectType<Trim<'  foo'>>('foo')
expectType<Trim<'foo  '>>('foo')
expectType<Trim<'  foo  '>>('foo')

export type Split<
  T extends string,
  Separator extends string,
> = Separator extends ''
  ? T extends `${infer F}${infer R}`
    ? [F, ...Split<R, Separator>]
    : []
  : Separator extends T
  ? T[]
  : T extends `${infer F}${Separator}${infer R}`
  ? [F, ...Split<R, Separator>]
  : [T]
expectType<Split<'foo,bar,baz', ','>>(['foo', 'bar', 'baz'])
expectType<Split<'foo, bar, baz', ', '>>(['foo', 'bar', 'baz'])

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type AbiError = `error ${string}(${string})`
export type AbiEvent = `event ${string}(${string})`
export type AbiFunction = `${'function ' | ''}${string}(${string})${string}`
export type AbiConstructor = `constructor(${string})`
export type Abi = readonly (
  | AbiError
  | AbiEvent
  | AbiFunction
  | AbiConstructor
)[]

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type ExtractAbiFunctionName<TAbiFunction extends AbiFunction> =
  TAbiFunction extends `${'function '}${infer TFunctionName extends string}(${string}`
    ? Trim<TFunctionName>
    : TAbiFunction extends `${infer TFunctionName extends string}(${string}`
    ? Trim<TFunctionName> extends infer TFunctionName_
      ? // Remove non-functions that slipped through
        TFunctionName_ extends `${'constructor' | 'error' | 'event'}${string}`
        ? never
        : TFunctionName_
      : never
    : never
expectType<ExtractAbiFunctionName<'foo()'>>('foo')
expectType<ExtractAbiFunctionName<'function bar()'>>('bar')

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type ExtractAbiEventName<TAbiEvent extends AbiEvent> =
  TAbiEvent extends `${'event '}${infer TEventName extends string}(${string}`
    ? Trim<TEventName>
    : never
expectType<
  ExtractAbiEventName<'event Transfer(address indexed from, address indexed to, address value)'>
>('Transfer')

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type ExtractAbiStateMutability<TAbiFunction extends AbiFunction> =
  TAbiFunction extends `${string})${infer TReturn}`
    ? Extract<
        Split<TReturn, ' '>[number],
        AbiStateMutability
      > extends infer TAbiStateMutability
      ? [TAbiStateMutability] extends [never]
        ? 'nonpayable'
        : TAbiStateMutability
      : never
    : never
expectType<ExtractAbiStateMutability<'function foo()'>>('nonpayable')
expectType<
  ExtractAbiStateMutability<'function    foo   (uint256[]     memory x) external view returns (address)'>
>('view')

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

type ExtractAbiFunctionNames<
  TAbi extends Abi,
  TAbiStateMutibility extends AbiStateMutability = AbiStateMutability,
> = Extract<
  {
    [TKey in keyof TAbi]: TAbi[TKey] extends infer TAbiFunction extends AbiFunction
      ? {
          name: ExtractAbiFunctionName<TAbiFunction>
          stateMutability: ExtractAbiStateMutability<TAbiFunction>
        }
      : never
  }[number],
  { stateMutability: TAbiStateMutibility }
>['name']
expectType<ExtractAbiFunctionNames<typeof abi>>('balanceOf')
expectType<ExtractAbiFunctionNames<typeof abi, 'view'>>('balanceOf')
expectType<ExtractAbiFunctionNames<typeof abi, 'nonpayable'>>('transferFrom')

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

type ExtractAbiEventNames<TAbi extends Abi> = {
  [TKey in keyof TAbi]: TAbi[TKey] extends infer TAbiEvent extends AbiEvent
    ? ExtractAbiEventName<TAbiEvent>
    : never
}[number]
expectType<ExtractAbiEventNames<typeof abi>>('Transfer')

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// TODO: Support structs: `(string foo, uint16 bar)`
type AbiParameterType = 'inputs' | 'outputs'
export type ExtractAbiParameters<
  TAbiFunction extends AbiFunction,
  TAbiParameterType extends AbiParameterType,
> = ToParamString<TAbiFunction, TAbiParameterType> extends infer ParamString
  ? ParamString extends infer ParamString_ extends string
    ? ParamString_ extends ''
      ? []
      : Split<ParamString_, ','> extends infer TParameters extends string[]
      ? {
          [K in keyof TParameters]: ToAbiParameter<Trim<TParameters[K]>>
        }
      : never
    : never
  : never
type ToParamString<
  TAbiFunction extends AbiFunction,
  TAbiParameterType extends AbiParameterType,
> =
  | (TAbiParameterType extends 'inputs'
      ? TAbiFunction extends `${string}(${infer ParamString})${string}`
        ? Trim<ParamString>
        : never
      : never)
  | (TAbiParameterType extends 'outputs'
      ? TAbiFunction extends `${string}(${string})${string}(${infer ParamString}`
        ? ParamString extends `${infer ParamString_})`
          ? Trim<ParamString_>
          : never
        : ''
      : never)
expectType<
  ExtractAbiParameters<'function foo(address[] memory, bytes memory)', 'inputs'>
>([
  { type: 'address[]', name: '' },
  { type: 'bytes', name: '' },
])
expectType<
  ExtractAbiParameters<
    'function foo(address[] memory, bytes memory)(bytes memory)',
    'outputs'
  >
>([{ type: 'bytes', name: '' }])

type Modifier = 'calldata' | 'indexed' | 'memory' | 'storage'
type ToAbiParameter<T extends string> = Trim<T> extends infer T_
  ? T_ extends `${infer TAbiType extends string} ${infer TModifier extends Modifier} ${infer TName extends string}`
    ? {
        type: TrimRight<TAbiType>
        name: TName
      } & (TModifier extends 'indexed' ? { indexed: true } : unknown)
    : T_ extends `${infer TAbiType extends string} ${infer TName extends string}`
    ? Trim<TName> extends infer TName_
      ? {
          type: TAbiType
          name: TName_ extends Modifier ? '' : TName_
        } & (TName_ extends 'indexed' ? { indexed: true } : unknown)
      : never
    : { type: Trim<T_>; name: '' }
  : never

expectType<ToAbiParameter<'address memory addr'>>({
  type: 'address',
  name: 'addr',
})
expectType<ToAbiParameter<'address indexed addr'>>({
  type: 'address',
  name: 'addr',
  indexed: true,
})
expectType<ToAbiParameter<'address addr'>>({
  type: 'address',
  name: 'addr',
})
expectType<ToAbiParameter<'address   indexed'>>({
  type: 'address',
  name: '',
  indexed: true,
})
expectType<ToAbiParameter<'address     memory'>>({
  type: 'address',
  name: '',
})
expectType<ToAbiParameter<'address'>>({ type: 'address', name: '' })

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type ExtractAbiFunctions<
  TAbi extends Abi,
  TAbiStateMutibility extends AbiStateMutability = AbiStateMutability,
> = Extract<
  {
    [K in keyof TAbi]: TAbi[K] extends infer TAbiFunction extends AbiFunction
      ? ExtractAbiFunctionName<TAbiFunction> extends infer TFunctionName
        ? [TFunctionName] extends [never]
          ? never
          : {
              type: 'function'
              name: TFunctionName
              stateMutability: ExtractAbiStateMutability<TAbiFunction>
              inputs: ExtractAbiParameters<TAbiFunction, 'inputs'>
              outputs: ExtractAbiParameters<TAbiFunction, 'outputs'>
            }
        : never
      : never
  }[number],
  { stateMutability: TAbiStateMutibility }
>

expectType<ExtractAbiFunctions<typeof abi>>({
  type: 'function',
  name: 'balanceOf',
  stateMutability: 'view',
  inputs: [
    {
      type: 'address',
      name: 'owner',
    },
  ],
  outputs: [
    {
      type: 'uint',
      name: 'balance',
    },
  ],
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type ExtractAbiFunction<
  TAbi extends Abi,
  TFunctionName extends ExtractAbiFunctionNames<TAbi>,
> = Extract<ExtractAbiFunctions<TAbi>, { name: TFunctionName }>

expectType<ExtractAbiFunction<typeof abi, 'transferFrom'>>({
  type: 'function',
  name: 'transferFrom',
  stateMutability: 'nonpayable',
  inputs: [
    {
      type: 'address',
      name: 'from',
    },
    {
      type: 'address',
      name: 'to',
    },
    {
      type: 'uint',
      name: 'value',
    },
  ],
  outputs: [],
})
expectType<ExtractAbiFunction<typeof abi, 'balanceOf'>>({
  type: 'function',
  name: 'balanceOf',
  stateMutability: 'view',
  inputs: [
    {
      type: 'address',
      name: 'owner',
    },
  ],
  outputs: [
    {
      type: 'uint',
      name: 'balance',
    },
  ],
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type ExtractAbiEvents<TAbi extends Abi> = {
  [K in keyof TAbi]: TAbi[K] extends infer TAbiEvent extends AbiEvent
    ? ToAbiEvent<TAbiEvent>
    : never
}[number]
type ToAbiEvent<TAbiEvent extends AbiEvent> = {
  type: 'event'
  name: ExtractAbiEventName<TAbiEvent>
  inputs: ExtractAbiParameters<TAbiEvent, 'inputs'>
}

expectType<ExtractAbiEvents<typeof abi>>({
  type: 'event',
  name: 'Transfer',
  inputs: [
    {
      type: 'address',
      name: 'from',
      indexed: true,
    },
    {
      type: 'address',
      name: 'to',
      indexed: true,
    },
    {
      type: 'address',
      name: 'value',
    },
  ],
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type ExtractAbiEvent<
  TAbi extends Abi,
  TEventName extends ExtractAbiEventNames<TAbi>,
> = Extract<ExtractAbiEvents<TAbi>, { name: TEventName }>

expectType<ExtractAbiEvent<typeof abi, 'Transfer'>>({
  type: 'event',
  name: 'Transfer',
  inputs: [
    {
      type: 'address',
      name: 'from',
      indexed: true,
    },
    {
      type: 'address',
      name: 'to',
      indexed: true,
    },
    {
      type: 'address',
      name: 'value',
    },
  ],
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
