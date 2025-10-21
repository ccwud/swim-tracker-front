package com.swimtracker.app;

import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onResume() {
        super.onResume();
        WebView.setWebContentsDebuggingEnabled(true);
    }
}
