# Poultri mobile demo

Expo / React Native app for demonstrating Poultri's early-warning experience with simulated farm data. It can connect to the separate local desktop simulator; it does not connect to cameras, sensors, or deployed farm hardware.

For the complete Expo Go setup, APK build steps, and demo walkthrough, see the repository [README](../README.md#run-the-demo).

## Run with Expo Go

1. Install Node.js LTS on your computer and Expo Go on an Android phone.
2. Open PowerShell in this folder and run:

   ```powershell
   npm.cmd install
   npx.cmd expo start
   ```

3. Keep the phone and computer on the same Wi-Fi network. In Expo Go, scan the QR code shown in the terminal.

Expo Go is convenient for development demonstrations. Android system notifications from the desktop simulator require an installed APK; Firebase/FCM is [configured](../desktop-simulator/README.md#android-push-setup).

## Install the locally built Android APK

The build configuration targets ARM64 Android phones. APK files in `dist/` are ignored by Git, so a fresh clone needs a new build. Copy a completed APK to a compatible phone, open it in Files, and approve the install prompt. It runs without Expo Go or a Metro server. A locally built APK uses a debug signing key for sideloading, so uninstall any EAS-signed copy of `com.poultri.mobile` first; uninstalling clears local demo data. Android push delivery still needs a physical phone test.

## Build an Android APK

1. Create or sign in to an [Expo account](https://expo.dev/).
2. In this folder, install the app packages and sign in to EAS:

   ```bash
   npm.cmd install
   npx.cmd eas-cli@latest login
   ```

3. If `app.json` does not already contain `extra.eas.projectId`, link this app once:

   ```bash
   npx.cmd eas-cli@latest init
   ```

   This creates or links the cloud project and writes its project ID into `app.json`. Skip this step if the project ID is already there.
4. To receive Android system notifications, build an APK with the [Firebase/FCM configuration](../desktop-simulator/README.md#android-push-setup):

   ```bash
   npm.cmd run build:apk
   ```

5. When the cloud build completes, open its build page. Under **Build artifact**, select **Install** to show a QR code. Scan it with the Android phone camera, open the link, then tap **Install** on the page to download the APK. Confirm Android's install prompt; Android may ask you to allow installs from that browser.

The `build:apk` script uses the `preview` profile, which is configured for an installable APK. EAS CLI runs on demand through `npx`; it is not an app dependency. An Expo account and network access are required for the hosted build. Local APKs are ignored by Git, and signing credentials are not stored in the repository.

`expo-build-properties` limits native libraries to ARM64 and permits the local HTTP connection to the desktop simulator. The web simulator itself runs on localhost and is not deployed.

## Walkthrough

- The welcome screen opens the local demo without real authentication.
- Home is a color-coded dashboard with house status bars, alert state, farm totals, and a clear route into Simulator.
- Simulator has the four step-through scenarios, custom House 2 signal and egg-production sliders, and a warning that Raspberry Pi/IoT input is planned for deployment but is not connected here.
- Simulator can pair with the [desktop browser IoT Simulator](../desktop-simulator/README.md) over a trusted local Wi-Fi network. Readings remain simulated. With notification permission and the configured Android APK, a new desktop alert also produces an Android system notification; tapping it opens the matching alert.
- Simulator changes update relevant Home, house, alert, and production views through the same saved local demo data.
- Alerts support acknowledgement, resolution, and a saved inspection note.
- Alerts compare reference and latest readings; recovered readings remain visible while an inspection record is still open.
- Records are filterable by house and show illustrative seven-day production charts. Edit today's demo egg count in Simulator.
- Profile edits the farm, owner, house names and bird counts, and can reset demo data.

All data is labeled as demo data. The warning and suggested checks are for inspection and are not a diagnosis or treatment. The mobile app also keeps its local scenario controls when the desktop server is disconnected. A push needs internet and Expo/FCM; the desktop reports submission status, not confirmed phone display.
