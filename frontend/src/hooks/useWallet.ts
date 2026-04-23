import { useState, useCallback, useEffect } from 'react';
import { createWalletClient, custom, type Address } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { CHAIN_ID, publicClient, readBalance, writeDeposit, writeTransfer } from '../blockchain';

const chain = CHAIN_ID === 1 ? mainnet : sepolia;

export type TxStatus = 'idle' | 'pending' | 'success' | 'error';

export function useWallet() {
  const [address, setAddress] = useState<Address | null>(null);
  const [nativeBalanceWei, setNativeBalanceWei] = useState<bigint | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [wrapTxStatus, setWrapTxStatus] = useState<TxStatus>('idle');
  const [wrapTxHash, setWrapTxHash] = useState<`0x${string}` | null>(null);
  const [wrapError, setWrapError] = useState<string | null>(null);
  const [transferTxStatus, setTransferTxStatus] = useState<TxStatus>('idle');
  const [transferTxHash, setTransferTxHash] = useState<`0x${string}` | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);

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
      setWalletError(`Wrong network. Please switch your wallet to chainId ${CHAIN_ID}.`);
      return false;
    }
    return true;
  }, []);

  const connect = useCallback(async () => {
    setWalletError(null);
    try {
      const provider = window.ethereum;
      if (!provider) {
        setWalletError('No wallet found. Install MetaMask or another Web3 wallet.');
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
      const nativeBal = await publicClient.getBalance({ address: acc });
      setNativeBalanceWei(nativeBal);
      const bal = await readBalance(acc);
      setBalance(bal);
    } catch (e) {
      setWalletError(e instanceof Error ? e.message : 'Failed to connect');
    }
  }, [ensureCorrectNetwork, switchToSupportedNetwork]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setNativeBalanceWei(null);
    setBalance(null);
    setWalletError(null);
    setWrapTxStatus('idle');
    setWrapTxHash(null);
    setWrapError(null);
    setTransferTxStatus('idle');
    setTransferTxHash(null);
    setTransferError(null);
  }, []);

  const transfer = useCallback(
    async (to: Address, amount: bigint) => {
      if (!address) {
        setTransferError('Connect wallet first');
        return;
      }
      setTransferError(null);
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
        setTransferError('Wallet not available');
        return;
      }
      setTransferTxStatus('pending');
      setTransferTxHash(null);
      try {
        const hash = await writeTransfer(walletClient, address, to, amount);
        setTransferTxHash(hash);
        await publicClient.waitForTransactionReceipt({ hash });
        setTransferTxStatus('success');
        const nativeBal = await publicClient.getBalance({ address });
        setNativeBalanceWei(nativeBal);
        const newBalance = await readBalance(address);
        setBalance(newBalance);
        return hash;
      } catch (e) {
        setTransferTxStatus('error');
        setTransferError(e instanceof Error ? e.message : 'Transaction failed');
      }
    },
    [address, ensureCorrectNetwork, getWalletClient, switchToSupportedNetwork]
  );

  const deposit = useCallback(
    async (amountWei: bigint) => {
      if (!address) {
        setWrapError('Connect wallet first');
        return;
      }
      if (amountWei <= 0n) {
        setWrapError('Amount must be greater than 0');
        return;
      }
      setWrapError(null);
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
        setWrapError('Wallet not available');
        return;
      }
      setWrapTxStatus('pending');
      setWrapTxHash(null);
      try {
        const hash = await writeDeposit(walletClient, address, amountWei);
        setWrapTxHash(hash);
        await publicClient.waitForTransactionReceipt({ hash });
        setWrapTxStatus('success');
        const nativeBal = await publicClient.getBalance({ address });
        setNativeBalanceWei(nativeBal);
        const newBalance = await readBalance(address);
        setBalance(newBalance);
        return hash;
      } catch (e) {
        setWrapTxStatus('error');
        setWrapError(e instanceof Error ? e.message : 'Transaction failed');
      }
    },
    [address, ensureCorrectNetwork, getWalletClient, switchToSupportedNetwork]
  );

  useEffect(() => {
    if (!address) return;
    readBalance(address).then(setBalance);
    publicClient.getBalance({ address }).then(setNativeBalanceWei);
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
    nativeBalanceWei,
    balance,
    wrapTxStatus,
    wrapTxHash,
    wrapError,
    transferTxStatus,
    transferTxHash,
    transferError,
    walletError,
    connect,
    disconnect,
    deposit,
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
