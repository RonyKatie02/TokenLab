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
          console.error("Connexion refusée", err);
        }
      }
    } else {
      alert('Installe Phantom Wallet depuis https://phantom.app');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Token Launcher</h1>

      <button
        onClick={connectWallet}
        style={{
          padding: '10px 20px',
          backgroundColor: '#512da8',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Se connecter avec Phantom
      </button>

      {walletAddress && (
        <p style={{ marginTop: '1rem' }}>
          Connecté : {walletAddress}
        </p>
      )}
    </div>
  );
}

export default App;
