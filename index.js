/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import RNCallKeep from 'react-native-callkeep';
import { AppState, DeviceEventEmitter } from 'react-native';
import IncomingCall from 'react-native-incoming-call';


RNCallKeep.setup({
    ios: {
        appName: 'YourAppName',
    },
    android: {
        alertTitle: 'Permissions required',
        alertDescription: 'This application needs to access your phone accounts',
        cancelButton: 'Cancel',
        okButton: 'Ok',
    },
});

RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
    console.log('Call answered:', callUUID);
    //RNCallKeep.setCurrentCallActive(callUUID);
    RNCallKeep.endCall(callUUID);
    
});



RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
    console.log('Call ended:', callUUID);
    RNCallKeep.endCall(callUUID);
});



messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background message received:', remoteMessage);
    

    try {
        const { data } = remoteMessage;

        if ('voip' === data?.type) {
            const callId = data.call_id || data.uuid;
            const handle = data.handle;
            const callerName = data.caller_name || data.callerName;
            IncomingCall.display(
                callId,
                callerName,
                null,
                'Incoming Call',
                20000
            );

            console.log('Displaying incoming call:', { callId, handle, callerName });
        } else if (remoteMessage?.notification?.title === 'Missed Call') {
            IncomingCall.dismiss();
        }

        const endCallListener = DeviceEventEmitter.addListener("endCall", ( payload => {
            //End call action here
        }));
        const answerCallListener  = DeviceEventEmitter.addListener("answerCall", (payload) => {
            console.log('answerCall', payload);
            if (payload.isHeadless){
                //Called from killed state
                console.log('Headless mode');
                IncomingCall.openAppFromHeadlessMode(payload.uuid);
            } else{
                IncomingCall.backToForeground();
            }
        });

    } catch (error) {
        console.log('Background handler error:', error);
    }
});

AppRegistry.registerComponent(appName, () => App);

