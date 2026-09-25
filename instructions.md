# Run the Poultri mobile demo

The app lives in the `mobile` folder. Its farm readings and alerts are simulated and saved on the device.

## Option 1: Open with Expo Go

This is the quickest way to try the app while developing. You need Node.js LTS on your computer and Expo Go on an Android phone.

1. Open PowerShell in the repository folder.
2. Run:

   ```powershell
   cd mobile
   npm install
   npx expo start
   ```

3. Connect the phone and computer to the same Wi-Fi network.
4. Open Expo Go on the phone and scan the QR code shown in the terminal.

Keep `npx expo start` running while using Expo Go. This method needs the phone to reach the development server, so use the APK option for a demo that should work after disconnecting from Wi-Fi or enabling airplane mode.

## Option 2: Build and install an Android APK

The APK runs as a standalone app and is better for mentor or business-partner demos. EAS Build creates it online, so you need internet access and a free Expo account.

1. Install Node.js LTS and create/sign in to an Expo account at [expo.dev](https://expo.dev/).
2. Open PowerShell in the repository folder and run:

   ```powershell
   cd mobile
   npm install
   npm install --global eas-cli
   eas login
   eas build --platform android --profile preview
   ```

3. If EAS asks to configure or link the project, follow its prompts.
4. When the build finishes, open its link on the Android phone and download/install the APK. Android may ask you to allow installation from that browser or file manager.

The preview profile in `mobile/eas.json` is set to create an installable APK. No APK or signing credentials are checked into this repository.

## Demo walkthrough

1. Continue from the branded welcome screen into the demo farm.
2. On **Home**, select **Temperature rising** or **Movement dropping**, then advance the scenario step by step. Watch the chart, house status, and alert update.
3. Use the House 2 sliders to create a custom example. The value previews as you drag and records when you release; the alert explains the demo rule that was triggered.
4. Open **Alerts**, acknowledge the change, add an inspection note, and mark it resolved.
5. Open **Records**, switch houses, and adjust today's simulated egg count.
6. Open **Profile** to edit the farm, owner, and house details; reset the data to restart the walkthrough.
7. Toggle **Simulate offline** to show that the local demo screens remain available.

## What the demo represents

The app uses local simulated readings and production records. It does not connect to cameras or sensors and does not implement on-site processing. The offline control is a demonstration setting; it does not prove the concept note's seven-day offline validation target. All alerts are inspection prompts, not diagnoses.
