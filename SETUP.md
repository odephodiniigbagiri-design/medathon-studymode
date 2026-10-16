# Medathon Study Mode: building the APK

The app is your web files wrapped in a thin Android shell (Capacitor). No Kotlin needed for this version.

## One-time setup
1. Install Node.js (LTS) and Android Studio.
2. In this folder run:
   ```
   npm init -y
   npm i @capacitor/core @capacitor/cli @capacitor/android
   npx cap add android
   ```

## Build an APK
```
npx cap sync
npx cap open android
```
In Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
The file lands in `android/app/build/outputs/apk/debug/app-debug.apk`. Send it to phones and tap to install.

## Updating the app
Edit the files in `www/`, then run `npx cap sync` and build again. Put `medathon.html` (the game) in `www/` too so the Play button works.

## Optional: load from Vercel instead
Deploy the `www` folder to Vercel, then add this inside `"server"` in `capacitor.config.json`:
```
"url": "https://your-app.vercel.app"
```
Run `npx cap sync` and build once. After that, every Vercel deploy updates the app on phones instantly, with no new APK. Trade-off: it needs internet on every open.

## Later (needs a little Kotlin)
Blocking other apps, Do Not Disturb and fullscreen lock are native features. They are added as a plugin on top of this same project.

## Release APK
For sharing beyond testing, build a signed release APK (Build > Generate Signed Bundle / APK) so Android stops showing a debug warning.
