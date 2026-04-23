import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { ErrorMessage, Loading, SuccessMessage } from '../components';
import { CHAIN_ID, CONTRACT_ADDRESS } from '../blockchain';

function truncateAddress(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function txExplorerUrl(hash: string) {
  if (CHAIN_ID === 11155111) return `https://sepolia.etherscan.io/tx/${hash}`;
  if (CHAIN_ID === 1) return `https://etherscan.io/tx/${hash}`;
  return null;
}

function formatEthFromWei(wei: bigint) {
  const s = wei.toString().padStart(19, '0');
  const whole = s.slice(0, -18);
  const frac = s.slice(-18).replace(/0+$/, '');
  return frac ? `${whole}.${frac.slice(0, 6)}` : whole;
}

export function BlockchainDemo() {
  const {
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
    isConnected,
  } = useWallet();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [wrapAmount, setWrapAmount] = useState('');

  const handleTransfer = () => {
    if (!toAddress || !amount) return;
    transfer(toAddress as `0x${string}`, BigInt(amount));
  };

  const handleWrap = () => {
    if (!wrapAmount) return;
    deposit(BigInt(wrapAmount));
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1>Blockchain Demo</h1>
      <p>
        Connect a Web3 wallet (e.g. MetaMask). This demo uses WETH-style contract methods:
        <code>deposit()</code> (wrap ETH) and <code>transfer()</code>.
      </p>

      {walletError ? <ErrorMessage message={walletError} /> : null}

      {!isConnected ? (
        <button type="button" onClick={connect}>
          Connect Wallet
        </button>
      ) : (
        <>
          <p>
            <strong>Address:</strong> {truncateAddress(address ?? '')}
            <button type="button" onClick={disconnect} style={{ marginLeft: '1rem' }}>
              Disconnect
            </button>
          </p>
          <p>
            <strong>Sepolia ETH (native):</strong>{' '}
            {nativeBalanceWei != null ? `${formatEthFromWei(nativeBalanceWei)} ETH` : '—'}
          </p>
          <p>
            <strong>WETH token balance (balanceOf):</strong> {balance != null ? balance.toString() : '—'}
          </p>
          <p style={{ marginTop: 0 }}>
            <strong>Chain ID:</strong> {CHAIN_ID} <strong style={{ marginLeft: '0.75rem' }}>Contract:</strong>{' '}
            <code>{CONTRACT_ADDRESS}</code>
          </p>

          <div style={{ marginTop: '1rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Write: Wrap Sepolia ETH into WETH (deposit)</h2>
            <input
              type="text"
              value={wrapAmount}
              onChange={(e) => setWrapAmount(e.target.value)}
              placeholder="Amount (wei)"
              style={{
                display: 'block',
                margin: '0 auto 0.5rem',
                padding: '0.5rem',
                width: '100%',
                maxWidth: '400px',
              }}
            />
            <button type="button" onClick={handleWrap} disabled={wrapTxStatus === 'pending' || !wrapAmount}>
              {wrapTxStatus === 'pending' ? 'Pending…' : 'Wrap (deposit)'}
            </button>
            {wrapTxStatus === 'pending' ? <Loading /> : null}
            {wrapError ? <ErrorMessage message={wrapError} /> : null}
            {wrapTxStatus === 'success' ? <SuccessMessage message="Wrap confirmed." /> : null}
            {wrapTxHash ? (
              <p style={{ marginTop: '0.5rem' }}>
                <strong>Tx:</strong>{' '}
                {txExplorerUrl(wrapTxHash) ? (
                  <a href={txExplorerUrl(wrapTxHash) as string} target="_blank" rel="noreferrer">
                    {truncateAddress(wrapTxHash)}
                  </a>
                ) : (
                  truncateAddress(wrapTxHash)
                )}
              </p>
            ) : null}

            <hr style={{ margin: '1.25rem 0' }} />

            <h2 style={{ marginBottom: '0.5rem' }}>Write: Transfer WETH</h2>
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="To address (0x…)"
              style={{
                display: 'block',
                margin: '0 auto 0.5rem',
                padding: '0.5rem',
                width: '100%',
                maxWidth: '400px',
              }}
            />
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (token base units, usually 18 decimals)"
              style={{
                display: 'block',
                margin: '0 auto 0.5rem',
                padding: '0.5rem',
                width: '100%',
                maxWidth: '400px',
              }}
            />
            <button
              type="button"
              onClick={handleTransfer}
              disabled={transferTxStatus === 'pending' || !toAddress || !amount}
            >
              {transferTxStatus === 'pending' ? 'Pending…' : 'Transfer'}
            </button>
            {transferTxStatus === 'pending' ? <Loading /> : null}
            {transferError ? <ErrorMessage message={transferError} /> : null}
            {transferTxStatus === 'success' ? <SuccessMessage message="Transfer confirmed." /> : null}
            {transferTxHash ? (
              <p style={{ marginTop: '0.5rem' }}>
                <strong>Tx:</strong>{' '}
                {txExplorerUrl(transferTxHash) ? (
                  <a href={txExplorerUrl(transferTxHash) as string} target="_blank" rel="noreferrer">
                    {truncateAddress(transferTxHash)}
                  </a>
                ) : (
                  truncateAddress(transferTxHash)
                )}
              </p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
