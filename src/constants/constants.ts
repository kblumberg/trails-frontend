import { ConnectionConfig } from '@solana/web3.js';

export const AWS_KEY = process.env.REACT_APP_AWS_KEY;
export const AWS_SECRET = process.env.REACT_APP_AWS_SECRET;

export const isDev = false;


export const BACKEND_URL = 'https://trails-protocol-backend.herokuapp.com';
// export const BACKEND_URL = 'https://trails-protocol-backend-dev.herokuapp.com';
// export const BACKEND_URL = 'http://localhost:5000';
// export const BACKEND_URL: string = isDev ? 'http://localhost:5000' : 'https://trails-protocol-backend.herokuapp.com';

// export const NETWORK = isDev ? 'https://api.devnet.solana.com' : 'https://red-cool-wildflower.solana-mainnet.quiknode.pro/a1674d4ab875dd3f89b34863a86c0f1931f57090/';
export const NETWORK: string = process.env.REACT_APP_NETWORK_RPC ? process.env.REACT_APP_NETWORK_RPC : 'https://api.mainnet-beta.solana.com';

export const CONFIG: ConnectionConfig = {
	commitment: 'confirmed',
	disableRetryOnRateLimit: false,
	confirmTransactionInitialTimeout: 150000
};

// {address:"734bdC9L1YD6FDLjuHdr1wNHe1kHtqQa6hpvpAeDdqA"}
// {trailheadId: 7, step:3}