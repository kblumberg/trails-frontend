import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import reportWebVitals from './reportWebVitals';
import { createStore, applyMiddleware } from 'redux'; 
import rootReducer from './store/reducers';
import thunk from 'redux-thunk'; 
import { Provider } from 'react-redux';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { NETWORK } from './constants/constants';
import {
  GlowWalletAdapter,
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolflareWalletAdapterConfig,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';



const store = createStore(rootReducer, applyMiddleware(thunk));

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
const solNetwork = WalletAdapterNetwork.Mainnet;
const endpoint = NETWORK;
const config: SolflareWalletAdapterConfig = {
  'network': solNetwork
};

const wallets = [
  new PhantomWalletAdapter(),
  new GlowWalletAdapter(),
  new SlopeWalletAdapter(),
  new SolflareWalletAdapter(config),
  new TorusWalletAdapter(),
  new LedgerWalletAdapter(),
  new SolletExtensionWalletAdapter(),
  new SolletWalletAdapter(),
];

root.render(
  <React.StrictMode>
    <Provider store={store}>
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider wallets={wallets}>
				<WalletModalProvider>
      <App />
				</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
    </Provider>
    <script src="https://unpkg.com/@mojs/core"></script>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
