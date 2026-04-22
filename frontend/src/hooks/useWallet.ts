import { useState, useCallback, useEffect } from 'react';
import { createWalletClient, custom, type Address } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { CHAIN_ID, publicClient, readBalance, writeTransfer } from '../blockchain';

const chain = CHAIN_ID === 1 ? mainnet : sepolia;

export type TxStatus = 'idle' | 'pending' | 'success' | 'error';

export function useWallet() {
  const [address, setAddress] = useState<Address | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const switchToSupportedNetwork = useCallback(async () => {
    const provider = window.ethereum;
    if (!provider) return false;

    const chainIdHex = `0x${CHAIN_ID.toString(16)}`;
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      return true;
    } catch (e) {
      // 4902 = Unrecognized chain, try to add.
      const code = (e as { code?: number })?.code;
      if (code !== 4902) throw e;

      if (CHAIN_ID === 11155111) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainIdHex,
              chainName: 'Sepolia',
              nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://rpc.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
        return true;
      }
      return false;
    }
  }, []);

  const getWalletClient = useCallback(() => {
    const provider = typeof window !== 'undefined' ? window.ethereum : undefined;
    if (!provider) return null;
    return createWalletClient({
      chain,
      transport: custom(provider),
    });
  }, []);

  const ensureCorrectNetwork = useCallback(async () => {
    const provider = window.ethereum;
    if (!provider) return false;
    const chainIdHex = (await provider.request({ method: 'eth_chainId' })) as string;
    const current = Number.parseInt(chainIdHex, 16);
    if (current !== CHAIN_ID) {
      setError(`Wrong network. Please switch your wallet to chainId ${CHAIN_ID}.`);
      return false;
    }
    return true;
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    try {
      const provider = window.ethereum;
      if (!provider) {
        setError('No wallet found. Install MetaMask or another Web3 wallet.');
        return;
      }
      const [acc] = (await provider.request({ method: 'eth_requestAccounts' })) as Address[];
      if (!acc) return;
      if (!(await ensureCorrectNetwork())) {
        try {
          await switchToSupportedNetwork();
        } catch {
          // ignore; user can switch manually
        }
        if (!(await ensureCorrectNetwork())) return;
      }
      setAddress(acc);
      const bal = await readBalance(acc);
      setBalance(bal);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect');
    }
  }, [ensureCorrectNetwork, switchToSupportedNetwork]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance(null);
    setError(null);
    setTxStatus('idle');
    setTxHash(null);
  }, []);

  const transfer = useCallback(
    async (to: Address, amount: bigint) => {
      if (!address) {
        setError('Connect wallet first');
        return;
      }
      if (!(await ensureCorrectNetwork())) {
        try {
          await switchToSupportedNetwork();
        } catch {
          // ignore; user can switch manually
        }
        if (!(await ensureCorrectNetwork())) return;
      }
      const walletClient = getWalletClient();
      if (!walletClient) {
        setError('Wallet not available');
        return;
      }
      setTxStatus('pending');
      setError(null);
      setTxHash(null);
      try {
        const hash = await writeTransfer(walletClient, address, to, amount);
        setTxHash(hash);
        await publicClient.waitForTransactionReceipt({ hash });
        setTxStatus('success');
        const newBalance = await readBalance(address);
        setBalance(newBalance);
        return hash;
      } catch (e) {
        setTxStatus('error');
        setError(e instanceof Error ? e.message : 'Transaction failed');
      }
    },
    [address, ensureCorrectNetwork, getWalletClient, switchToSupportedNetwork]
  );

  useEffect(() => {
    if (!address) return;
    readBalance(address).then(setBalance);
  }, [address]);

  useEffect(() => {
    if (!window.ethereum) return;
    const onAccountsChanged = (accounts: unknown) => {
      const acc = (accounts as Address[])?.[0];
      setAddress(acc ?? null);
      if (!acc) setBalance(null);
    };
    window.ethereum.on?.('accountsChanged', onAccountsChanged);
    return () => window.ethereum?.removeListener?.('accountsChanged', onAccountsChanged);
  }, []);

  return {
    address,
    balance,
    txStatus,
    txHash,
    error,
    connect,
    disconnect,
    transfer,
    isConnected: !!address,
  };
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
      on?: (event: string, cb: (args: unknown) => void) => void;
      removeListener?: (event: string, cb: (args: unknown) => void) => void;
    };
  }
}
