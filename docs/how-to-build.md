# Android Build Credential Setup

This repo builds the Play upload `.aab` locally. A fresh machine needs a few
local-only files and properties before `npm run build-beta` will work.

## What this is for

Use this guide when you:

- clone the repo on a new machine
- restore this repo after wiping local files
- move from one macOS or Windows environment to another
- hit Play Console signing-key errors again

## Required local files

These files are not fully source-controlled or are environment-specific:

- `credentials.json`
  - usually exported from `eas credentials`
  - contains the Android keystore path, alias, and passwords
- `credentials/android/keystore.jks`
  - the actual upload keystore file
- `google-services/google-services-open.json`
  - Firebase config for the beta / Play package
- `google-services/google-services-apk.json`
  - Firebase config for the local APK package

If any of these are missing, beta or APK release builds may fail or produce the
wrong native setup.

## Expected build commands

- `npm run android`
  - dev build
  - uses `APP_VARIANT=dev`
  - does not wire Firebase
- `npm run build-apk`
  - local release APK
  - uses `APP_VARIANT=apk`
  - uses `google-services/google-services-apk.json`
- `npm run build-beta`
  - Play upload `.aab`
  - uses `APP_VARIANT=beta`
  - uses `google-services/google-services-open.json`
  - bumps Android `versionCode`

## One-time setup on a new machine

### 1. Restore credentials

Place these files back into the repo:

- `credentials.json`
- `credentials/android/keystore.jks`

Current `credentials.json` format:

```json
{
  "android": {
    "keystore": {
      "keystorePath": "credentials/android/keystore.jks",
      "keystorePassword": "...",
      "keyAlias": "...",
      "keyPassword": "..."
    }
  }
}
```

### 2. Restore Firebase config files

Place these files back into the repo:

- `google-services/google-services-open.json`
- `google-services/google-services-apk.json`

### 3. Populate `android/gradle.properties`

This repo expects these properties:

```properties
MYAPP_UPLOAD_STORE_FILE=../../credentials/android/keystore.jks
MYAPP_UPLOAD_KEY_ALIAS=...
MYAPP_UPLOAD_STORE_PASSWORD=...
MYAPP_UPLOAD_KEY_PASSWORD=...
```

Source of truth:

- `MYAPP_UPLOAD_STORE_FILE`
  - from `android.keystore.keystorePath` in `credentials.json`
  - stored relative to `android/app/build.gradle`
- `MYAPP_UPLOAD_KEY_ALIAS`
  - from `android.keystore.keyAlias`
- `MYAPP_UPLOAD_STORE_PASSWORD`
  - from `android.keystore.keystorePassword`
- `MYAPP_UPLOAD_KEY_PASSWORD`
  - from `android.keystore.keyPassword`

This repo currently stores them in `android/gradle.properties`.

## Verify the upload keystore before building

Check the keystore fingerprint:

```bash
keytool -list -v \
  -keystore credentials/android/keystore.jks \
  -storepass "<store-password>" \
  -alias "<key-alias>" \
  -keypass "<key-password>" | rg "SHA1|Alias name"
```

Expected Play upload key SHA1 for this app:

```text
C8:20:EE:CB:9B:E4:A5:63:42:B8:59:12:5F:3B:81:80:69:D1:68:9B
```

If the SHA1 does not match, do not upload the `.aab` to Play Console.

## How release signing works in this repo

Release signing is enforced by:

- `scripts/configure-android-release-signing.cjs`
- `scripts/run-android-task.cjs`

Before `build-apk` or `build-beta` runs Gradle, the helper checks for:

- `MYAPP_UPLOAD_STORE_FILE`
- `MYAPP_UPLOAD_KEY_ALIAS`
- `MYAPP_UPLOAD_STORE_PASSWORD`
- `MYAPP_UPLOAD_KEY_PASSWORD`

Then it rewrites the generated Android `release` signing block so the build
uses the upload keystore instead of `debug.keystore`.

## Important caution after native dependency changes

If you add or change a native dependency, you must refresh the generated Android
project before trusting a release build.

Common examples:

- adding a React Native Firebase package
- adding an Expo module with native code
- changing `app.config.ts`
- changing `app.json` plugin config
- changing package name / build variant native config

In this repo, the safe rule is:

- if the change affects Android native code or Android config, run a prebuild
  refresh before the next Android build

Command:

```bash
npx expo prebuild -p android
```

Notes:

- `npm run build-beta` already runs Android prebuild before bundling
- `npm run build-apk` also runs Android prebuild before assembling
- `npm run android` runs a clean Android prebuild for the dev app

What to be careful about:

- manual edits inside `android/` are generated and can be lost
- if release signing only exists in generated Android files, prebuild can wipe
  it
- this repo avoids that by reapplying release signing through
  `scripts/configure-android-release-signing.cjs`
- Firebase config must match the active package variant:
  - `dev` -> no Firebase wiring
  - `apk` -> `google-services-apk.json`
  - `beta` -> `google-services-open.json`

## Recommended fresh-machine checklist

1. Install dependencies with `npm install`.
2. Restore `credentials.json`.
3. Restore `credentials/android/keystore.jks`.
4. Restore both `google-services` JSON files.
5. Confirm `android/gradle.properties` contains the four `MYAPP_UPLOAD_*`
   values.
6. Verify the keystore SHA1 matches Play Console.
7. Run `npm run build-beta`.

## Common failure patterns

### Play Console says the signing key is wrong

Cause:

- the build used `debug.keystore` or the wrong upload keystore

Check:

- verify `android/gradle.properties`
- verify the keystore file exists
- verify the SHA1 matches Play

### Build starts failing after adding a native dependency

Cause:

- generated Android code is stale

Fix:

- run `npx expo prebuild -p android`
- rebuild with `npm run android`, `npm run build-apk`, or `npm run build-beta`

### Firebase or Crashlytics breaks only on one build variant

Cause:

- the active package name does not match the selected `google-services` file

Check:

- `apk` must use `google-services-apk.json`
- `beta` must use `google-services-open.json`
- `dev` should stay without Firebase wiring unless a matching Firebase app is
  added
