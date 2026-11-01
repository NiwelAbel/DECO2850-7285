# Baobei Complete Split Vite Version

This is a complete standalone Vite + React project.

## Run it

Open this folder in VS Code terminal:
cd "C:\Users\rog\Desktop\7285\DECO2850-7285\Baobei App"
```bash
npm install
npm run dev
```

Refresh: localStorage.removeItem("baobeiOnboardingComplete")

Then open the localhost address Vite gives you.

## Structure

src/
- main.jsx
- App.jsx
- styles.css
- components/
  - Bear.jsx
  - Nav.jsx
  - Header.jsx
  - Activity.jsx
  - Action.jsx
  - Voice.jsx
- pages/
  - Login.jsx
  - Home.jsx
  - Live.jsx
  - Messages.jsx
  - Profile.jsx

The Live Activity page keeps multiple notifications instead of replacing the previous notification.

Arduino is NOT included yet.


## Hardware integration

This App is the current interface for the existing two-board Baobei firmware.
The original hotspot, wiring and firmware do not need to change.
The workspace launcher `../../start-baobei-demo.command` now starts this version on port 8787.

```sh
npm run build
npm run server
```

Connect the computer to `Baobei-Bear` and keep its address at `192.168.4.200`.
The Cardputer keeps `192.168.4.201` and the button board keeps `192.168.4.1`.
Use the existing pairing key from `data/pairing-key.txt` in Home > Pair bear.
Existing recordings and the pairing key have been preserved in this App's data directory.
For development, run `npm run dev` alongside the service; Vite forwards `/api` requests to port 8787.

Home and Live Activity use the same activity list.
Heart-light toggles the physical light without a time limit.
Chenge color cycles red, green, blue, yellow, magenta, cyan and white while preserving the switch state.
Warm hug keeps its existing local animation and does not send a hardware command.
Voice replies are converted to 16 kHz mono PCM WAV for the Cardputer and are limited to 30 seconds.
Daily check-ins and coin rewards are not part of this version.

| Bear state | Trigger |
| --- | --- |
| Offline | The service or either board is disconnected |
| Last active | The latest activity content when no other state applies |
| A new moment is waiting | A parent voice reply was saved |
| Happy interaction | The child is holding button 5 |
| Your warm light was sent | An App light request was acknowledged by the button board and the light is on |

An active button-5 interaction takes priority over message and light states; offline takes priority over all connected states.
The existing Try bear states button remains a visual preview and is replaced by the next meaningful hardware update.

The service retains the existing HTTPS environment variables `BAOBEI_TLS_CERT`, `BAOBEI_TLS_KEY` and `BAOBEI_TLS_PORT`.
Phone microphone recording requires a trusted HTTPS page; the computer can record at `http://localhost:8787`.
The existing Profile, onboarding, tutorial, mascot graphics and layout styles have been retained.
Run `npm test` for the hardware protocol and state tests plus the existing tutorial/layout checks.
