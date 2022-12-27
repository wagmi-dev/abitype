import type { wagmiMintExampleAbi } from '../../test'
import type { Abi } from '../abi'
import type { GetConfig, GetReturnType } from './types'

export type ReadContractConfig<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
> = GetConfig<TAbi, TFunctionName, 'pure' | 'view'>

export declare function readContract<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
>(
  config: ReadContractConfig<TAbi, TFunctionName>,
): GetReturnType<TAbi, TFunctionName>

export declare function readWagmiMintExample<
  TAbi extends Abi | readonly unknown[] = typeof wagmiMintExampleAbi,
  TFunctionName extends string = string,
>(
  config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>,
): GetReturnType<TAbi, TFunctionName>
