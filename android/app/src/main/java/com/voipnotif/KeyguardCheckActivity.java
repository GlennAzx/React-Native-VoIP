package com.voipnotif;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

public class KeyguardCheckActivity extends Activity {
    private static final String TAG = "[KeyguardCheckActivity]";
    private static final int REQUEST_CODE_CONFIRM_DEVICE_CREDENTIALS = 101;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        KeyguardManager keyguardManager = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
        if (keyguardManager != null && keyguardManager.isKeyguardLocked()) {
            Log.d(TAG, "Device is locked, prompting for credentials");
            Intent unlockIntent = keyguardManager.createConfirmDeviceCredentialIntent(
                "Unlock Your Device",
                "Please unlock to answer the call."
            );
            
            if (unlockIntent != null) {
                startActivityForResult(unlockIntent, REQUEST_CODE_CONFIRM_DEVICE_CREDENTIALS);
                return; // Wait for the result
            }
        }

        // If the device is not locked or we couldn't create the intent, just go directly to main
        goToMainActivity();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_CODE_CONFIRM_DEVICE_CREDENTIALS) {
            if (resultCode == RESULT_OK) {
                // User successfully unlocked
                Log.d(TAG, "Unlock successful. Going to MainActivity.");
                goToMainActivity();
            } else {
                // Unlock failed or canceled
                Log.d(TAG, "Unlock failed/canceled by user.");
            }
            finish();
        }
    }

    private void goToMainActivity() {
        Intent launchIntent = new Intent(this, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(launchIntent);
        finish();
    }
}
