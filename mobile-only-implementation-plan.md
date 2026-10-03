# Poultri mobile-only implementation plan

## Decision and outcome

This document specifies the work to perform **after approval**. It does not implement the changes. Poultri will be an Expo / React Native mobile demonstration with no desktop server, pairing, simulator page, scenario controls, or notification delivery. A new user enters chicken and egg counts before opening the farm dashboard. All readings, history, and the sample alert remain plainly labeled as illustrative, not live farm data.

Use the Ponytail approach: delete unused code and dependencies, reuse the existing Expo Router screens and `DemoProvider`, and add no backend, form library, state library, or new design system.

## User flow and screen behavior

1. **Welcome:** Keep the supplied logo and wordmark and the static demo entry. Once saved data has loaded, **Continue as demo farmer** opens Setup until setup is complete; later visits open Home. Direct navigation to the tabs before setup redirects to Setup.
2. **Setup:** Add one scrollable, mobile-sized form for House 1, House 2, and House 3. Ask for each house's chicken count and eggs laid today. Show the default house names; names, farm name, and owner remain editable in Profile. Prefill numeric fields from saved data when an older app version is upgraded. Use number-pad inputs and a single **Open demo farm** action. Require a positive whole-number chicken count and a whole-number egg count from zero through that house's chicken count. Explain invalid fields inline and keep the entered drafts. Save all six values together, then open Home.
3. **Home:** Remove the Simulator card, link, and scenario progress. Show the three houses, entered chicken and egg totals, illustrative readings, and any open sample inspection record. Use the existing text and color status cues. All visible readings are labeled as sample/demo data.
4. **Alerts:** On a newly set up farm, include one explicitly labeled **sample alert** for House 2. Its example temperature rises in the saved history and then returns near reference, so the latest house status is Normal while the inspection record remains open and marked recovered. Keep acknowledge, note, and resolve actions. Resolving it does not create another alert; Reset demo is the way to replay the sample.
5. **Records and house detail:** Keep the read-only seven-day production chart and house comparison. Setup values drive today's egg figures, farm totals, and the final chart point. Earlier points and sensor readings are illustrative. House detail shows a small seeded reading history that is consistent with the sample alert; remove text about simulator steps and edits.
6. **Profile:** Keep farm, owner, house-name, and chicken-count edits. Add an eggs-today edit beside each house so entered values can be corrected without restarting setup. Validate it against that house's chicken count and update Home and Records from the same state. Remove **Simulate offline**. Keep the explicit Reset demo confirmation; reset clears the local demo and returns to Setup. Keep proposed pricing and validation targets labeled as proposals and targets.

There is no simulator or control that generates new sensor readings or alerts after setup. The sample alert is a presentation record, independent of chicken and egg counts. The app requires no server or internet to use its saved demo screens; Expo Go development and an EAS cloud build still require their normal connections.

## State and migration

- Retain `DemoProvider` and the existing local storage key so an in-place update can read saved profiles, readings, alerts, statuses, and inspection notes. Add only a `setupComplete` flag needed for the first-run flow. Older saved data without this flag opens Setup with its current per-house chicken and egg values prefilled; saving Setup retains its existing alerts and notes. A fresh install starts with three named houses and the single sample alert.
- Keep the stored house, production, reading, and alert structures required by Home, Alerts, Records, and Profile. Remove scenario, scenario step, offline, remote reading and alert, desktop URL/code, polling, push token, and notification bridge state and actions. Ignore stale desktop pairing keys in old storage; the revised app never reads or connects with them. Do not overwrite saved state during the initial asynchronous load.
- Seed House 2 with a reference reading, one illustrative elevated temperature reading that satisfies the existing unvalidated demo rule, and a recovered latest reading. Seed an unresolved sample alert whose observed text describes that past change and whose latest comparison matches the recovered reading. Keep a shared status rule so Home, Alerts, and house detail agree. Preserve any existing saved alert and note instead of inserting a duplicate sample during migration.
- Changing a chicken count or today's eggs does not alter sensor history or generate an alert. Today's egg edit changes the house's `eggs` value and the last production point; earlier historical points stay as saved. Reset restores the initial sample state and requires setup again.

## Removal and configuration

- Remove the entire tracked `desktop-simulator/` directory. Because it currently has uncommitted changes, save a recoverable patch of that directory in the repository root before deletion and leave the patch uncommitted and outside `mobile/` so it cannot enter the APK.
- Delete the in-app Simulator route and remove its registration and all links to it. Delete local scenarios, slider helpers used only by that page, desktop fetch/pair/unpair logic, Firebase/Expo push handling, and unused alert-source types. Keep historical optional inspection suggestions if needed to display alerts already saved by an older build.
- Remove `expo-notifications`, its icon/plugin, `expo-constants` if no other imports require it, and the slider package if unused. Remove `mobile/google-services.json` and `mobile/app.config.js` once the latter has no remaining purpose. Remove the iOS local-network description and Android cleartext-HTTP setting. Retain `expo-build-properties` for the ARM64-only APK and retain the existing EAS project ID and `preview` APK profile. Only remove other packages after confirming they are not required by Expo Router or the app.
- Rewrite `README.md`, `mobile/README.md`, `implementation.md`, and `agents.md` for the mobile-only setup and walkthrough. Mark the older `reduction-plan.md` as superseded by this plan because its desktop and push targets no longer apply. Remove claims about desktop connectivity, Firebase push, simulator controls, and physical IoT input. Keep clear language that camera, sensors, field validation, and on-site processing are not implemented.

## Execution sequence

1. Record the current Git status and back up the uncommitted desktop changes without discarding unrelated mobile edits.
2. Simplify state and seed data, add Setup and navigation gating, then update Home, Alerts, Records, house detail, and Profile.
3. Delete both simulator implementations and remove unused dependencies and native configuration. Regenerate the lockfile using Expo-compatible package management where applicable.
4. Align all user and maintainer documentation with the resulting screens and build path.
5. Run the checks below, fix concrete failures, then create a fresh ARM64 APK with the existing EAS `preview` profile. Do not publish or submit it to an app store.

## Acceptance checks

- Fresh install: Welcome leads to Setup; incomplete or invalid counts cannot open Home; valid per-house entries appear in Home and Records and persist after relaunch.
- Upgrade with saved data: Setup is prefilled; existing alerts, statuses, and inspection notes remain after saving; no duplicate sample alert is inserted. Direct tab navigation before setup returns to Setup.
- Sample record: the House 2 history, recovered latest reading, Home status, Alerts status, comparison values, acknowledgement, note, and resolution agree. Reset returns to Setup and restores the original sample after new values are entered.
- No Simulator route, desktop address/code fields, offline switch, background polling, push permission request, or notification behavior remains. No network service is needed for app screens.
- Run `npm.cmd run lint`, `npx.cmd tsc --noEmit`, and `npx.cmd expo-doctor` from `mobile/`. Inspect the final dependency list and a Git diff for accidental removal of official artwork or unrelated edits.
- Build with `npm.cmd run build:apk` from `mobile/`. Report the EAS artifact link, file size versus the existing 64,038,153-byte APK, and whether the APK installed and opened on a physical ARM64 Android phone. If no phone is available, report installation as unverified rather than claiming success. Existing local debug-signed and EAS-signed installs may require different update paths; this task has no installed copy whose data must be transferred.

## Defaults and limits

The form uses **per-house** chicken and egg counts, and the app includes **one sample alert**. These were the recommended answers to the two final clarification questions, which were not answered before this document was written. Keep the current four tabs, local editing, saved notes, official brand assets, and ARM64 APK delivery. Do not add accounts, hardware connections, diagnoses, treatment advice, fabricated accuracy, or a fixed APK-size promise. Report the actual APK size and any build or device-testing limitation.
