# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# --- R8有効化(2026-09-18)にあたっての調査結果 ---
#
# 1. Capacitorプラグイン本体(GoogleAuth.java, BiometricAuthNative.java)は
#    @capacitor/android の consumerProguardFiles (proguard-rules.pro内の
#    "-keep public class * extends com.getcapacitor.Plugin { *; }" 等)により
#    自動的にkeepされる。両クラスとも実際に @CapacitorPlugin + Plugin継承である
#    ことをソースで確認済み。追加ルール不要。
#
# 2. androidx.biometric:1.1.0(@aparajita/capacitor-biometric-authが使用)は
#    AAR自身にproguard.txtを同梱しており、AGPが自動適用する。実際にAARを展開して
#    proguard.txtの同梱を確認済み。追加ルール不要。
#
# 3. @codetrix-studio/capacitor-google-authが使うcom.google.android.gms:
#    play-services-auth:18.1.0(実解決バージョン)自体にはproguard.txtの同梱は無いが、
#    実際にGoogleSignInAccount/GoogleSignInOptionsが定義されているのは推移的依存の
#    play-services-base:17.1.0であり、さらにその依存のplay-services-basement:17.1.1が
#    SafeParcelable/ReflectedParcelable/CREATOR/@KeepNameを守る公式consumer proguard.txtを
#    同梱している(いずれもAARを展開して実際に確認済み)。これもAGPが自動適用するため
#    追加ルールは本来不要だが、将来の依存バージョン変更でこの同梱ルールが変わった場合の
#    保険として、同梱内容と同一のルールを以下に明示的に複製しておく。
-keepnames class * implements com.google.android.gms.common.internal.ReflectedParcelable
-keepclassmembers class * implements android.os.Parcelable {
    public static final *** CREATOR;
}
-keep @interface com.google.android.gms.common.annotation.KeepName
-keepnames @com.google.android.gms.common.annotation.KeepName class *
-keepclassmembernames class * {
    @com.google.android.gms.common.annotation.KeepName *;
}
