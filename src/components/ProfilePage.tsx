/************************/
/*     Profile Page     */
/***********************/
// let a user customize their profile (and show their stats in the future!)

import AWS from 'aws-sdk';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { isMobile } from 'src/utils/utils';
import { IState } from '../store/interfaces/state';
import * as actions from '../store/actions/actions';
import { Clock, Pencil } from 'react-bootstrap-icons';
import { useDispatch, useSelector } from 'react-redux';
import { BACKEND_URL, S3_BUCKET, S3_REGION } from '../constants/constants';


const myBucket = new AWS.S3({
    params: { Bucket: S3_BUCKET},
    region: S3_REGION,
})

const ProfilePage = (props: any) => {
    // react hooks
    const [alertText, setAlertText] = useState('');
    const [userName, setUserName] = React.useState( '' );

    const dispatch = useDispatch();
    const data: IState = useSelector((state: any) => state.data);


    const setUserInfo = async (
        username: string
        , hasAvatar: boolean
    ) => {
        username = username ? username : data.address;
		if(data.address) {
            // update a user's display name
            dispatch(actions.setUsername(username));
            let response = await axios({
                method: 'post',
                url: BACKEND_URL+'/api/user/updateUser',
                data: {'address': data.address, 'username': username, 'hasAvatar': hasAvatar, 'token': data.token}
            });
	    }
	}

    // let the user upload an avatar
    const handleFileInput = (e: any) => {
        uploadFile(e.target.files[0])
    }

    const uploadFile = (file: any) => {
        // upload file to s3 bucket
		const params = {
            ACL: 'public-read',
            Body: file,
            Bucket: S3_BUCKET,
            Key: `${data.address}.png`
        };

		setAlertText(`Upload 0% Complete!`)
		myBucket.putObject(params)
            .on('httpUploadProgress', (evt: any) => {
				setAlertText(`Upload ${Math.round((evt.loaded / evt.total) * 100)}% Complete!`)
                // setProgress(Math.round((evt.loaded / evt.total) * 100))
                if (Math.round((evt.loaded / evt.total) * 100) >= 100) {
                    dispatch(actions.setImage(`https://trails-avatars.s3.us-east-1.amazonaws.com/${data.address}.png`))
                    setUserInfo(data.username, true);
                }
            })
            .send((err: any) => {
                if (err) console.log(err)
            })
    }
    const hiddenFileInput = React.useRef(null);
    const handleClick = (event: any) => {
        if (hiddenFileInput && hiddenFileInput.current) {
            // @ts-ignore
            hiddenFileInput.current.click();
        }
    };
    
    // show user's avatar or the first letter of their username
    const img = data.image ? <img className='icon' src={data.image} /> : 
    <div className='icon'>
        {data.address.slice(0, 1)}
    </div>
	
    return(
        <div className='settings-page'>
            <div className='settings-header'>
                <div className='pencil' onClick={handleClick} >
                    <Pencil />
                </div>
                <input ref={hiddenFileInput} type='file' className='pfp-input' accept='image/png' onChange={handleFileInput}/>
                { img }
                <div className='user'>
                    <div className='bold user-header'>
                        {data.address.slice(0, isMobile ? 8 : 20 )}...
                    </div>
                    <div className='user-subheader'>
                        {data.username ? data.username : data.address}
                    </div>
                    <div>
                        <Clock /> Joined { new Date(data.userDate).toLocaleString('en-us', { year:'numeric', month:'long'}) }
                    </div>
                </div>
            </div>
            <div style={{'paddingTop': '20px'}} >
				<div>
                    <Form>
                        <Form.Group className='mb-3' controlId='formUsername'>
                            <Form.Control value={userName} type='txId' placeholder='Enter display name' onChange={(e) => {
                                // @ts-ignore
                                setUserName(e.target.value)
                            }} />
                        </Form.Group>
							<Button style={{'width': '100%'}} disabled={ !data.address } onClick={() => {
								setUserInfo( userName, false );
							}} className='confirm-button props-button'>
								Save
							</Button>
                    </Form>
					<div>
						{alertText ? alertText : null}
					</div>
				</div>
			</div>
        </div>
    )
};

export default ProfilePage;
