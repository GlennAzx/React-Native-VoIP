package com.voipnotif;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import android.util.Log;
import android.app.NotificationManager;

public class CallForegroundService extends Service {
    public static final String CHANNEL_ID = "ForegroundServiceChannel";
    public static final String ACTION_START_RINGING = "ACTION_START_RINGING";
    public static final String ACTION_STOP_RINGING = "ACTION_STOP_RINGING";
    private static final String TAG = "CallForegroundService";
    public static final int NOTIFICATION_ID = 1;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || intent.getAction() == null) {
            
            Log.w(TAG, "Service restarted without intent or action. Using default behavior.");
            
            return START_STICKY;
        }

        NotificationManager notificationManager =
            (NotificationManager) this.getSystemService(Context.NOTIFICATION_SERVICE);

        String action = intent.getAction();
        switch (action) {
            case ACTION_START_RINGING:
                startForeground(NOTIFICATION_ID, buildForegroundNotification());
                break;
            case ACTION_STOP_RINGING:
                stopForeground(true);
                stopSelf();
                notificationManager.cancel(NOTIFICATION_ID);
                break;
            default:
                Log.w(TAG, "Unknown action: " + action);
                break;
        }
        return START_STICKY;
    }

    private Notification buildForegroundNotification() {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.sym_call_incoming)
            .setContentTitle("Ringing")
            .setContentText("Incoming call is active.")
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE);
        return builder.build();
    }

    private void startForegroundServiceNotification() {
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Incoming Call")
                .setContentText("Ringing...")
                .setSmallIcon(android.R.drawable.sym_call_incoming)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_CALL)
                .setAutoCancel(false)
                .setOngoing(true)
                .build();
        startForeground(1, notification);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Foreground Service Channel",
                    NotificationManager.IMPORTANCE_HIGH
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public void onDestroy() {
        RingtoneHandler.getInstance().stopRingtone();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
