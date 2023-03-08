import React, { useState } from 'react';
// import images from '../static/images';
// import { useHistory } from 'react-router';
import { IState } from '../store/interfaces/state';
import * as actions from '../store/actions/actions';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';
// import { updateUser } from '../api/user';

// import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useWallet } from '@solana/wallet-adapter-react';
import { uploadFile } from 'react-s3';
import * as anchor from '@project-serum/anchor';
import { Connection, ConnectionConfig } from '@solana/web3.js';
import { NETWORK } from '../constants/constants';
// import { Wallet } from 'easy-spl';
import AWS from 'aws-sdk'

const S3_BUCKET = 'trails-avatars';
const REGION = 'us-east-1';


AWS.config.update({
    accessKeyId: 'AKIAULSMK74QTRRSAAPZ',
    secretAccessKey: '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'
})

const myBucket = new AWS.S3({
    params: { Bucket: S3_BUCKET},
    region: REGION,
})

// const darkTheme = createTheme({
//     palette: {
//         mode: 'dark',
//         primary: {
//           main: '#ffffff',
//         },
//         secondary: {
//           main: '#f2c94c',
//         },
//       },
//   });

// shows each of your holdings
const MyProfilePage = (props: any) => {

    const data: IState = useSelector((state: any) => state.data);
    const positions: any[] = [];
    const dispatch = useDispatch();
    // const history = useHistory();
	
    const [ userName, setUserName ] = React.useState( data.address );
    const [ userAvatarUrl, setUserAvatarUrl ] = React.useState( '' );

	const isDisabled = false;
    const setUserInfo = async (
        name: string,
        url: string
    ) => {
		console.log(`setUserInfo`);
		console.log(data.address);
		
		// if(data.address && data.user) {
		// 	setAlertText('Saving display name...');
		// 	const val = await updateUser(data.address, name, url, data.user.userOdds);
		// 	setAlertText(`Display name saved!`);
		// }
	}

    const [progress , setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [alertText, setAlertText] = useState('');

	const walletContext: any = useWallet();

    const handleFileInput = (e: any) => {
		// setAlertText(`Reading file...`);
        setSelectedFile(e.target.files[0]);
    }

    const uploadFile = (file: any) => {

		// const walletContext: any = useWallet();
		const config: ConnectionConfig = {
			commitment: 'confirmed',
			disableRetryOnRateLimit: false,
			confirmTransactionInitialTimeout: 150000
		};
		const connection = new Connection(NETWORK, config);
		// const provider = new anchor.Provider(connection, walletContext, config);
		// const userAccount: Wallet = new Wallet(connection, provider.wallet);

		const params = {
            ACL: 'public-read',
            Body: file,
            Bucket: S3_BUCKET,
            // Key: 'test.png'
            Key: `${data.address}.png`
        };

		setAlertText(`Upload 0% Complete!`)
		myBucket.putObject(params)
            .on('httpUploadProgress', (evt: any) => {
				console.log(`${Math.round((evt.loaded / evt.total) * 100)}`);
				console.log(evt);
				setAlertText(`Upload ${Math.round((evt.loaded / evt.total) * 100)}% Complete!`)
                setProgress(Math.round((evt.loaded / evt.total) * 100))
            })
            .send((err: any) => {
                if (err) console.log(err)
            })
    }

	// const handleOddsChange = (event: SelectChangeEvent) => {
	// 	setOdds(event.target.value);
	// };
	
    return(
        <div className="settings-page">
            <div className="my-profile-panel panel-outer panel">
				<div className="my-profile-panel-inner panel-inner">
					<div className='pb-4 text-th-fgd-1 text-lg'>
						My Profile
					</div>
					<div className='row padding-1-0'>
						<div className='col-4 label'>
							Display Name
						</div>
						<div className='col-4'>
							<input className='color-gray-1' placeholder='' value={userName} onChange={evt => setUserName(evt.target.value)}/>
						</div>
						<div className='col-4'>
							<Button disabled={ !data.address } onClick={() => {
								setUserInfo( userName, userAvatarUrl );
							}} className='confirm-button props-button'>
								Save
							</Button>
						</div>
					</div>
					<div className='row padding-1-0'>
						<div className='col-4 label'>
							PFP
						</div>
						<div className='col-4'>
							<input type='file' className='padding-left-1'  accept="image/png" onChange={handleFileInput}/>
							{/* <Button disabled={ isDisabled } onClick={() => {
								setUserInfo( userName, userAvatarUrl );
							}} className='confirm-button props-button'>
								Upload
							</Button> */}
						</div>
						<div className='col-4'>
							<Button disabled={ selectedFile == '' || selectedFile == null } onClick={() => {
								uploadFile( selectedFile );
							}} className='confirm-button props-button'>
								Upload
							</Button>
						</div>
					</div>
					{/* <div className='row' style={{'paddingTop': '2rem'}}>
						<Button disabled={ selectedFile == '' || selectedFile == null } onClick={() => {
							setUserInfo( userName, userAvatarUrl );
						}} className='confirm-swap-button props-button'>
							Save
						</Button>
					</div> */}
					<div>
						{alertText ? alertText : null}
					</div>
				</div>
			</div>
        </div>
    )
};

export default MyProfilePage;
