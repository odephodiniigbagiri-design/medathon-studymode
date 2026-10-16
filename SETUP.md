# Medathon: building the APK

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
Edit the files in `www/`, then run `npx cap sync` and build again. The Play Medathon button opens https://medathon1.vercel.app/, so it needs internet.

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

## Accounts (Supabase)
Registration, login, email codes and profiles run on Supabase (free tier is fine to start).
1. Create a project at supabase.com.
2. SQL Editor: paste and run `supabase/schema.sql`.
3. Authentication > Providers > Email: keep it enabled with **Confirm email** on.
4. Authentication > Email Templates: edit **Confirm signup** and **Reset password** so the email body contains the code, for example: `Your Medathon code is {{ .Token }}`. The app asks for this code, so no web links or deep links are needed.
5. Project Settings > API: copy the Project URL and the anon key into `www/config.js`. The anon key is public by design; the database policies in `schema.sql` keep each user's data private.
6. Supabase's built-in email sender is limited to a few emails per hour and is meant for testing. Before real students sign up, connect your own SMTP service (Resend, Brevo, etc.) under Authentication > SMTP.
7. Run `npx cap sync` and rebuild.

Until `config.js` is filled in, the app shows a "not set up" screen with a testing-only skip button. Remove that button before release.
