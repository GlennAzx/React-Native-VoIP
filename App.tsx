/**
 * Updated React Native App for CallKeep integration with FCM support
 * @format
 */

import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform, Alert, Linking, Button } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {
  Colors,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
  DebugInstructions,
} from 'react-native/Libraries/NewAppScreen';

class CallKeep {
  private static instance: CallKeep;
  private callId: string;
  private callerName: string;
  private callerId: string;
  private isAudioCall?: boolean;
  public isRinging: boolean = false;

  constructor(callId: string, callerName: string, callerId: string, isAudioCall?: boolean) {
    this.callId = callId;
    this.callerName = callerName;
    this.callerId = callerId;
    this.isAudioCall = isAudioCall;

    CallKeep.instance = this;
    this.setupEventListeners();
  }

  static getInstance(): CallKeep {
    return CallKeep.instance;
  }

  displayCall = () => {
    this.isRinging = true;
    RNCallKeep.displayIncomingCall(this.callId, this.callerId, this.callerName, 'generic', this.isAudioCall);
    setTimeout(() => {
      if (this.isRinging) {
        this.isRinging = false;
        RNCallKeep.reportEndCallWithUUID(this.callId, 6); // 6 = MissedCall
      }
    }, 15000); // Timeout for missed call
  };

  endCall = () => {
    RNCallKeep.endCall(this.callId);
    this.removeEventListeners();
  };

  answerCall = () => {
    this.isRinging = false;
    console.log(`Answered call: ${this.callerName}`);
    // Navigate to in-call screen if needed
  };

  private setupEventListeners = () => {
    RNCallKeep.addEventListener('endCall', this.endCall);
    RNCallKeep.addEventListener('answerCall', this.answerCall);
  };

  private removeEventListeners = () => {
    RNCallKeep.removeEventListener('endCall');
    RNCallKeep.removeEventListener('answerCall');
  };
}

const handlePermissionNeverAskAgain = () => {
  Alert.alert(
    'Permission Required',
    'The app requires POST_NOTIFICATIONS permission to function properly. Please enable it in the app settings.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ]
  );
};

const options = {
  ios: {
    appName: 'YourAppName',
  },
  android: {
    alertTitle: 'Permissions required',
    alertDescription: 'This application needs to access your phone accounts',
    cancelButton: 'Cancel',
    okButton: 'Ok',
    imageName: 'phone_account_icon',
    additionalPermissions: [
      PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ],
    foregroundService: {
      channelId: 'com.company.my',
      channelName: 'Foreground service for my app',
      notificationTitle: 'My app is running on background',
      notificationIcon: 'Path to the resource icon of the notification',
    }, 
    capabilities: {
      supportsVideo: true, // Ensure it's false if you don't need video calls
      supportsHold: true,
    },
    selfManaged: false, // Critical: Set to false to use Android's built-in UI
  },
};


const checkPermissions = async () => {
  try {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ];

    if (Number(Platform.Version) >= 33) {
      permissions.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }

    const results = await PermissionsAndroid.requestMultiple(permissions);
    console.log('Permissions granted:', results);

    if ((Number(Platform.Version) >= 33) && results[PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS] === 'never_ask_again') {
      handlePermissionNeverAskAgain();
      return false;
    }

    return Object.values(results).every((result) => result === PermissionsAndroid.RESULTS.GRANTED);
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};

const handleIncomingCall = (remoteMessage) => {
  console.log('Handling Incoming Call:', remoteMessage.data);

  const callUUID = remoteMessage.data?.call_id || 'default-uuid';
  const callerName = remoteMessage.data?.caller_name || 'Unknown Caller';
  const handle = remoteMessage.data?.handle || 'Unknown Number';

  try {
    console.log('Calling RNCallKeep.displayIncomingCall with UUID:', callUUID, 'Name:', callerName, 'Handle:', handle);
    RNCallKeep.displayIncomingCall(callUUID, handle, callerName, 'generic', true);

    RNCallKeep.checkIsInManagedCall()
      .then((isInManagedCall) => {
        console.log('Is call in managed state:', isInManagedCall);
        if (!isInManagedCall) {
          console.warn('Call is not entering managed state. Check PhoneAccount and ConnectionService.');
        }
      })
      .catch((error) => {
        console.error('Error checking managed call state:', error);
      });

  } catch (error) {
    console.error('Error in RNCallKeep.displayIncomingCall:', error);
  }
};

const requestUserPermission = async () => {
  const granted = await checkPermissions();
  if (!granted) {
    console.warn('Required permissions not granted');
    return;
  }

  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Notification permission granted:', authStatus);
    } else {
      console.warn('Notification permission not granted.');
    }
  } catch (error) {
    console.error('Error requesting user permission:', error);
  }
};

const setupCallKeep = async () => {
  // Add delay to ensure activity is ready
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    const granted = await checkPermissions();
    if (!granted) {
      console.warn('Permissions not granted, skipping CallKeep setup');
      return;
    }

    await RNCallKeep.setup(options);
    RNCallKeep.setAvailable(true);
    console.log('RNCallKeep initialized successfully.');
  } catch (error) {
    console.error('Error setting up CallKeep:', error);
  }
};


const getToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('Token:', token);
  } catch (error) {
    console.error('Error fetching token:', error);
  }
};

const App = (): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    const initializeApp = async () => {
      await requestUserPermission();
      await getToken();
      await setupCallKeep();
    };

    initializeApp();

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('FCM Message Received:', remoteMessage);

      if (remoteMessage.data?.type === 'voip') {
        handleIncomingCall(remoteMessage);
      } else {
        console.warn('Unhandled FCM message type:', remoteMessage.data?.type);
      }
    });

    return () => unsubscribe();
  }, []);

  const simulateIncomingCall = async () => {
    const uuid = 'test-call-uuid-12345';
    const callerName = 'Test User';
    const handle = '+1234567890';
  
    try {
      const hasAccount = await RNCallKeep.checkPhoneAccountEnabled();
      if (!hasAccount) {
        Alert.alert('Phone Account Required', 'Please enable the phone account in system settings');
        return;
      }
  
      console.log('Simulating incoming call...');
      RNCallKeep.displayIncomingCall(uuid, handle, callerName, 'generic', true);
    } catch (error) {
      console.error('Error simulating incoming call:', error);
      Alert.alert('Error', 'Failed to simulate incoming call. Check logs.');
    }
  };
  

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView>
        <Header />
        <View style={{ backgroundColor: isDarkMode ? Colors.black : Colors.white }}>
          <Text>Welcome to the CallKeep Integration App!</Text>
          <Button title="Simulate Incoming Call" onPress={simulateIncomingCall} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Add any custom styles
});

export default App;
