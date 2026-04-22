import { createPublicClient, createWalletClient, http, type Address } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { CHAIN_ID, CONTRACT_ADDRESS } from './config';

const chain = CHAIN_ID === 1 ? mainnet : sepolia;

export const publicClient = createPublicClient({
  chain,
  transport: http(),
});

/**
 * Minimal ERC20 ABI for demo purposes.
 * Used for: read `balanceOf` + write `transfer`.
 */
export const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const;

export async function readBalance(account: Address): Promise<bigint> {
  if (!CONTRACT_ADDRESS) return 0n;
  return publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [account],
  });
}

export async function writeTransfer(
  walletClient: ReturnType<typeof createWalletClient>,
  account: Address,
  to: Address,
  amount: bigint
) {
  if (!CONTRACT_ADDRESS) throw new Error('Contract address not set');
  return walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [to, amount],
    account,
    chain,
  });
}
