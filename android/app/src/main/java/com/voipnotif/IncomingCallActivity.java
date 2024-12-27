package com.voipnotif;

import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;
import android.widget.Button;
import android.view.View;
import android.widget.Toast;

public class IncomingCallActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Set up a basic layout for the activity
        TextView callerName = new TextView(this);
        callerName.setText("Incoming Call from Test User");
        callerName.setTextSize(24);

        Button answerButton = new Button(this);
        answerButton.setText("Answer");
        answerButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(IncomingCallActivity.this, "Call Answered", Toast.LENGTH_SHORT).show();
                finish(); // Close the activity
            }
        });

        Button declineButton = new Button(this);
        declineButton.setText("Decline");
        declineButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(IncomingCallActivity.this, "Call Declined", Toast.LENGTH_SHORT).show();
                finish(); // Close the activity
            }
        });

        // Add components to layout
        android.widget.LinearLayout layout = new android.widget.LinearLayout(this);
        layout.setOrientation(android.widget.LinearLayout.VERTICAL);
        layout.addView(callerName);
        layout.addView(answerButton);
        layout.addView(declineButton);

        setContentView(layout);
    }
}
