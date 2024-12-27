package com.voipnotif;

import android.content.Context;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.util.Log;

public class RingtoneHandler {
    private static final String TAG = "RingtoneHandler";
    private static RingtoneHandler instance;
    private Ringtone ringtone;

    private RingtoneHandler() {
        // Private constructor to enforce singleton pattern
    }

    public static synchronized RingtoneHandler getInstance() {
        if (instance == null) {
            instance = new RingtoneHandler();
        }
        return instance;
    }

    public void startRingtone(Context context) {
        if (ringtone == null) {
            Uri soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            ringtone = RingtoneManager.getRingtone(context, soundUri);
        }
        if (ringtone != null && !ringtone.isPlaying()) {
            Log.d(TAG, "Starting ringtone");
            ringtone.play();
        } else {
            Log.d(TAG, "Ringtone is already playing or null");
        }
    }

    public void stopRingtone() {
        if (ringtone != null && ringtone.isPlaying()) {
            Log.d(TAG, "Stopping ringtone");
            ringtone.stop();
        } else {
            Log.d(TAG, "Ringtone is not playing or null");
        }
    }

    public boolean isRingtonePlaying() {
        return ringtone != null && ringtone.isPlaying();
    }
}
