# Agent handoff and MVP assessment

## Current delivery

The repository now includes an Expo / React Native TypeScript mobile demonstrator in `mobile/`. It is intended for Expo Go demos and an installable Android APK built with EAS. The supplied repository `assets/` directory had no files, so the app uses a text wordmark instead of claiming to use Poultri's official logo.

The TypeScript check (`npx tsc --noEmit`) passes, and Expo successfully exported the Android JavaScript bundle. No APK has been produced; that step requires an Expo account and EAS hosted build.

## Concept MVP assessment

| Product MVP from the concept | Prototype coverage | Assessment |
|---|---|---|
| Farm and house monitoring overview | Three houses with readings, activity, egg counts, and status | Demonstrated with seeded data |
| Rising temperature + reduced movement warning | Seeded House 2 alert and trigger control | Demonstrated as a simulated early warning |
| Temperature and humidity monitoring | Shown on overview and house details | Simulated; no sensors connected |
| Camera activity and existing-camera compatibility | Camera state is described as simulated | UI concept only; no camera input, stream, or vision processing |
| Farm production records | Seven-day egg production chart and per-house totals | Demonstrated with illustrative records |
| Alert review and farmer response | Alert detail, acknowledge, and resolve actions | Demonstrated locally; no notifications or worker assignment |
| Operation during unreliable internet | Local data plus a simulate-offline indicator and control | App flow is local; seven-day offline endurance is unvalidated |
| On-site processing | Explained on About screen as intended design | Not implemented; there is no edge device or processing pipeline |
| Proposed ₱40,000 package and separate subscription | Clearly labeled proposed pricing | Presentation only; no sales or billing flow |
| Reliability, accuracy, and field validation | Targets are identified as targets | Not performed; no validated claims are made |

### MVP conclusion

This build covers the product's core *demonstration MVP*: farm visibility, a representative combined warning, inspection-oriented alert handling, production context, and a basic offline walkthrough. It does not meet the deployable *farm monitoring MVP* because there are no camera/sensor integrations, calibrated alert rules, on-site processing, or field results. Do not describe simulated functionality as a working hardware system.

## Demo path

1. Open Overview and point out the three house states.
2. Open the House 2 warning and explain that it shows a change to inspect, not a diagnosis.
3. Acknowledge or resolve it, then show that the new status remains after relaunch.
4. Open Records for the seven-day illustrative egg trend.
5. Toggle Simulate offline and show that local screens remain available.
6. Trigger a sample alert or reset the demo to restore the seeded walkthrough.

## Boundaries for follow-on agents

- Keep demo and simulated labels visible wherever readings could be mistaken as live.
- Do not add diagnoses, treatment recommendations, unsupported accuracy claims, or fabricated farm validation.
- Keep camera integration, sensors, edge processing, and field validation out of the mobile prototype until hardware and test data are available.
- Add the official Poultri logo only after it is supplied in usable form; replace any starter branding in native icon/splash assets at that time.

See `implementation.md` for the original detailed execution brief and `mobile/README.md` for launch and APK instructions.
