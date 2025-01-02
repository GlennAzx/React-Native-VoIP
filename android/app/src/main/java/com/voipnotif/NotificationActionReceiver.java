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
import android.app.KeyguardManager;



public class NotificationActionReceiver extends BroadcastReceiver {
    private static final String TAG = "[NotificationActionReceiver]";

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

            // Prompt unlock screen
            KeyguardManager keyguardManager = (KeyguardManager) context.getSystemService(Context.KEYGUARD_SERVICE);
            boolean locked = keyguardManager != null && keyguardManager.isKeyguardLocked();
            
            //KeyguardCheckActivity 
            Intent checkIntent = new Intent(context, KeyguardCheckActivity.class);
            checkIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(checkIntent);

            // Dismiss the notification and stop ringing
            dismissNotification(notificationManager);
            RingtoneHandler.getInstance().stopRingtone();

            /* moved launch to KeyguardCheckActivity.java for handling after check
            // Start the app's MainActivity
            Intent launchIntent = new Intent(context, MainActivity.class);
            launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            context.startActivity(launchIntent);
            */
            
            /*
            // Stop the foreground service
            Intent serviceIntent = new Intent(context, CallForegroundService.class);
            serviceIntent.setAction(CallForegroundService.ACTION_STOP_RINGING);
            context.startService(serviceIntent);
            */


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
            // Stop the foreground service
            Intent serviceIntent = new Intent(context, CallForegroundService.class);
            serviceIntent.setAction(CallForegroundService.ACTION_STOP_RINGING);
            context.startService(serviceIntent);

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
