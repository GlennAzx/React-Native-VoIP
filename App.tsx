/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
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

type SectionProps = {
  title: string;
  children: React.ReactNode;
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
      channelId: 'com.yourapp.channel',
      channelName: 'Foreground service for My App',
      notificationTitle: 'My App is running in the background',
    },
  },
};

const handleIncomingCall = (remoteMessage: any) => {
  console.log('Calling RNCallKeep.displayIncomingCall with:', remoteMessage.data);

  const callUUID = remoteMessage.data?.call_id || 'default-uuid';
  const callerName = remoteMessage.data?.caller_name || 'Unknown Caller';
  const handle = remoteMessage.data?.handle || 'Unknown Number';

  try {
    RNCallKeep.displayIncomingCall(callUUID, handle, callerName, 'generic', true);
    console.log('RNCallKeep.displayIncomingCall executed successfully.');
  } catch (error) {
    console.error('Error in RNCallKeep.displayIncomingCall:', error);
  }
};

const requestUserPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'VoIP Notification Permission',
        message: 'VoIP needs to send you notifications for incoming calls',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  } catch (error) {
    console.error('Permission request failed:', error);
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

function Section({ children, title }: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const App = (): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    const setupCallKeep = async () => {
      try {
        await RNCallKeep.setup(options); // CallKeep setup
        RNCallKeep.setAvailable(true); // Set app as call-ready
        console.log('RNCallKeep initialized successfully.');
      } catch (error) {
        console.error('Error initializing RNCallKeep:', error);
      }
    };

    const initializeApp = async () => {
      await requestUserPermission();
      await getToken();
      await setupCallKeep();
    };

    initializeApp();

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      try {
        console.log('FCM Message Received:', remoteMessage);
        if (remoteMessage.data?.type === 'voip') {
          handleIncomingCall(remoteMessage);
        }
      } catch (error) {
        console.error('Error handling incoming message:', error);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}
        >
          <Section title="Step One">
            Edit <Text style={styles.highlight}>App.tsx</Text> to change this screen and then come back to see your
            edits.
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">Read the docs to discover what to do next:</Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
