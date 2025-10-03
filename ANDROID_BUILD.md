# Building Health Companion Android App

## Prerequisites

### 1. Install Android Studio
- Download from: https://developer.android.com/studio
- Install with Android SDK and Android SDK Platform-Tools
- Accept Android SDK licenses

### 2. Install Java Development Kit (JDK)
- JDK 17 or higher required
- Download from: https://adoptium.net/
- Set JAVA_HOME environment variable

### 3. Set Environment Variables
Add to your system PATH:
- `%LOCALAPPDATA%\Android\Sdk\platform-tools`
- `%LOCALAPPDATA%\Android\Sdk\tools`
- `%JAVA_HOME%\bin`

## Build Instructions

### Option 1: Build APK (Recommended for Testing)

```bash
# Sync web assets to Android project
npm run android:sync

# Open Android Studio to build
npm run android:open
```

In Android Studio:
1. Wait for Gradle sync to complete
2. Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
3. APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Command Line Build

```bash
# Build release APK (requires signing key)
npm run android:build
```

Output: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Option 3: Manual Gradle Build

```bash
# Build debug APK
cd android
gradlew assembleDebug

# Build release APK
gradlew assembleRelease
```

## APK Locations

**Debug APK** (for testing):
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**Release APK** (for distribution):
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

## Signing the APK (For Google Play Store)

### 1. Generate Signing Key

```bash
keytool -genkey -v -keystore health-companion.keystore -alias health-companion -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configure Signing in Android

Create `android/key.properties`:
```
storePassword=your_keystore_password
keyPassword=your_key_password
keyAlias=health-companion
storeFile=../health-companion.keystore
```

### 3. Update `android/app/build.gradle`

Add before `android` block:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Add inside `android` block:
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### 4. Build Signed APK

```bash
cd android
gradlew assembleRelease
```

Signed APK: `android/app/build/outputs/apk/release/app-release.apk`

## App Configuration

### Update App Name/ID
Edit `capacitor.config.ts`:
```typescript
const config: CapacitorConfig = {
  appId: 'com.healthcompanion.app',
  appName: 'Health Companion',
  webDir: 'dist'
};
```

### Update Android Manifest
Edit `android/app/src/main/AndroidManifest.xml` to add permissions:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Update App Icon
Replace icons in:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- `android/app/src/main/res/mipmap-*/ic_launcher_round.png`

## Testing on Device

### Via Android Studio:
1. Enable USB Debugging on your Android device
2. Connect device via USB
3. Click **Run** > **Run 'app'** in Android Studio

### Via ADB:
```bash
# Install debug APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# View logs
adb logcat
```

## Common Issues

### Gradle Build Failed
```bash
cd android
gradlew clean
gradlew build --stacktrace
```

### SDK Licenses Not Accepted
```bash
cd %LOCALAPPDATA%\Android\Sdk\tools\bin
sdkmanager --licenses
```

### Java Version Issues
Ensure JDK 17+ is installed and JAVA_HOME is set correctly:
```bash
java -version
echo %JAVA_HOME%
```

### Port 3000 In Use
Stop the Vite dev server before building:
```bash
# Kill process on port 3000
npx kill-port 3000
```

## Distribution

### Google Play Store
1. Create signed release APK
2. Create developer account: https://play.google.com/console
3. Upload APK through Google Play Console
4. Complete store listing and publish

### Direct Download
Distribute the APK file directly:
- Users must enable "Install from Unknown Sources"
- Not recommended for production apps

## App Size

- Debug APK: ~50-60 MB
- Release APK: ~40-50 MB (after optimization)

## Notes

- First build may take 5-10 minutes
- Subsequent builds are faster (~2-3 minutes)
- Android Studio is recommended for debugging
- Enable ProGuard for smaller APK size
- Test on multiple Android versions (API 21+)
- Consider Android App Bundle (.aab) for Play Store

## Additional Resources

- Capacitor Docs: https://capacitorjs.com/docs/android
- Android Studio: https://developer.android.com/studio/intro
- Gradle Guide: https://gradle.org/guides/
