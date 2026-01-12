# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Preserve line number information for debugging stack traces
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*

# Keep all Capacitor classes and methods
-keep class com.getcapacitor.** { *; }
-keepclassmembers class com.getcapacitor.** { *; }

# Keep WebView JavaScript interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep all classes that extend BridgeActivity
-keep public class * extends com.getcapacitor.BridgeActivity

# Keep MainActivity
-keep class com.universitaria.uniapp.MainActivity { *; }

# Keep Capacitor Plugin classes
-keep class * extends com.getcapacitor.Plugin
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.PluginMethod public *;
    @com.getcapacitor.annotation.* public *;
}

# Keep WebView classes
-keepclassmembers class * extends android.webkit.WebView {
   public *;
}

# Keep JavaScript interface classes
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Suppress warnings for missing classes
-dontwarn com.getcapacitor.**

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# AndroidX
-keep class androidx.** { *; }
-keep interface androidx.** { *; }

# Supabase / OkHttp / Retrofit (if used)
-dontwarn okhttp3.**
-dontwarn retrofit2.**
-keep class okhttp3.** { *; }
-keep class retrofit2.** { *; }
