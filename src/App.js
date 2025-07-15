import { useState } from 'react';
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  setAuthority,
  AuthorityType,
} from '@solana/spl-token';
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from '@metaplex-foundation/mpl-token-metadata';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');

  const connectWallet = async () => {
    if ('solana' in window) {
      const resp = await window.solana.connect();
      setWalletAddress(resp.publicKey.toString());
    } else {
      alert('Please install Phantom Wallet');
    }
  };

  const createToken = async () => {
    try {
      const provider = window.solana;
      const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
      const payer = provider.publicKey;

      const mint = await createMint(
        connection,
        provider,
        payer,
        null,
        9
      );

      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        provider,
        mint,
        payer
      );

      await mintTo(
        connection,
        provider,
        mint,
        tokenAccount.address,
        payer,
        parseInt(supply) * 10 ** 9
      );

      const metadataPDA = (
        await PublicKey.findProgramAddressSync(
          [
            Buffer.from('metadata'),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
          ],
          TOKEN_METADATA_PROGRAM_ID
        )
      )[0];

      const metadataTx = new Transaction().add(
        createCreateMetadataAccountV3Instruction(
          {
            metadata: metadataPDA,
            mint: mint,
            mintAuthority: payer,
            payer: payer,
            updateAuthority: payer,
          },
          {
            createMetadataAccountArgsV3: {
              data: {
                name: name,
                symbol: symbol,
                uri: 'https://arweave.net/placeholder.json', // Remplace par vrai lien JSON plus tard
                sellerFeeBasisPoints: 0,
                creators: null,
                collection: null,
                uses: null,
              },
              isMutable: true,
              collectionDetails: null,
            },
          }
        )
      );

      await provider.connect(); // s'assurer que Phantom est bien autorisé
      await sendAndConfirmTransaction(connection, metadataTx, [/* payer via Phantom */]);

      setTokenAddress(mint.toBase58());
      alert('Token created successfully!');

    } catch (error) {
      console.error(error);
      alert('Error creating token');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>SPL Token Generator (Mainnet)</h1>

      <button onClick={connectWallet}>
        {walletAddress ? 'Wallet Connected' : 'Connect Phantom Wallet'}
      </button>

      {walletAddress && (
        <div style={{ marginTop: 20 }}>
          <input
            placeholder="Token name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ display: 'block', margin: '10px 0' }}
          />
          <input
            placeholder="Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            style={{ display: 'block', margin: '10px 0' }}
          />
          <input
            placeholder="Supply"
            value={supply}
            onChange={(e) => setSupply(e.target.value)}
            type="number"
            style={{ display: 'block', margin: '10px 0' }}
          />
          <button onClick={createToken}>Create Token</button>
        </div>
      )}

      {tokenAddress && (
        <p style={{ marginTop: 20 }}>Token Address: {tokenAddress}</p>
      )}
    </div>
  );
}

export default App;
