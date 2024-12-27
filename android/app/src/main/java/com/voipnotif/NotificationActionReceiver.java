package com.voipnotif;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import android.util.Log;
import android.media.RingtoneManager;


public class NotificationActionReceiver extends BroadcastReceiver {
    private static final String TAG = "NotificationActionReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();

        // Retrieve the ReactApplicationContext
        ReactApplication reactApplication = (ReactApplication) context.getApplicationContext();
        ReactApplicationContext reactContext = 
            (ReactApplicationContext) reactApplication.getReactNativeHost()
                .getReactInstanceManager()
                .getCurrentReactContext();

        NotificationManager notificationManager = 
            (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        if ("ACTION_ANSWER_CALL".equals(action)) {
            Log.d(TAG, "Answer action clicked");

            // Dismiss the notification and stop ringing
            dismissNotification(notificationManager);
            RingtoneHandler.getInstance().stopRingtone();

            // Start the app's MainActivity
            Intent launchIntent = new Intent(context, MainActivity.class);
            launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            context.startActivity(launchIntent);

            // Send event to React Native
            if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
                sendEventToJS(reactContext, "answerCall");
            }
        } else if ("ACTION_DECLINE_CALL".equals(action)) {
            Log.d(TAG, "Decline action clicked");
            // Dismiss the notification and stop ringing
            dismissNotification(notificationManager);
            RingtoneHandler.getInstance().stopRingtone();

            // Send event to React Native
            if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
                sendEventToJS(reactContext, "declineCall");
            }
        }
    }

    private void dismissNotification(NotificationManager notificationManager) {
        if (notificationManager != null) {
            notificationManager.cancel(IntentLauncherModule.NOTIFICATION_ID);
            Log.d(TAG, "Notification dismissed");
        }
    }


    private void sendEventToJS(ReactApplicationContext reactContext, String eventName) {
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, null);
        }
    }
}
