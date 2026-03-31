# Rower Dashboard 🚣

An open-source, privacy-first single-page web dashboard for Bluetooth-enabled rowing machines (built specifically with the Echelon Row Series in mind). 

## 🌟 Overview
Most proprietary rowing apps trap your data in their ecosystems or require paid subscriptions just to see your metrics on a screen. **Rower** aims to be a zero-dependency, local-first alternative. 

By utilizing the **Web Bluetooth API**, this Next.js application connects directly to your rowing machine from any modern, secure browser (Chrome/Edge). Your workout data never leaves your device: history is saved straight into your browser's `localStorage`.

## ✨ Features
- **Direct Bluetooth Telemetry:** Connects locally to your machine's GATT Server and listens to real-time characteristic notifications.
- **Data Presentation UI:** Built with Tailwind CSS and perfectly tuned `min(vw, vh)` clamps, the numbers scale intelligently to fill 100% of your screen's view height, transforming any old tablet or monitor into a massive gym-quality display. Uses the incredibly clean open-source `Inter` font.
- **Workflow State Routing:** Built-in connection lifecycle (Disconnected ➔ Ready ➔ Recording).
- **Session Analysis Overlay:** Every session generates a detailed timeseries array. When you finish your workout, *Recharts* renders a multi-axis line chart tracking your SPM, Speed, and Watts so you can visualize exactly when you gassed out!
- **Zero-Friction Social Sharing:** One-click "Copy to Share" button generating a perfect text-based summary of your session.

## 🛠️ How it Works
1. **Bluetooth Hook (`src/hooks/useBluetooth.ts`):** 
   This custom React Hook binds to `navigator.bluetooth`. When triggered, the browser pops a native, secure device-selection modal. Once paired, it subscribes to the machine's primary services and establishes an event listener to intercept the stream of raw `Uint8Array` byte data.
   
   > **Note on Echelon Mappings:** Echelon does not use the standard Fitness Machine Service (FTMS) protocol. Currently, the Web Bluetooth hook includes a diagnostic logger to print the raw data stream. This is critical for reverse-engineering which byte indexes map to SPM, Watts, Resistance Level, and Distance. 

2. **Dashboard UI (`src/app/page.tsx`):**
   Handles the orchestration of the workout flow. Includes a mock data generator that spins up randomized Sine-wave timeseries data so you can preview the massive overlay chart even if you aren't sitting on your rower.

3. **History Storage (`src/hooks/useRowHistory.ts`):**
   All `RowRecord` objects are injected with UUIDs and timestamped arrays of your stroke performance, compressed, and dumped into HTML5 `localStorage`. 

## 🚀 Running Locally

Because the Web Bluetooth API requires a secure context, you **must** serve this over `localhost` or via `https://`. (Safari is not supported).

```bash
# Install dependencies
npm install
# or
yarn install

# Start the dev server
npm run dev
# or 
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Click **Connect Rower**, select your machine, and start pulling!
