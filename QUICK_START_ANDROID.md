# Quick Start: Android APK Build

## What You Need
1. **Android Studio** - Download: https://developer.android.com/studio
2. **JDK 17+** - Download: https://adoptium.net/

## 3 Simple Steps

### Step 1: Install Prerequisites
```bash
# Install Android Studio (follow installer)
# Install JDK 17+ (follow installer)
# Accept Android SDK licenses in Android Studio
```

### Step 2: Sync Project
```bash
npm run android:sync
```

### Step 3: Build APK
```bash
npm run android:open
```

Then in Android Studio:
- **Build** menu → **Build Bundle(s) / APK(s)** → **Build APK(s)**

Your APK will be here:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Install on Android Device

1. Transfer APK to your phone
2. Enable "Install from Unknown Sources" in Settings
3. Tap APK file to install
4. Launch "Health Companion" app

## That's It!

For detailed instructions, signing, and Play Store upload, see **ANDROID_BUILD.md**
