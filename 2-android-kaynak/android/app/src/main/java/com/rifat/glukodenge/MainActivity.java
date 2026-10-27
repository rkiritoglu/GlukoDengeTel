package com.rifat.glukodenge;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;
import java.io.File;
import java.io.FileOutputStream;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.addJavascriptInterface(new AndroidBridge(this, webView), "AndroidBridge");
        }
    }

    public static class AndroidBridge {
        private final MainActivity activity;
        private final WebView webView;

        public AndroidBridge(MainActivity activity, WebView webView) {
            this.activity = activity;
            this.webView = webView;
        }

        @JavascriptInterface
        public void print() {
            activity.runOnUiThread(() -> {
                try {
                    PrintManager printManager = (PrintManager) activity.getSystemService(Context.PRINT_SERVICE);
                    if (printManager != null && webView != null) {
                        PrintDocumentAdapter printAdapter = webView.createPrintDocumentAdapter("GlukoDenge_Hekim_Raporu");
                        printManager.print("GlukoDenge_Hekim_Raporu", printAdapter, new PrintAttributes.Builder().build());
                    }
                } catch (Exception e) {
                    Toast.makeText(activity, "Yazdırma başlatılamadı: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void saveOrShareFile(String fileName, String content, String mimeType) {
            activity.runOnUiThread(() -> {
                try {
                    File targetFile = null;
                    boolean inPublicDownloads = false;

                    // 1. Try to write to public Downloads directory
                    try {
                        File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                        if (downloadsDir != null && (downloadsDir.exists() || downloadsDir.mkdirs())) {
                            File f = new File(downloadsDir, fileName);
                            FileOutputStream fos = new FileOutputStream(f);
                            fos.write(content.getBytes("UTF-8"));
                            fos.flush();
                            fos.close();
                            targetFile = f;
                            inPublicDownloads = true;
                        }
                    } catch (Exception ignored) {
                    }

                    // 2. Fallback to cache directory if public storage is restricted
                    if (targetFile == null || !targetFile.exists()) {
                        File f = new File(activity.getCacheDir(), fileName);
                        FileOutputStream fos = new FileOutputStream(f);
                        fos.write(content.getBytes("UTF-8"));
                        fos.flush();
                        fos.close();
                        targetFile = f;
                    }

                    // 3. Share/Save via FileProvider & Intent Chooser
                    Uri fileUri = FileProvider.getUriForFile(
                        activity,
                        activity.getPackageName() + ".fileprovider",
                        targetFile
                    );

                    Intent sendIntent = new Intent(Intent.ACTION_SEND);
                    sendIntent.setType(mimeType != null && !mimeType.isEmpty() ? mimeType : "*/*");
                    sendIntent.putExtra(Intent.EXTRA_STREAM, fileUri);
                    sendIntent.putExtra(Intent.EXTRA_SUBJECT, fileName);
                    sendIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

                    Intent chooser = Intent.createChooser(sendIntent, fileName + " - Paylaş / Kaydet");
                    chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    activity.startActivity(chooser);

                    String toastMsg = inPublicDownloads
                        ? fileName + " İndirilenler klasörüne kaydedildi."
                        : fileName + " hazırlandı.";
                    Toast.makeText(activity, toastMsg, Toast.LENGTH_LONG).show();

                } catch (Exception e) {
                    Toast.makeText(activity, "Dosya işlemi başarısız: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            });
        }
    }
}
