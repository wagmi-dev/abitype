import {
  address,
  ensRegistryWithFallbackAbi,
  expectType,
  nestedTupleArrayAbi,
  nounsAuctionHouseAbi,
  test,
  wagmiMintExampleAbi,
  writingEditionsFactoryAbi,
} from '../test'
import { Abi } from './abi'
import {
  AbiEventSignature,
  AbiFunctionSignature,
  AbiParameterToPrimitiveType,
  AbiParametersToPrimitiveTypes,
  AbiTypeToPrimitiveType,
  ExtractAbiError,
  ExtractAbiErrorNames,
  ExtractAbiErrors,
  ExtractAbiEvent,
  ExtractAbiEventNames,
  ExtractAbiEvents,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
  ExtractAbiFunctions,
  IsAbi,
} from './utils'

test('AbiTypeToPrimitiveType', () => {
  test('address', () => {
    expectType<AbiTypeToPrimitiveType<'address'>>(address)
  })

  test('bool', () => {
    expectType<AbiTypeToPrimitiveType<'bool'>>(true)
    expectType<AbiTypeToPrimitiveType<'bool'>>(false)
  })

  test('bytes', () => {
    expectType<AbiTypeToPrimitiveType<'bytes'>>('foo')
    expectType<AbiTypeToPrimitiveType<'bytes1'>>('foo')
    expectType<AbiTypeToPrimitiveType<'bytes24'>>('foo')
    expectType<AbiTypeToPrimitiveType<'bytes32'>>('foo')
    expectType<AbiTypeToPrimitiveType<'bytes'>>([1])
  })

  test('function', () => {
    expectType<AbiTypeToPrimitiveType<'function'>>(`${address}foo`)
  })

  test('string', () => {
    expectType<AbiTypeToPrimitiveType<'string'>>('foo')
  })

  test('number', () => {
    expectType<AbiTypeToPrimitiveType<'int'>>(1)
    expectType<AbiTypeToPrimitiveType<'int8'>>(1)
    expectType<AbiTypeToPrimitiveType<'int32'>>(1)
    expectType<AbiTypeToPrimitiveType<'int256'>>(1)
    expectType<AbiTypeToPrimitiveType<'int256'>>(1n)
    expectType<AbiTypeToPrimitiveType<'int'>>(BigInt(1))
    expectType<AbiTypeToPrimitiveType<'uint'>>(1)
    expectType<AbiTypeToPrimitiveType<'uint8'>>(1)
    expectType<AbiTypeToPrimitiveType<'uint32'>>(1)
    expectType<AbiTypeToPrimitiveType<'uint256'>>(1)
    expectType<AbiTypeToPrimitiveType<'uint256'>>(1n)
    expectType<AbiTypeToPrimitiveType<'uint'>>(BigInt(1))
  })

  test('tuple', () => {
    expectType<AbiTypeToPrimitiveType<'tuple'>>({ foo: 'bar' })
  })

  test('array', () => {
    expectType<AbiTypeToPrimitiveType<'string[]'>>(['foo'])
    expectType<AbiTypeToPrimitiveType<'string[1]'>>(['foo', 'foo'])
  })

  test('2d array', () => {
    expectType<AbiTypeToPrimitiveType<'string[][]'>>([['foo']])
    expectType<AbiTypeToPrimitiveType<'string[1][]'>>([['foo', 'foo']])
  })
})

test('AbiParameterToPrimitiveType', () => {
  test('address', () => {
    type Result = AbiParameterToPrimitiveType<{
      name: 'owner'
      type: 'address'
    }>
    expectType<Result>(address)
    // @ts-expect-error missing "0x" prefix
    expectType<Result>('foo')
  })

  test('bool', () => {
    type Result = AbiParameterToPrimitiveType<{ name: ''; type: 'bool' }>
    expectType<Result>(true)
    expectType<Result>(false)
  })

  test('bool', () => {
    type Result = AbiParameterToPrimitiveType<{
      name: 'data'
      type: 'bytes'
    }>
    expectType<Result>('foo')
    expectType<Result>([0, 1])
  })

  test('function', () => {
    type FunctionResult = AbiParameterToPrimitiveType<{
      name: ''
      type: 'function'
    }>
    expectType<FunctionResult>(`${address}foo`)
  })

  test('string', () => {
    type Result = AbiParameterToPrimitiveType<{
      name: ''
      type: 'string'
    }>
    expectType<Result>('foo')
    expectType<Result>(address)
  })

  test('tuple', () => {
    type Result = AbiParameterToPrimitiveType<{
      components: [
        { name: 'name'; type: 'string' },
        { name: 'symbol'; type: 'string' },
        { name: 'description'; type: 'string' },
        { name: 'imageURI'; type: 'string' },
        { name: 'contentURI'; type: 'string' },
        { name: 'price'; type: 'uint256' },
        { name: 'limit'; type: 'uint256' },
        { name: 'fundingRecipient'; type: 'address' },
        { name: 'renderer'; type: 'address' },
        { name: 'nonce'; type: 'uint256' },
        { name: 'fee'; type: 'uint16' },
      ]
      internalType: 'struct IWritingEditions.WritingEdition'
      name: 'edition'
      type: 'tuple'
    }>
    expectType<Result>({
      name: 'Test',
      symbol: '$TEST',
      description: 'Foo bar baz',
      imageURI: 'ipfs://hash',
      contentURI: 'arweave://digest',
      price: 0.1,
      limit: 100,
      fundingRecipient: address,
      renderer: address,
      nonce: 123,
      fee: 0,
    })
    // @ts-expect-error missing keys
    expectType<Result>({
      name: 'Test',
      symbol: '$TEST',
      description: 'Foo bar baz',
      imageURI: 'ipfs://hash',
    })
    expectType<Result>({
      name: 'Test',
      symbol: '$TEST',
      description: 'Foo bar baz',
      imageURI: 'ipfs://hash',
      contentURI: 'arweave://digest',
      // @ts-expect-error invalid value
      price: '0.1',
      limit: 100,
      fundingRecipient: address,
      renderer: address,
      nonce: 123,
      fee: 0,
    })

    type NestedTupleResult = AbiParameterToPrimitiveType<{
      name: 's'
      type: 'tuple'
      components: [
        { name: 'a'; type: 'uint256' },
        { name: 'b'; type: 'uint256[2]' },
        {
          name: 'c'
          type: 'tuple[]'
          components: [
            { name: 'x'; type: 'uint256' },
            {
              name: 'y'
              type: 'tuple'
              components: [{ name: 'a'; type: 'string' }]
            },
          ]
        },
      ]
    }>
    expectType<NestedTupleResult>({
      a: 1,
      b: [2, 3],
      c: [{ x: 1, y: { a: 'foo' } }],
    })
  })

  test('number', () => {
    type Result = AbiParameterToPrimitiveType<{
      name: 'tokenId'
      type: 'uint256'
    }>
    expectType<Result>(123)
    expectType<Result>(123n)
    expectType<Result>(BigInt(123))
    // @ts-expect-error string value
    expectType<Result>('123')
  })

  test('array', () => {
    test('dynamic', () => {
      type Result = AbiParameterToPrimitiveType<{
        name: ''
        type: 'string[]'
      }>
      expectType<Result>(['foo', 'bar', 'baz'])
    })

    test('fixed', () => {
      type Result = AbiParameterToPrimitiveType<{
        name: ''
        type: 'string[3]'
      }>
      expectType<Result>(['foo', 'bar', 'baz'])
      expectType<Result>(['foo', 'bar'])
    })

    test('dynamic with tuple', () => {
      type Result = AbiParameterToPrimitiveType<{
        name: 'c'
        type: 'tuple[]'
        components: [
          {
            name: 'x'
            type: 'uint256'
          },
          {
            name: 'y'
            type: 'uint256'
          },
        ]
      }>
      expectType<Result>([{ x: 1, y: 1 }])
    })

    test('fixed with tuple', () => {
      type Result = AbiParameterToPrimitiveType<{
        name: 'c'
        type: 'tuple[2]'
        components: [
          {
            name: 'x'
            type: 'uint256'
          },
          {
            name: 'y'
            type: 'uint256'
          },
        ]
      }>
      expectType<Result>([
        { x: 1, y: 1 },
        { x: 1, y: 1 },
      ])
    })
  })

  test('2d array', () => {
    test('dynamic', () => {
      type Result = AbiParameterToPrimitiveType<{
        name: ''
        type: 'string[][]'
      }>
      expectType<Result>([['foo'], ['bar'], ['baz']])
    })

    test('fixed', () => {
      expectType<
        AbiParameterToPrimitiveType<{
          name: ''
          type: 'string[][3]'
        }>
      >([['foo'], ['bar'], ['baz']])

      expectType<
        AbiParameterToPrimitiveType<{
          name: ''
          type: 'string[3][]'
        }>
      >([
        ['foo', 'bar', 'baz'],
        ['foo', 'bar', 'baz'],
      ])

      expectType<
        AbiParameterToPrimitiveType<{
          name: ''
          type: 'string[3][3]'
        }>
      >([
        ['foo', 'bar', 'baz'],
        ['foo', 'bar', 'baz'],
        ['foo', 'bar', 'baz'],
      ])

      expectType<
        AbiParameterToPrimitiveType<{
          name: ''
          type: 'string[3][3]'
        }>
      >([
        ['foo', 'bar', 'baz'],
        ['foo', 'bar', 'baz'],
      ])
    })
  })
})

test('AbiParametersToPrimitiveTypes', () => {
  test('no parameters', () => {
    type Result = AbiParametersToPrimitiveTypes<[]>
    expectType<Result>([])
  })

  test('single parameter', () => {
    type Result = AbiParametersToPrimitiveTypes<
      [
        {
          name: 'tokenId'
          type: 'uint256[2]'
        },
      ]
    >
    expectType<Result>([[1, 1]])
    //          ^?
  })

  test('multiple parameters', () => {
    type Result = AbiParametersToPrimitiveTypes<
      [
        { name: 'to'; type: 'address' },
        { name: 'tokenId'; type: 'uint256' },
        { name: 'trait'; type: 'string[]' },
      ]
    >
    expectType<Result>([address, 1, ['foo']])
  })

  test('deeply nested parameters', () => {
    type Result = AbiParametersToPrimitiveTypes<
      [
        {
          name: 's'
          type: 'tuple'
          components: [
            { name: 'a'; type: 'uint256' },
            { name: 'b'; type: 'uint256[]' },
            {
              name: 'c'
              type: 'tuple[]'
              components: [
                { name: 'x'; type: 'uint256' },
                { name: 'y'; type: 'uint256' },
              ]
            },
          ]
        },
        {
          name: 't'
          type: 'tuple'
          components: [
            { name: 'x'; type: 'uint256' },
            { name: 'y'; type: 'uint256' },
          ]
        },
        { name: 'a'; type: 'uint256' },
        {
          name: 't'
          type: 'tuple[2]'
          components: [
            { name: 'x'; type: 'uint256' },
            { name: 'y'; type: 'uint256' },
          ]
        },
      ]
    >
    expectType<Result>([
      { a: 1, b: [2], c: [{ x: 1, y: 1 }] },
      { x: 1, y: 1 },
      1,
      [
        { x: 1, y: 1 },
        { x: 1, y: 1 },
      ],
    ])
  })
})

test('IsAbi', () => {
  test('const assertion', () => {
    expectType<IsAbi<typeof nestedTupleArrayAbi>>(true)
    expectType<IsAbi<typeof wagmiMintExampleAbi>>(true)
    expectType<IsAbi<typeof writingEditionsFactoryAbi>>(true)
    expectType<IsAbi<typeof ensRegistryWithFallbackAbi>>(true)
    expectType<IsAbi<typeof nounsAuctionHouseAbi>>(true)
  })

  test('declared as Abi type', () => {
    const abi: Abi = [
      {
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'a', type: 'uint256' }],
        name: 'foo',
        outputs: [],
      },
    ]
    type Result = IsAbi<typeof abi>
    expectType<Result>(true)
  })

  test('no const assertion', () => {
    const abi = [
      {
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'a', type: 'uint256' }],
        name: 'foo',
        outputs: [],
      },
    ]
    type Result = IsAbi<typeof abi>
    expectType<Result>(false)

    type InvalidAbiResult = IsAbi<'foo'>
    expectType<InvalidAbiResult>(false)
  })
})

test('Function', () => {
  test('AbiFunctionSignature', () => {
    test('zero inputs', () => {
      const abiFunction = {
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        name: 'foo',
        outputs: [],
      } as const
      type Result = AbiFunctionSignature<typeof abiFunction>
      expectType<Result>(() => {
        return
      })
    })

    test('one input', () => {
      const abiFunction = {
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'a', type: 'uint256' }],
        name: 'foo',
        outputs: [],
      } as const
      type Result = AbiFunctionSignature<typeof abiFunction>
      expectType<Result>((_a: number | bigint) => {
        return
      })
    })

    test('multiple inputs', () => {
      const abiFunction = {
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'a', type: 'uint256' },
          { name: 'b', type: 'string' },
        ],
        name: 'foo',
        outputs: [],
      } as const
      type Result = AbiFunctionSignature<typeof abiFunction>
      expectType<Result>((_a: number | bigint, _b: string) => {
        return
      })
    })

    test('one output', () => {
      const abiFunction = {
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'a', type: 'uint256' }],
        name: 'foo',
        outputs: [{ name: 'b', type: 'string' }],
      } as const
      type Result = AbiFunctionSignature<typeof abiFunction>
      expectType<Result>((_a: number | bigint) => {
        return 'b'
      })
    })

    test('multiple outputs', () => {
      const abiFunction = {
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'a', type: 'uint256' }],
        name: 'foo',
        outputs: [
          { name: 'b', type: 'uint256' },
          { name: 'c', type: 'string' },
        ],
      } as const
      type Result = AbiFunctionSignature<typeof abiFunction>
      expectType<Result>((_a: number | bigint) => {
        return [123, 'c']
      })
    })
  })

  test('ExtractAbiFunctions', () => {
    const abiFunction = {
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'a', type: 'uint256' }],
      name: 'foo',
      outputs: [],
    } as const
    expectType<ExtractAbiFunctions<[typeof abiFunction]>>(abiFunction)
    expectType<ExtractAbiFunctions<[]>>(undefined as never)
  })

  test('ExtractAbiFunctionNames', () => {
    expectType<ExtractAbiFunctionNames<typeof wagmiMintExampleAbi>>('symbol')
    expectType<ExtractAbiFunctionNames<[]>>(undefined as never)
  })

  test('ExtractAbiFunction', () => {
    test('default', () => {
      expectType<ExtractAbiFunction<typeof wagmiMintExampleAbi, 'tokenURI'>>({
        inputs: [
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        name: 'tokenURI',
        outputs: [
          {
            internalType: 'string',
            name: '',
            type: 'string',
          },
        ],
        stateMutability: 'pure',
        type: 'function',
      })
    })

    test('with overrides', () => {
      type Result = ExtractAbiFunction<
        typeof wagmiMintExampleAbi,
        'safeTransferFrom'
      >
      expectType<Result>({
        inputs: [
          { internalType: 'address', name: 'from', type: 'address' },
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      })
      expectType<Result>({
        inputs: [
          { internalType: 'address', name: 'from', type: 'address' },
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
          { internalType: 'bytes', name: '_data', type: 'bytes' },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      })
    })
  })
})

test('Events', () => {
  test('AbiEventSignature', () => {
    test('zero inputs', () => {
      const abiEvent = {
        type: 'event',
        anonymous: false,
        inputs: [],
        name: 'foo',
      } as const
      type Result = AbiEventSignature<typeof abiEvent>
      expectType<Result>(() => {
        return
      })
    })

    test('one input', () => {
      const abiEvent = {
        type: 'event',
        anonymous: false,
        inputs: [{ name: 'a', type: 'uint256' }],
        name: 'foo',
      } as const
      type Result = AbiEventSignature<typeof abiEvent>
      expectType<Result>((_a: number | bigint) => {
        return
      })
    })

    test('multiple inputs', () => {
      const abiEvent = {
        type: 'event',
        anonymous: false,
        inputs: [
          { name: 'a', type: 'uint256' },
          { name: 'a', type: 'string' },
        ],
        name: 'foo',
      } as const
      type Result = AbiEventSignature<typeof abiEvent>
      expectType<Result>((_a: number | bigint, _b: string) => {
        return
      })
    })
  })

  test('ExtractAbiEvents', () => {
    const abiEvent = {
      type: 'event',
      anonymous: false,
      inputs: [{ name: 'a', type: 'uint256' }],
      name: 'foo',
    } as const
    expectType<ExtractAbiEvents<[typeof abiEvent]>>(abiEvent)
    expectType<ExtractAbiEvents<[]>>(undefined as never)
  })

  test('ExtractAbiEventNames', () => {
    expectType<ExtractAbiEventNames<typeof wagmiMintExampleAbi>>(
      'ApprovalForAll',
    )
    expectType<ExtractAbiEventNames<[]>>(undefined as never)
  })

  test('ExtractAbiEvent', () => {
    expectType<ExtractAbiEvent<typeof wagmiMintExampleAbi, 'Transfer'>>({
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'Transfer',
      type: 'event',
    })
  })
})

test('Error', () => {
  test('ExtractAbiErrors', () => {
    const abiError = {
      type: 'error',
      inputs: [{ name: 'a', type: 'uint256' }],
      name: 'foo',
    } as const
    expectType<ExtractAbiErrors<[typeof abiError]>>(abiError)
    expectType<ExtractAbiErrors<[]>>(undefined as never)
  })

  test('ExtractAbiErrorNames', () => {
    expectType<
      ExtractAbiErrorNames<
        [
          {
            type: 'error'
            inputs: [{ name: 'a'; type: 'uint256' }]
            name: 'foo'
          },
        ]
      >
    >('foo')
    expectType<ExtractAbiErrorNames<[]>>(undefined as never)
  })

  test('ExtractAbiError', () => {
    const abiError = {
      type: 'error',
      inputs: [{ name: 'a', type: 'uint256' }],
      name: 'foo',
    } as const
    expectType<ExtractAbiError<[typeof abiError], 'foo'>>(abiError)
  })
})
