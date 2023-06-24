import { ConnectionConfig, PublicKey } from '@solana/web3.js';

export const AWS_KEY = process.env.REACT_APP_AWS_KEY;
export const AWS_SECRET = process.env.REACT_APP_AWS_SECRET;

export const isDev = true;

// export const BACKEND_URL = 'https://trails-protocol-backend.herokuapp.com';
// export const BACKEND_URL = 'https://trails-protocol-backend-dev.herokuapp.com';
export const BACKEND_URL = 'http://localhost:5000';
// export const BACKEND_URL: string = isDev ? 'http://localhost:5000' : 'https://trails-protocol-backend.herokuapp.com';

// export const NETWORK = isDev ? 'https://api.devnet.solana.com' : 'https://red-cool-wildflower.solana-mainnet.quiknode.pro/a1674d4ab875dd3f89b34863a86c0f1931f57090/';
// export const NETWORK: string = process.env.REACT_APP_NETWORK_RPC ? process.env.REACT_APP_NETWORK_RPC : 'https://api.mainnet-beta.solana.com';
export const NETWORK = isDev ? 'http://127.0.0.1:8899' : process.env.REACT_APP_NETWORK_RPC ? process.env.REACT_APP_NETWORK_RPC : 'https://api.mainnet-beta.solana.com';

export const SOL_ADDRESS = 'So11111111111111111111111111111111111111112';

export const CONFIG: ConnectionConfig = {
	commitment: 'confirmed',
	disableRetryOnRateLimit: false,
	confirmTransactionInitialTimeout: 150000
};

// Program ID of the Solana program
export const PROGRAM_ID: PublicKey = new PublicKey(
    'TraiLS6XoUXJPS3GovqUnSvoUPjBZBcSzkDQB9VARYx'
);
// Program ID of the Solana program
export const ADMIN_ADDRESS = 'TrAiLs4aH8ahRL91vEQUEsQNWgc8eZvzzuRDt9CwJjU';

export const FEE_AMOUNT = 100
export const FEE_DECIMALS = 3

// {address:"734bdC9L1YD6FDLjuHdr1wNHe1kHtqQa6hpvpAeDdqA"}
// {trailheadId: 7, step:3}

export const TEST_TOKEN = new PublicKey('5SosK71HJr9UpcwopNam8X9ZnuonDoGERjziWSnws4u4');

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
	'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  );