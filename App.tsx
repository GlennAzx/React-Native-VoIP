/**
 * Updated React Native App for CallKeep integration with FCM support
 * @format
 */
import React, { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform, Alert, Linking, Button, NativeModules, DeviceEventEmitter} from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import IncomingCall from 'react-native-incoming-call';
import OverlayPermissionModule from 'rn-android-overlay-permission';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {
  Colors,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
  DebugInstructions,
} from 'react-native/Libraries/NewAppScreen';

console.log('Available NativeModules:', NativeModules);
console.log('IncomingCall Module:', NativeModules.IncomingCall);

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
    //this.setupEventListeners();
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
    selfManaged: true, // Critical: Set to false to use Android's built-in UI
  },
};


const checkPermissions = async () => {
  try {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
    ];

    if (Number(Platform.Version) >= 33) {
      permissions.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }

    const results = await PermissionsAndroid.requestMultiple(permissions);
    console.log('Permissions granted:', results);

    console.log('Permissions granted:', results);

    // Using Object.entries to iterate over permission results
    Object.entries(results).forEach(([permission, status]) => {
      console.log(`Permission ${permission}: ${status}`);
    });
  

    if ((Number(Platform.Version) >= 33) && results[PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS] === 'never_ask_again') {
      handlePermissionNeverAskAgain();
      return false;
    }

    return Object.values(results).every((result) => result === PermissionsAndroid.RESULTS.GRANTED);
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }


  /*
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
  */

    
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

    const hasAccount = await RNCallKeep.checkPhoneAccountEnabled();
    
    if (!hasAccount) {
      console.log('Phone account registered successfully.');
    }

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


const OverlayInit = async () => {
  OverlayPermissionModule.isRequestOverlayPermissionGranted((status: any) => {
    if (status) {
      Alert.alert(
        "Permissions",
        "Overlay Permission",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: "OK",
            onPress: () => OverlayPermissionModule.requestOverlayPermission(),
          },
        ],
        { cancelable: false }
      );
    }
  });
};

const App = (): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeCall, setActiveCall] = useState(null);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {

  
    const initializeApp = async () => {
      //await checkPermissions();
      //await requestUserPermission();
      await getToken();
      await setupCallKeep();
      await OverlayInit();

      return () => {
        console.log('Cleaning up ActivityReady listener');
        
      };
    };

    initializeApp();


  

    // Event Listeners for CallKeep
    RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
      console.log('Call answered:', callUUID);
      //RNCallKeep.setCurrentCallActive(callUUID);
      RNCallKeep.endCall(callUUID);
   
    });

    RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
      console.log('Call ended:', callUUID);
      RNCallKeep.endCall(callUUID);
    });

    RNCallKeep.addEventListener('didPerformSetMutedCallAction', ({ muted, callUUID }) => {
      console.log('Call muted:', callUUID, muted);
      RNCallKeep.setMutedCall(callUUID, muted);
    });

    RNCallKeep.addEventListener('didToggleHoldCallAction', ({ hold, callUUID }) => {
      console.log('Call hold:', callUUID, hold);
      RNCallKeep.setOnHold(callUUID, hold);
    });


    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
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
  

    return () => {
      endCallListener.remove();
      answerCallListener.remove();

      RNCallKeep.removeEventListener('answerCall');
      RNCallKeep.removeEventListener('endCall');
      RNCallKeep.removeEventListener('didPerformSetMutedCallAction');
      RNCallKeep.removeEventListener('didToggleHoldCallAction');
      unsubscribe();
    };
  }, []);

  const handleIncomingCall = (remoteMessage) => {
    console.log('Handling Incoming Call:', remoteMessage.data);
  
    const callUUID = remoteMessage.data?.call_id || 'default-uuid';
    const callerName = remoteMessage.data?.caller_name || 'Unknown Caller';
    const handle = remoteMessage.data?.handle || 'Unknown Number';
  
    try {
      console.log('Calling RNCallKeep.displayIncomingCall with UUID:', callUUID, 'Name:', callerName, 'Handle:', handle);
      setActiveCall(remoteMessage);
    }
    catch (error) {
      console.error('Error in RNCallKeep.displayIncomingCall:', error);
    }
  };

  const simulateIncomingCall = async () => {
    const uuid = 'test-call-uuid-12345';
    const callerName = 'Test User';
    const handle = '+1234567890';
  
    try {

      console.log('Available RNCallKeep methods:', Object.keys(RNCallKeep));
      const hasAccount = await RNCallKeep.checkPhoneAccountEnabled();
      if (!hasAccount) {
        Alert.alert('Phone Account Required', 'Please enable the phone account in system settings');
        return;
      }
  
      console.log('Simulating incoming call...');

      // Direct service test
      //RNCallKeep.testServiceConnection(uuid, handle, callerName);

      RNCallKeep.displayIncomingCall(uuid, handle, callerName, 'generic', true);

      // Check if call enters managed state
      const isManaged = await RNCallKeep.checkIsInManagedCall();
      console.log('Is call in managed state:', isManaged);

      
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

            {activeCall && (
              <Modal visible={true} animationType="slide" transparent={true}>
                <View style={styles.callModal}>
                  <View style={styles.callerInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {activeCall.callerName?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.callerName}>{activeCall.callerName}</Text>
                    <Text style={styles.callerNumber}>{activeCall.handle}</Text>
                  </View>
            
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.rejectCall]}
                      onPress={() => {
                        RNCallKeep.endCall(activeCall.uuid);
                        setActiveCall(null);
                      }}
                    >
                      <Text style={styles.buttonText}>Decline</Text>
                    </TouchableOpacity>
              
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.acceptCall]}
                      onPress={() => {
                        RNCallKeep.answerIncomingCall(activeCall.uuid);
                        // Handle call acceptance logic
                      }}
                    >
                      <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}
          </SafeAreaView>
        );
      };

export default App;
