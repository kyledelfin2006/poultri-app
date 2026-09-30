# Poultri IoT Simulator

This browser sandbox represents a **simulated** three-house farm. It uses the supplied Poultri logo and wordmark, and sends example readings over local Wi-Fi to the existing mobile app. The desktop server checks the same illustrative, unvalidated temperature/movement rule and creates inspection alerts. Firebase/FCM is configured for Expo pushes; install a new APK to test them on Android.

## What changed

- The farm map has selectable houses, scenario presets, manual temperature/humidity/movement/egg controls, a clock, play/pause/step, and speed controls.
- The small Node server owns desktop readings and alert events. A transition into an alert state creates one event and one push submission; ongoing abnormal readings do not repeatedly push. Recovery keeps the alert record available.
- The mobile app pairs with a temporary six-digit code, follows desktop readings, merges desktop alerts by ID, and opens a matching alert when a system notification is tapped. The on-phone Simulator still works independently.
- Suggestions ask the user to verify readings and inspect the house. They are demo prompts, not diagnoses or treatment advice. SMS, sensors, cameras, and a Raspberry Pi are not included.

## Android push setup

Desktop-to-mobile readings work without Firebase. The Firebase project `poultri-demo-2026-0930` has Android app `com.poultri.mobile` registered and FCM v1 enabled. Its `google-services.json` is in `mobile/`, where `mobile/app.config.js` includes it in the Android build. The FCM v1 service-account key is assigned to the existing Poultri EAS project. The private key is not stored in this repository.

From `mobile/`, install the locally built `dist/poultri-demo.apk` in this workspace, or run `npm.cmd install`, sign in with `npx.cmd eas-cli@latest login`, and run `npm.cmd run build:apk` for an EAS build. The local APK is ignored by Git. Install the APK on a physical Android phone and allow Poultri notifications. Expo Go is useful for the local demo but is not the push test build.

See [Expo's Android FCM setup](https://docs.expo.dev/push-notifications/fcm-credentials/) and [push setup](https://docs.expo.dev/push-notifications/push-notifications-setup/) for the current credential steps. Push needs internet on the computer and phone, even though readings use Wi-Fi locally. Expo/FCM acceptance is not proof that Android displayed the notification.

## Start each session

1. Connect the computer and phone to the same Wi-Fi. Permit devices to reach each other on the LAN; keep internet available for push.
2. In PowerShell, run:

   ```powershell
   cd desktop-simulator
   npm.cmd start
   ```

   The desktop simulator has no packages to install; `npm.cmd start` runs Node directly. Node.js 22.13 or later is recommended. The `.cmd` suffix avoids PowerShell's `npm.ps1` execution-policy error.
3. Open `http://localhost:4174` on the computer. The page shows the local network address, a new pairing code, connection state, and push status. Keep the terminal open. If Windows Firewall prompts, permit Node on your **private** network.
4. In the Poultri app, open **Simulator**. Enter the displayed desktop network address (for example `http://192.168.1.10:4174`) and pairing code, then tap **Connect**. Grant Android notification permission. Confirm the app says the desktop is connected and push is ready. If it says push unavailable, check the APK/FCM setup above. If the phone cannot reach the address, allow Node's inbound connection on this trusted Wi-Fi in Windows Firewall; a network marked **Public** may block it.
5. Open **Home** or a house detail to see incoming simulated readings. Keep the app's local Simulator available for a disconnected walkthrough.

## Demo walkthrough

1. Select **House 1** in the browser map. Show the official branding and `IoT Simulator · Simulated data` label.
2. Choose **Temperature rising** and press **Step** twice, or **Play**. The second step crosses the demo temperature rule and creates an inspection alert. With a configured APK, Android should show a real notification banner/tray entry. You can also use **Movement dropping**; its second step crosses the movement rule.
3. Tap the Android notification. It should open the matching Poultri alert with its observed change and short inspection suggestions. The Alerts screen also retains that record. A further step in the same abnormal condition should not create another alert or push.
4. Acknowledge the alert and add an inspection note. In the browser choose **Recovery**, then step three times. The house returns to Normal; the unresolved alert and note remain until you resolve them.
5. Change humidity and eggs manually to show mobile house values and Records changing. These two inputs do not trigger an alert under the current rule.
6. Stop the desktop server with `Ctrl+C`. The phone indicates connection loss while local screens remain usable. Starting the server again gives a new pairing code; reconnect from the app.

## Status and limits

- The browser's push status distinguishes **Ready**, **Submitted**, **Provider accepted**, and **Failed**. These statuses cannot confirm display on the phone; verify the Android tray directly.
- If permission is denied, no token is available for pairing; the mobile app explains the push issue. Local readings and the alert list can still work when connected.
- The server stores the pairing code, phone push token, readings, and alerts only in memory. Restarting it resets its farm and pairing code. Use on a trusted private LAN; this is a demo server, not a production authentication system.
- No physical IoT hardware, validated health rule, diagnosis, treatment advice, SMS, or offline push delivery is provided.
