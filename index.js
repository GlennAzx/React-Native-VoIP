/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import RNCallKeep from 'react-native-callkeep';
import { AppState } from 'react-native';

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
    RNCallKeep.backToForeground();
    
    let hasActivated = false;
    const appStateListener = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active' && !hasActivated) {
            hasActivated = true;
            RNCallKeep.setCurrentCallActive(callUUID);
            appStateListener.remove();
        }
    });
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
            // Match the payload structure from your FCM message
            const callId = data.call_id || data.uuid;
            const handle = data.handle;
            const callerName = data.caller_name || data.callerName;
            
            console.log('Displaying incoming call:', { callId, handle, callerName });
            RNCallKeep.displayIncomingCall(callId, handle, callerName, 'generic', true);
        }
    } catch (error) {
        console.log('Background handler error:', error);
    }
});

AppRegistry.registerComponent(appName, () => App);

