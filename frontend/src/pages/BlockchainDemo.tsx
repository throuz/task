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
        This page demonstrates smart contract integration on Sepolia using a WETH-style ERC20 contract.
      </p>
      <p style={{ marginTop: 0 }}>
        Flow: <strong>Wrap</strong> Sepolia ETH into WETH via <code>deposit()</code>, then <strong>transfer</strong> WETH
        via <code>transfer(to, amount)</code>. You can verify each transaction via the Etherscan link.
      </p>

      {walletError ? <ErrorMessage message={walletError} /> : null}

      {!isConnected ? (
        <button type="button" onClick={connect}>
          Connect Wallet
        </button>
      ) : (
        <>
          <section style={{ marginTop: '1.25rem' }}>
            <h2>1) Network & Contract</h2>
            <p style={{ marginTop: 0 }}>
              <strong>Chain ID:</strong> {CHAIN_ID}
              <strong style={{ marginLeft: '0.75rem' }}>Contract:</strong> <code>{CONTRACT_ADDRESS}</code>
            </p>
          </section>

          <section style={{ marginTop: '1.25rem' }}>
            <h2>2) Wallet</h2>
            <p style={{ marginTop: 0 }}>
              <strong>Address:</strong> {truncateAddress(address ?? '')}
              <button type="button" onClick={disconnect} style={{ marginLeft: '1rem' }}>
                Disconnect
              </button>
            </p>
            <p style={{ marginTop: 0 }}>
              <strong>Sepolia ETH (native):</strong>{' '}
              {nativeBalanceWei != null ? `${formatEthFromWei(nativeBalanceWei)} ETH` : '—'}
            </p>
          </section>

          <section style={{ marginTop: '1.25rem' }}>
            <h2>3) Read from contract</h2>
            <p style={{ marginTop: 0 }}>
              Reads <code>balanceOf(address)</code> from the WETH contract and displays your WETH balance (base units).
            </p>
            <p style={{ marginTop: 0 }}>
              <strong>WETH token balance (balanceOf):</strong> {balance != null ? balance.toString() : '—'}
            </p>
          </section>

          <section style={{ marginTop: '1.25rem' }}>
            <h2>4) Write to contract — Wrap (deposit)</h2>
            <p style={{ marginTop: 0 }}>
              Calls <code>deposit()</code> and sends ETH as <code>value</code>. Input unit is <strong>wei</strong>.
            </p>
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
                <strong>Wrap tx:</strong>{' '}
                {txExplorerUrl(wrapTxHash) ? (
                  <a href={txExplorerUrl(wrapTxHash) as string} target="_blank" rel="noreferrer">
                    {truncateAddress(wrapTxHash)}
                  </a>
                ) : (
                  truncateAddress(wrapTxHash)
                )}
              </p>
            ) : null}
          </section>

          <section style={{ marginTop: '1.25rem' }}>
            <h2>5) Write to contract — Transfer WETH</h2>
            <p style={{ marginTop: 0 }}>
              Calls <code>transfer(to, amount)</code>. Input unit is WETH <strong>base units</strong> (18 decimals).
            </p>
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
                <strong>Transfer tx:</strong>{' '}
                {txExplorerUrl(transferTxHash) ? (
                  <a href={txExplorerUrl(transferTxHash) as string} target="_blank" rel="noreferrer">
                    {truncateAddress(transferTxHash)}
                  </a>
                ) : (
                  truncateAddress(transferTxHash)
                )}
              </p>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}
