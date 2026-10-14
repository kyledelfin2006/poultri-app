# Poultri Wokwi + Mobile Demo MVP

## Purpose

Define a small prototype that lets a presenter change a simulated poultry-house reading in Wokwi and show the resulting inspection prompt in the Poultri mobile app. The complete presenter walkthrough must take less than two minutes once setup is complete.

This is a demonstration of a proposed workflow. It is not a farm monitoring system, field trial, or validated alert product.

## Audience and user

- **Demo audience:** startup challenge judges, mentors, and prospective farm stakeholders.
- **Demo user:** a farm worker or supervisor who checks one house and acknowledges a prompt to inspect it.

## Functional requirements

1. Wokwi simulates one ESP32 and one DHT22 sensor. A presenter can change temperature and humidity while simulation is running.
2. The mobile app shows the latest temperature and humidity, the source as **Wokwi simulated data**, and whether the connection is waiting, connected, stale, or disconnected.
3. The first valid reading after connecting or resetting becomes the session reference. The app creates one inspection prompt when temperature rises by at least **1.5°C** above that reading. This is an illustrative demo rule, not a poultry-health threshold. Humidity is displayed but does not trigger an alert.
4. The presenter can acknowledge the prompt. If temperature later returns below the trigger, show that the reading recovered while retaining the alert until the demo is reset.
5. **Reset Demo** clears the app's reference and alert. The next valid reading becomes the new reference; the Wokwi simulation and bridge do not need to restart.
6. The presenter can enter the laptop's local bridge URL in the app and connect before starting the timed walkthrough.

## Two-minute presenter walkthrough

Complete setup before starting the timer: run the bridge, start Wokwi with its private gateway, open the app, and connect it to the bridge.

| Time | Presenter action | What the audience sees |
|---|---|---|
| 0:00–0:20 | Show the connected app and steady Wokwi reading. | One house, temperature, humidity, and simulated-data labels. |
| 0:20–0:45 | Raise temperature in the Wokwi DHT22 control. | The app updates with the new reading. |
| 0:45–1:10 | Point out the generated inspection prompt. | Temperature change is compared with the session reference and labeled as a demo rule. |
| 1:10–1:30 | Acknowledge the prompt in the app. | The record changes to acknowledged. |
| 1:30–1:50 | Return temperature near its starting value. | The reading recovers; the inspection record remains visible. |
| 1:50–2:00 | State the prototype boundary. | Wokwi simulation only; no real sensors, camera analysis, diagnosis, controls, SMS, or farm validation. |

## Out of scope

- Multiple houses, farm profiles, production records, accounts, or cloud data storage.
- Cameras, bird-activity classification, ammonia/CO₂ measurement, SMS, and fan or temperature-control commands.
- Clinical or husbandry advice, validated safety thresholds, farm compatibility claims, offline-duration claims, or measured farm outcomes.
- Production security, multi-user access, internet deployment, and remote monitoring.

The Wokwi MQ-2 part is a combustible-gas model and must not be presented as an ammonia or CO₂ sensor. See [Wokwi's gas sensor reference](https://docs.wokwi.com/parts/wokwi-gas-sensor).

## Success criteria

- The presenter can change the Wokwi DHT22 input and see the app update over the local connection.
- A temperature rise of 1.5°C or more above the session reference creates exactly one prompt; acknowledging, recovery, and reset behave as described.
- Disconnection and stale data are labeled so old readings are not mistaken for current readings.
- A prepared presenter completes the walkthrough within two minutes without implying that simulated readings are live farm data.

For architecture, the bridge contract, implementation order, and technical checks, see [build-requirements.md](build-requirements.md).
