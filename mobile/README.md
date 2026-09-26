# Poultri mobile demo

Expo / React Native app for demonstrating Poultri's early-warning experience with simulated farm data. It works locally and does not connect to cameras, sensors, or a server.

For the complete Expo Go setup, APK build steps, and demo walkthrough, see the repository [README](../README.md#run-the-demo).

## Run with Expo Go

1. Install Node.js LTS on your computer and Expo Go on an Android phone.
2. Open PowerShell in this folder and run:

   ```powershell
   npm install
   npx expo start
   ```

3. Keep the phone and computer on the same Wi-Fi network. In Expo Go, scan the QR code shown in the terminal.

Expo Go is convenient for development demonstrations. For a shareable APK, build and install the standalone app below.

## Build an Android APK

1. Create or sign in to an [Expo account](https://expo.dev/).
2. In this folder, install the app packages and sign in to EAS:

   ```bash
   npm install
   npx eas-cli@latest login
   ```

3. If `app.json` does not already contain `extra.eas.projectId`, link this app once:

   ```bash
   npx eas-cli@latest init
   ```

   This creates or links the cloud project and writes its project ID into `app.json`. Skip this step if the project ID is already there.
4. Create the APK:

   ```bash
   npm run build:apk
   ```

5. When the cloud build completes, open its build page. Under **Build artifact**, select **Install** to show a QR code. Scan it with the Android phone camera, open the link, then tap **Install** on the page to download the APK. Confirm Android's install prompt; Android may ask you to allow installs from that browser.

The `build:apk` script uses the `preview` profile, which is configured for an installable APK. EAS CLI runs on demand through `npx`; it is not an app dependency. An Expo account and network access are required for the hosted build. This repository does not contain a built APK or signing credentials.

## Walkthrough

- The welcome screen opens the local demo without real authentication.
- Home is a color-coded dashboard with house status bars, alert state, farm totals, and a clear route into Simulator.
- Simulator has the four step-through scenarios, custom House 2 signal and egg-production sliders, and a warning that Raspberry Pi/IoT input is planned for deployment but is not connected here.
- Simulator changes update relevant Home, house, alert, and production views through the same saved local demo data.
- Alerts support acknowledgement, resolution, and a saved inspection note.
- Alerts compare reference and latest readings; recovered readings remain visible while an inspection record is still open.
- Records are filterable by house and show illustrative seven-day production charts. Edit today's demo egg count in Simulator.
- Profile edits the farm, owner, house names and bird counts, and can reset demo data.

All data is labeled as demo data. The warning is for inspection and is not a diagnosis.
