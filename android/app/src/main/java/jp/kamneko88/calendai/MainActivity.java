package jp.kamneko88.calendai;

import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    // ▼▼▼ Crashlytics動作確認用の一時コード。確認が済んだら必ず削除すること ▼▼▼
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Button crashButton = new Button(this);
        crashButton.setText("Test Crash (Crashlytics確認用・要削除)");
        crashButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                throw new RuntimeException("Test Crash");
            }
        });
        addContentView(crashButton, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT));
    }
    // ▲▲▲ ここまで一時コード ▲▲▲
}
