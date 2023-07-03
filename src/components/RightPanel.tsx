/***********************/
/*     Right Panel     */
/***********************/
// for now just a wallet button, but can expand if we want

import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const RightPanel = (props: any) => {
	return (
		<div className='right-panel-header'>
			<WalletMultiButton/>
		</div>
	);
}

export default RightPanel;