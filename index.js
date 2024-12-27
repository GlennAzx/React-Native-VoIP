/**
 * @format
 */

import {AppRegistry, NativeModules, Linking} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import RNCallKeep from 'react-native-callkeep';
import { AppState, DeviceEventEmitter } from 'react-native';
import IncomingCall from 'react-native-incoming-call';

const { IntentLauncherModule } = NativeModules;

const headlessTask = async (remoteMessage) => {

    console.log('Headless message received:', remoteMessage);
    console.log('Available Native Modules:', NativeModules);

    try {
        //NativeModules.ForegroundService.startService("Title", "Message");
        //ForegroundService.startService();

        
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

        console.log('Waiting for app to enter foreground state...');


        const { data } = remoteMessage;
        
        if ('voip' === data?.type) {
            const callId = data.call_id || data.uuid;
            const callerName = data.caller_name || data.callerName;

            
            IntentLauncherModule.showIncomingCallNotification(
                callerName      
            );

            //RNCallKeep.backToForeground
            
            console.log('Back to foreground');
            
            //Wait for appto be brough to foreground
            const waitForForeground = new Promise((resolve) => {
                const checkAppState = (state) => {
                    if (state === 'active') {
                        resolve();
                    }
                };

                AppState.addEventListener('change', checkAppState);

            });
            

            await waitForForeground;

            

            /*IncomingCall.display(
                callId,
                callerName,
                null,
                'Incoming Call',
                20000
            );
            */
            const answerCallListener = DeviceEventEmitter.addListener("answerCall", (payload) => {
                if (payload.isHeadless) {
                    IncomingCall.openAppFromHeadlessMode(payload.uuid);
                }
            });

        } else if (remoteMessage?.notification?.title === 'Missed Call') {
            IncomingCall.dismiss();
        }
    } catch (error) {
        console.log('Headless task error:', error);
    }

}


messaging().setBackgroundMessageHandler(headlessTask);
    

AppRegistry.registerComponent(appName, () => App);

