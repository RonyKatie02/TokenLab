import { useState } from 'react';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = async () => {
    if ('solana' in window) {
      const provider = window.solana;
      if (provider.isPhantom) {
        try {
          const resp = await provider.connect();
          setWalletAddress(resp.publicKey.toString());
        } catch (err) {
          console.error("Connection refused", err);
        }
      }
    } else {
      alert('Install Phantom Wallet from https://phantom.app');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Token Launcher</h1>

      <button
        onClick={connectWallet}
        style={{
          padding: '10px 20px',
          backgroundColor: '#512da8',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Connect with Phantom
      </button>

      {walletAddress && (
        <p style={{ marginTop: '1rem' }}>
          Connected: {walletAddress}
        </p>
      )}
    </div>
  );
}

export default App;
