package com.voipnotif;

import android.app.Activity;
import android.app.KeyguardManager;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.PowerManager;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class IncomingCallActivity extends Activity {

    private static final String TAG = "IncomingCallActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Wake up the device and unlock the screen
        wakeAndUnlock();
        finish();

        /*
        // Set up a basic layout for the activity
        TextView callerName = new TextView(this);
        callerName.setText("Incoming Call from Test User");
        callerName.setTextSize(24);

        Button answerButton = new Button(this);
        answerButton.setText("Answer");
        answerButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.d(TAG, "Answer button clicked");

                // Dismiss the notification and stop the ringtone
                //dismissNotification();
                RingtoneHandler.getInstance().stopRingtone();

                //wakeAndUnlock();

                // Bring the app to the foreground
                bringAppToForeground();

                // Send event to React Native
                sendEventToJS("answerCall");

                // Show a toast for feedback
                Toast.makeText(IncomingCallActivity.this, "Call Answered", Toast.LENGTH_SHORT).show();

                // Close the activity
                finish();
            }
        });

        Button declineButton = new Button(this);
        declineButton.setText("Decline");
        declineButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.d(TAG, "Decline button clicked");

                // Dismiss the notification and stop the ringtone
                dismissNotification();
                RingtoneHandler.getInstance().stopRingtone();

                // Send event to React Native
                sendEventToJS("declineCall");

                // Show a toast for feedback
                Toast.makeText(IncomingCallActivity.this, "Call Declined", Toast.LENGTH_SHORT).show();

                // Close the activity
                finish();
            }
        });

        // Add components to layout
        android.widget.LinearLayout layout = new android.widget.LinearLayout(this);
        layout.setOrientation(android.widget.LinearLayout.VERTICAL);
        layout.addView(callerName);
        layout.addView(answerButton);
        layout.addView(declineButton);

        setContentView(layout);
        */
    }

    private void wakeAndUnlock() {
        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        KeyguardManager keyguardManager = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);

        if (powerManager != null && keyguardManager != null) {
            PowerManager.WakeLock wakeLock = powerManager.newWakeLock(
                PowerManager.FULL_WAKE_LOCK |
                        PowerManager.ACQUIRE_CAUSES_WAKEUP |
                        PowerManager.ON_AFTER_RELEASE,
                "MyApp::WakeLock"
            );
            wakeLock.acquire(3000); // Wake the device for 3 seconds

            KeyguardManager.KeyguardLock keyguardLock = keyguardManager.newKeyguardLock("MyApp::KeyguardLock");
            keyguardLock.disableKeyguard(); // Unlock the device
        }
    }

    private void dismissNotification() {
        NotificationManager notificationManager =
                (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (notificationManager != null) {
            notificationManager.cancel(IntentLauncherModule.NOTIFICATION_ID);
            Log.d(TAG, "Notification dismissed from IncomingCallActivity");
        }
    }

    private void bringAppToForeground() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK |
                Intent.FLAG_ACTIVITY_CLEAR_TOP |
                Intent.FLAG_ACTIVITY_SINGLE_TOP);
        startActivity(intent);
    }

    private void sendEventToJS(String eventName) {
        ReactApplication reactApplication = (ReactApplication) getApplication();
        ReactApplicationContext reactContext =
                (ReactApplicationContext) reactApplication.getReactNativeHost()
                        .getReactInstanceManager()
                        .getCurrentReactContext();

        if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, null);
            Log.d(TAG, "Event sent to React Native: " + eventName);
        } else {
            Log.w(TAG, "React Native context not available");
        }
    }
}
