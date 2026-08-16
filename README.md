# Gym Vision Workout Generator

Photograph whatever equipment is in your gym today, tell the app what you want to work on, and get
a tailored routine built only from what's actually there — with bodyweight substitutions when
equipment is missing, a YouTube demo link per exercise, and a customizable voice mentor that
motivates you through the workout.

Monorepo: `app` (Expo/React Native), `server` (Express backend), `shared` (shared TypeScript types).

## Phase 1 status

Backend runs end-to-end with hardcoded/stubbed detection + a small local exercise catalog (no paid
API keys required). Expo app has full navigation (photo capture → goal/intensity → routine review →
voice mentor picker → workout session) wired to the real backend endpoints.

## Setup

```bash
npm install
```

## Running the backend

```bash
npm run dev:server
```

Confirm it's up: `curl http://localhost:4000/health`

Without any `.env` keys configured, `/analyze-photos` returns a hardcoded equipment list and
`/generate-routine` builds a routine from a small local exercise catalog + bodyweight fallbacks —
enough to demo the full app flow at zero cost. See `.env.example` for the real keys to add later
(Roboflow for equipment detection, Google/ElevenLabs for TTS, YouTube Data API for demo videos).

Copy `.env.example` to `server/.env` and fill in keys when you're ready to wire up real detection.

## Running the Expo app

1. Find your dev machine's LAN IP (Windows: `ipconfig`, look for IPv4 Address) — or run
   `ngrok http 4000` and use the printed `https://*.ngrok-free.app` URL instead.
2. Edit `app/src/config/api.ts` and set `BASE_URL` to that address (e.g. `http://192.168.1.42:4000`).
   `localhost` will NOT work from a physical device running Expo Go.
3. Start the app:

   ```bash
   npm run dev:app
   ```

4. Scan the QR code with Expo Go on your iPhone.

If your firewall blocks inbound connections on port 4000, either allow it or use the ngrok tunnel
option instead.

## Manual backend testing

`server/test/manual/api.http` has ready-to-run requests (health check, generate-routine,
voice-characters, tts) — usable with the REST Client extension in VS Code, or translate to curl.

## Project structure

See the plan file for full architecture details, data flow, and the phased build order (Phase 2:
real Roboflow equipment detection + wger.de exercise catalog + YouTube search; Phase 3: voice
mentor TTS playback; Phase 4: persistence + polish).
