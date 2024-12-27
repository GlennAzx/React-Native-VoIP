package com.voipnotif;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import androidx.core.app.NotificationCompat;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.voipnotif.NotificationActionReceiver;
import com.voipnotif.IncomingCallActivity;

public class IntentLauncherModule extends ReactContextBaseJavaModule {
    private static final String CHANNEL_ID = "incoming_call_channel";
    public static final int NOTIFICATION_ID = 1;
    private Ringtone ringtone;

    public IntentLauncherModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "IntentLauncherModule";
    }

    @ReactMethod
    public void showIncomingCallNotification(String callerName) {
        Context context = getReactApplicationContext();
        createNotificationChannel(context);

        // Intent for Answer Action
        Intent answerIntent = new Intent(context, NotificationActionReceiver.class);
        answerIntent.setAction("ACTION_ANSWER_CALL");
        PendingIntent answerPendingIntent = PendingIntent.getBroadcast(
            context, 0, answerIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // Intent for Decline Action
        Intent declineIntent = new Intent(context, NotificationActionReceiver.class);
        declineIntent.setAction("ACTION_DECLINE_CALL");
        PendingIntent declinePendingIntent = PendingIntent.getBroadcast(
            context, 0, declineIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // Notification Intent (activity to launch for full-screen intent)
        Intent notificationIntent = new Intent(context, IncomingCallActivity.class);
        notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
            context, 0, notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // Start the ringtone using RingtoneHandler
        RingtoneHandler.getInstance().startRingtone(context);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.sym_call_incoming)
            .setContentTitle("Incoming Call")
            .setContentText("Call from: " + callerName)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setFullScreenIntent(fullScreenPendingIntent, true)
            .addAction(android.R.drawable.sym_action_call, "Answer", answerPendingIntent)
            .addAction(android.R.drawable.sym_action_call, "Decline", declinePendingIntent)
            .setSound(null) // Disable default sound, use Ringtone for custom control
            .setAutoCancel(false)
            .setOngoing(true);

        NotificationManager notificationManager =
            (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        // Show the notification
        if (notificationManager != null) {
            notificationManager.notify(NOTIFICATION_ID, builder.build());
        }

        // Schedule the notification dismissal after 20 seconds
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (notificationManager != null) {
                notificationManager.cancel(NOTIFICATION_ID);
            }
            // Stop the ringtone using RingtoneHandler
            RingtoneHandler.getInstance().stopRingtone();
        }, 20000); // 20 seconds
    }

    private void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Incoming Call Notifications",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Notification channel for incoming calls");
            NotificationManager manager =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }
}
