/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import RNCallKeep from 'react-native-callkeep';

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

