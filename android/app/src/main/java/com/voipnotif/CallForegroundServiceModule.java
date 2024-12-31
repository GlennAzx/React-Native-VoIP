package com.voipnotif;

import android.content.Context;
import android.content.Intent;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class CallForegroundServiceModule extends ReactContextBaseJavaModule {
    public CallForegroundServiceModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "CallForegroundService"; // Module name exposed to React Native
    }

    @ReactMethod
    public void startRingingService() {
        Context context = getReactApplicationContext();
        Intent serviceIntent = new Intent(context, CallForegroundService.class);
        serviceIntent.setAction(CallForegroundService.ACTION_START_RINGING);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent);
        } else {
            context.startService(serviceIntent);
        }
    }

    @ReactMethod
    public void stopRingingService() {
        Context context = getReactApplicationContext();
        Intent serviceIntent = new Intent(context, CallForegroundService.class);
        serviceIntent.setAction(CallForegroundService.ACTION_STOP_RINGING);
        context.startService(serviceIntent);
    }
}
