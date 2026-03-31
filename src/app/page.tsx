"use client";

import { useEffect, useCallback, useState } from "react";
import { useBluetooth } from "@/hooks/useBluetooth";
import { useRowHistory } from "@/hooks/useRowHistory";
import DashboardMetrics from "@/components/DashboardMetrics";
import HistoryChart from "@/components/HistoryChart";
import SessionChart from "@/components/SessionChart";
import ShareButton from "@/components/ShareButton";
import { MdInfoOutline } from 'react-icons/md';

export default function Home() {
  const { isConnected, connect, disconnect, metrics, logs } = useBluetooth();
  const { history, saveRow, clearHistory } = useRowHistory();
  
  const [appState, setAppState] = useState<'disconnected' | 'ready' | 'recording'>('disconnected');
  const [showAbout, setShowAbout] = useState(false);

  // Sync state when bluetooth connection resolves/drops
  useEffect(() => {
    if (isConnected && appState === 'disconnected') {
      setAppState('ready');
    } else if (!isConnected && appState !== 'disconnected') {
      setAppState('disconnected');
    }
  }, [isConnected, appState]);

  const handleFinishRow = useCallback(() => {
    if (appState !== 'recording') return;

    // Generate mock session data for visualizing the new chart since we don't have real BT data yet
    const generateMockSession = () => {
      const data = [];
      const totalTime = Math.floor(Math.random() * 600) + 300; // 5 to 15 mins
      for (let t = 0; t <= totalTime; t += 10) { 
        data.push({
          time: t,
          timeStr: `${Math.floor(t/60)}:${(t%60).toString().padStart(2, '0')}`,
          spm: Math.floor(20 + Math.sin(t/50) * 5 + Math.random() * 2),
          watts: Math.floor(100 + Math.sin(t/60) * 30 + Math.random() * 15),
          speed: parseFloat((2.5 + Math.sin(t/40) * 0.5 + Math.random() * 0.2).toFixed(2)),
          level: Math.floor(12 + Math.sin(t/100) * 5),
        });
      }
      return {
        sessionData: data,
        spmAvg: Math.round(data.reduce((sum, d) => sum + d.spm, 0) / data.length),
        wattsAvg: Math.round(data.reduce((sum, d) => sum + d.watts, 0) / data.length),
        distance: Math.round(data.reduce((sum, d) => sum + (d.speed * 10), 0)), 
        time: totalTime
      };
    };

    const mock = generateMockSession();

    saveRow({
      spmAvg: metrics.spm > 0 ? metrics.spm : mock.spmAvg,
      distance: metrics.distance > 0 ? metrics.distance : mock.distance,
      time: metrics.time > 0 ? metrics.time : mock.time,
      wattsAvg: metrics.watts > 0 ? metrics.watts : mock.wattsAvg,
      sessionData: mock.sessionData
    });

    setAppState('ready');
  }, [metrics, saveRow, appState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && appState === 'recording') {
        e.preventDefault(); 
        handleFinishRow();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFinishRow, appState]);

  const latestRecord = history.length > 0 ? history[history.length - 1] : null;

  return (
    <main className="min-h-screen bg-offWhite text-charcoal flex flex-col items-center font-sans tracking-tight relative">
      
      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-charcoal/90 backdrop-blur-md z-50 flex items-center justify-center p-8">
          <div className="bg-offWhite max-w-2xl w-full p-12 rounded-3xl relative shadow-2xl">
            <button onClick={() => setShowAbout(false)} className="absolute top-6 right-8 font-black text-3xl hover:opacity-50 transition-opacity">×</button>
            <h2 className="font-sans font-black text-4xl mb-6 tracking-tighter uppercase">About Rower</h2>
            <p className="font-sans text-xl leading-relaxed mb-4 font-medium opacity-80">
              A bespoke, privacy-first single page dashboard for your rowing machine.
            </p>
            <p className="font-sans text-lg leading-relaxed opacity-80">
              It connects directly via the secure Web Bluetooth API to extract and visualize your real-time stroke, distance, and power telemetry in a clean, distraction-free interface. Your historical sessions never leave this device.
            </p>
          </div>
        </div>
      )}

      {/* Disconnected Splash State */}
      {appState === 'disconnected' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-offWhite">
          <h1 className="font-sans font-black text-[12vw] leading-none uppercase tracking-tighter mb-12">Rower</h1>
          <button 
            onClick={connect}
            className="px-12 py-6 rounded-full font-black text-2xl uppercase tracking-widest bg-charcoal text-offWhite hover:bg-charcoal/80 transition-all hover:scale-105 shadow-xl"
          >
            Connect to Rower
          </button>
          
          <button 
            onClick={() => setShowAbout(true)} 
            className="mt-16 flex items-center gap-2 font-bold opacity-50 hover:opacity-100 transition-opacity uppercase tracking-widest"
          >
            <MdInfoOutline className="w-6 h-6" /> About
          </button>
        </div>
      )}

      {/* Active Workout State UI */}
      {appState !== 'disconnected' && (
        <>
          {/* Start Workout Modal Overlay (Ready State) */}
          {appState === 'ready' && (
             <div className="fixed inset-0 bg-offWhite/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center">
                <button 
                  onClick={() => setAppState('recording')}
                  className="px-16 py-8 rounded-full font-black text-4xl md:text-6xl uppercase tracking-tighter transition-all bg-charcoal text-offWhite hover:scale-105 shadow-2xl animate-pulse"
                >
                  Start Workout
                </button>
                <p className="mt-8 font-bold opacity-50 tracking-widest uppercase">Tap to Begin Tracking</p>
             </div>
          )}

          {/* Floating Spacebar Hint (Recording State) */}
          {appState === 'recording' && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-charcoal/90 text-offWhite px-6 py-3 rounded-full font-sans text-sm font-bold shadow-2xl flex items-center gap-3 backdrop-blur-md z-50">
              <kbd className="bg-offWhite text-charcoal px-3 py-1 rounded-md text-xs font-black tracking-widest shadow-sm">SPACE</kbd>
              <span className="opacity-90 tracking-wide uppercase">End Workout</span>
            </div>
          )}

          {/* Header */}
          <header className="w-full px-8 py-6 flex items-center justify-between border-b-4 border-charcoal mb-0">
            <h1 className="font-sans font-black text-4xl md:text-5xl uppercase tracking-tighter">Rower</h1>
            <div className="flex gap-4">
              <button 
                onClick={handleFinishRow}
                className="px-6 py-2 rounded-full font-bold transition-colors bg-charcoal text-offWhite hover:bg-charcoal/80"
              >
                End Workout
              </button>
              <button 
                onClick={disconnect}
                className="px-6 py-2 rounded-full font-bold bg-charcoal/10 border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-offWhite transition-colors"
                title="Disconnect Device"
              >
                Disconnect
              </button>
            </div>
          </header>

          <div className="w-full flex flex-col gap-0">
            {/* Main Metrics Area: FULL WIDTH AND VIEW HEIGHT */}
            <section className="w-full min-h-[calc(100dvh-95px)] flex flex-col shrink-0">
              <DashboardMetrics metrics={metrics} />
            </section>

            {/* Session Analysis Area */}
            {latestRecord?.sessionData && (
              <section className="w-full px-8 py-16 border-t-8 border-charcoal">
                <SessionChart data={latestRecord.sessionData} />
              </section>
            )}

            {/* History Area */}
            <section className="w-full px-8 py-16 border-t-8 border-charcoal bg-charcoal/5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-sans font-black text-4xl uppercase tracking-tighter">Row History</h2>
                {latestRecord && <ShareButton record={latestRecord} />}
              </div>
              <HistoryChart history={history} />
              {history.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={clearHistory}
                    className="text-sm font-bold text-red-500 hover:text-red-700 uppercase tracking-wider"
                  >
                    Clear History
                  </button>
                </div>
              )}
            </section>

          </div>
        </>
      )}

      {/* Discovery / Diagnostic Logs (Always visible if there are logs, even in error states) */}
      {logs.length > 0 && (
        <section className="w-full max-w-4xl px-8 pb-12 mt-8 z-30 relative">
          <h2 className="font-sans font-black text-2xl uppercase tracking-tighter mb-4 border-b-2 border-charcoal pb-2">Diagnostic Logs</h2>
          <div className="bg-charcoal text-green-400 font-mono text-xs p-4 rounded-xl overflow-y-auto h-64 shadow-inner">
            {logs.map((log, i) => (
              <div key={i} className="mb-1 leading-relaxed border-b border-green-400/10 pb-1">
                <span className="text-gray-500 mr-2">
                  {new Date().toLocaleTimeString('en-US', { hour12: false })}
                </span> 
                {log}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
